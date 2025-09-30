
namespace Netlarx.Products.Gobot.Controllers.EmailSettings
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Helper;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models.Email_Setting;
    using System;
    using System.Linq;
    using System.Net.Mail;
    using System.Threading.Tasks;
    using MailKit.Net.Smtp;
    using MailKit.Security;

    [ApiController]
    [Route("api/partner/email")]
    public class EmailController : ControllerBase
    {
        private readonly IBotDbContext _db;

        public EmailController(IBotDbContext db)
        {
            _db = db;
        }

        [HttpPost("config")]
        public async Task<IActionResult> SaveEmailSettings([FromBody] EmailSettingsRequest request)
        {
            if (string.IsNullOrEmpty(request.SmtpPassword))
                return BadRequest(new { status = "error", message = "SMTP password is required" });

            // Encrypt the password before saving
            var encryptedPassword = EncryptionHelper.Encrypt(request.SmtpPassword);

            var settings = new EmailSetting
            {
                Id = Guid.NewGuid(),
                SenderName = request.SenderName,
                SecurityProtocol = request.SecurityProtocol,
                SmtpHost = request.SmtpHost,
                SmtpPort = request.SmtpPort,
                SmtpUsername = request.SmtpUsername,
                SmtpEmail = request.SmtpEmail,
                SmtpPassword = encryptedPassword
            };

            _db.EmailSettings.Add(settings);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                status = "success",
                message = "Email settings saved securely"
            });
        }

        [HttpGet("config")]
        public async Task<IActionResult> GetEmailSettings()
        {
            // Get the latest email settings based on CreatedAt
            var settings = await _db.EmailSettings
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();

            if (settings == null)
                return NotFound(new { status = "error", message = "No email settings found." });

            return Ok(new
            {
                senderName = settings.SenderName,
                securityProtocol = settings.SecurityProtocol,
                smtpHost = settings.SmtpHost,
                smtpPort = settings.SmtpPort,
                smtpUsername = settings.SmtpUsername,
                smtpEmail = settings.SmtpEmail,
                smtpPassword = "********" // Mask password
            });
        }

        [HttpPost("test-connection")]
        public async Task<IActionResult> TestEmailConnection([FromBody] EmailSettingsRequest request)
        {
            if (string.IsNullOrEmpty(request.SmtpHost) ||
                string.IsNullOrEmpty(request.SmtpPort) ||
                string.IsNullOrEmpty(request.SmtpUsername) ||
                string.IsNullOrEmpty(request.SmtpPassword))
            {
                return BadRequest(new { status = "error", message = "SMTP credentials are required." });
            }

            try
            {
                //var client1= new System.Net.Mail.SmtpClient(); // legacy
                var client = new MailKit.Net.Smtp.SmtpClient(); //  odern


                int port = int.Parse(request.SmtpPort);
                SecureSocketOptions socketOption = request.SecurityProtocol.ToUpper() switch
                {
                    "SSL" => SecureSocketOptions.SslOnConnect,
                    "TLS" => SecureSocketOptions.StartTls,
                    _ => SecureSocketOptions.Auto
                };

                await client.ConnectAsync(request.SmtpHost, port, socketOption);

                await client.AuthenticateAsync(request.SmtpUsername, request.SmtpPassword);

                await client.DisconnectAsync(true);

                return Ok(new
                {
                    status = "success",
                    message = "SMTP connection successful."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = $"SMTP connection failed: {ex.Message}"
                });
            }
        }
    }
}