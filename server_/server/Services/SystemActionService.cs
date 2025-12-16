using Microsoft.Win32;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
// Lưu ý: Class 'Screen' nằm trong System.Windows.Forms.
// Hãy đảm bảo project của bạn có tham chiếu đến System.Windows.Forms hoặc là project WinForms/WPF.
using System.Windows.Forms; 

namespace server_os.Services
{
    public class SystemActionService
    {
        // Cache để tính toán CPU Usage (So sánh thời gian cũ và mới)
        private static Dictionary<int, TimeSpan> _prevCpuTimes = new Dictionary<int, TimeSpan>();
        private static DateTime _prevCheckTime = DateTime.Now;

        // --- 1. SHUTDOWN & RESTART (Giữ nguyên) ---
        public void Shutdown() => Process.Start("shutdown", "/s /t 0");
        public void Restart() => Process.Start("shutdown", "/r /t 0");

        // --- 2. CAPTURE SCREEN (Đã sửa Warning CS8602) ---
        public string CaptureScreenToBase64()
        {
            try
            {
                // SỬA: Kiểm tra null trước khi truy cập Bounds
                if (Screen.PrimaryScreen == null)
                {
                    return "Error: No screen detected (PrimaryScreen is null)";
                }

                Rectangle bounds = Screen.PrimaryScreen.Bounds;
                using (Bitmap bitmap = new Bitmap(bounds.Width, bounds.Height))
                {
                    using (Graphics g = Graphics.FromImage(bitmap))
                    {
                        g.CopyFromScreen(Point.Empty, Point.Empty, bounds.Size);
                    }
                    using (MemoryStream ms = new MemoryStream())
                    {
                        bitmap.Save(ms, ImageFormat.Png);
                        return Convert.ToBase64String(ms.ToArray());
                    }
                }
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        // --- 3. REAL PROCESS MANAGER (Giữ nguyên) ---
        public List<string> GetProcessList()
        {
            List<string> list = new List<string>();
            Process[] processes = Process.GetProcesses();

            // Tính toán thời gian trôi qua từ lần check trước
            var now = DateTime.Now;
            double timeDiff = (now - _prevCheckTime).TotalMilliseconds;
            _prevCheckTime = now;

            foreach (Process p in processes)
            {
                try
                {
                    // 1. Lấy thông tin cơ bản (ID, Name)
                    int pid = p.Id;
                    string name = p.ProcessName;
                    string title = "";
                    string type = "PROC";

                    // Fix lỗi PID 0 (System Idle) và PID 4 (System)
                    if (pid == 0) name = "System Idle Process";
                    if (pid == 4) name = "System";

                    // 2. Lấy Title và xác định Type (APP hay PROC)
                    try
                    {
                        title = p.MainWindowTitle;
                        if (!string.IsNullOrEmpty(title)) type = "APP";
                    }
                    catch { }

                    // 3. Lấy RAM (Real Memory - Working Set)
                    // Chuyển từ Bytes -> MB
                    long memBytes = p.WorkingSet64;
                    double memMb = memBytes / 1024.0 / 1024.0;

                    // 4. Tính toán CPU % (Logic Delta)
                    double cpuUsage = 0;
                    try
                    {
                        TimeSpan currentTotalProcessorTime = p.TotalProcessorTime;

                        if (_prevCpuTimes.ContainsKey(pid) && timeDiff > 0)
                        {
                            TimeSpan prevTotalProcessorTime = _prevCpuTimes[pid];
                            double cpuUsedMs = (currentTotalProcessorTime - prevTotalProcessorTime).TotalMilliseconds;
                            // Chia cho số luồng CPU để ra % tổng thể
                            cpuUsage = (cpuUsedMs / (timeDiff * Environment.ProcessorCount)) * 100;
                        }

                        // Cập nhật lại cache cho lần sau
                        _prevCpuTimes[pid] = currentTotalProcessorTime;
                    }
                    catch
                    {
                        cpuUsage = 0;
                    }

                    // Format dữ liệu gửi về Client
                    list.Add($"[{type}] ID:{pid} | Name:{name} | Title:{title} | CPU:{cpuUsage:0.0} | RAM:{memMb:0}");
                }
                catch
                {
                    continue;
                }
            }

            // Dọn dẹp cache các PID đã chết
            var deadPids = _prevCpuTimes.Keys.Except(processes.Select(p => p.Id)).ToList();
            foreach (var pid in deadPids) _prevCpuTimes.Remove(pid);

            return list;
        }

        public string KillProcess(int pid)
        {
            try
            {
                Process p = Process.GetProcessById(pid);
                p.Kill();
                return $"Đã diệt Process ID: {pid}";
            }
            catch (Exception ex) { return "Lỗi: " + ex.Message; }
        }

        // --- 4. START APP & REGISTRY (Đã sửa Warning CS0162) ---
        private RegistryKey? GetBaseRegistryKey(string link)
        {
            if (link.Contains('\\'))
            {
                string baseKey = link.Substring(0, link.IndexOf('\\')).ToUpper();
                switch (baseKey)
                {
                    case "HKEY_CLASSES_ROOT": return Registry.ClassesRoot;
                    case "HKEY_CURRENT_USER": return Registry.CurrentUser;
                    case "HKEY_LOCAL_MACHINE": return Registry.LocalMachine;
                    case "HKEY_USERS": return Registry.Users;
                    case "HKEY_CURRENT_CONFIG": return Registry.CurrentConfig;
                }
            }
            return null;
        }

        public string StartProcess(string appName)
        {
            try { Process.Start(appName); return $"Started: {appName}"; }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        public string RegistryAction(string action, string link, string valueName, string value, string typeValue)
        {
            try
            {
                RegistryKey? baseKey = GetBaseRegistryKey(link);
                if (baseKey == null) return "Lỗi: Không tìm thấy Root Key";

                string subKeyPath = link.Substring(link.IndexOf('\\') + 1);
                RegistryKey? key = baseKey.OpenSubKey(subKeyPath, true); 

                if (key == null && action != "Create key") return "Lỗi: Không tìm thấy đường dẫn Key";

                switch (action)
                {
                    case "Create key":
                        baseKey.CreateSubKey(subKeyPath);
                        return "Tạo key thành công";

                    case "Delete key":
                        baseKey.DeleteSubKey(subKeyPath);
                        return "Xóa key thành công";

                    case "Get value":
                        object? val = key?.GetValue(valueName);
                        return val != null ? val.ToString()! : "Value rỗng hoặc không tồn tại";

                    case "Set value":
                        RegistryValueKind kind = RegistryValueKind.String;
                        if (typeValue == "Binary") kind = RegistryValueKind.Binary;
                        else if (typeValue == "DWORD") kind = RegistryValueKind.DWord;
                        else if (typeValue == "QWORD") kind = RegistryValueKind.QWord;
                        else if (typeValue == "Multi-String") kind = RegistryValueKind.MultiString;
                        else if (typeValue == "Expandable String") kind = RegistryValueKind.ExpandString;

                        key?.SetValue(valueName, value, kind);
                        return "Set value thành công";

                    case "Delete value":
                        key?.DeleteValue(valueName);
                        return "Xóa value thành công";

                    default:
                        return "Lệnh Registry không hợp lệ";
                }
            }
            catch (Exception ex)
            {
                return "Lỗi Registry: " + ex.Message;
            }
            // SỬA: Đã xóa dòng 'return "Registry logic placeholder";' thừa ở đây
        }
    }
}