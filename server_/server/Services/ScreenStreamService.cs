using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.Versioning;
using System.Windows.Forms; 

namespace server_os.Services
{
    [SupportedOSPlatform("windows")]
    public class ScreenStreamService
    {
        private const long QUALITY_LEVEL = 40L;

        public string CaptureScreenBase64()
        {
            try
            {
                Rectangle bounds = Screen.PrimaryScreen.Bounds;
                using (Bitmap bmp = new Bitmap(bounds.Width, bounds.Height))
                {
                    using (Graphics g = Graphics.FromImage(bmp))
                    {
                        g.CopyFromScreen(Point.Empty, Point.Empty, bounds.Size);
                        DrawCursorManual(g, bounds.X, bounds.Y);
                    }
                    return ToBase64(bmp);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SCREEN ERROR] {ex.Message}");
                return "";
            }
        }

        private void DrawCursorManual(Graphics g, int offsetX, int offsetY)
        {
            try
            {
                Point p = Cursor.Position;
                int x = p.X - offsetX;
                int y = p.Y - offsetY;
                Point[] cursorPoints = {
                    new Point(x, y), new Point(x, y + 16), new Point(x + 5, y + 14),
                    new Point(x + 5, y + 14), new Point(x + 8, y + 20), new Point(x + 10, y + 20),
                    new Point(x + 7, y + 12), new Point(x + 12, y + 12)
                };
                g.DrawPolygon(Pens.Black, cursorPoints);
                g.FillPolygon(Brushes.White, cursorPoints);
            }
            catch { }
        }

        private string ToBase64(Bitmap bmp)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                var encoder = GetEncoder(ImageFormat.Jpeg);
                var parameters = new EncoderParameters(1);
                parameters.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, QUALITY_LEVEL);
                
                bmp.Save(ms, encoder, parameters);
                return Convert.ToBase64String(ms.ToArray());
            }
        }

        private ImageCodecInfo GetEncoder(ImageFormat format)
        {
            return ImageCodecInfo.GetImageDecoders().FirstOrDefault(c => c.FormatID == format.Guid) 
                   ?? ImageCodecInfo.GetImageDecoders()[1];
        }
    }
}