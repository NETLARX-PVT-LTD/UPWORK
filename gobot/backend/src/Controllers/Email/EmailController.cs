using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Netlarx.Products.Gobot.Models;
using System.Net.Mail;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Gobot.Controllers.Email
{
    using Chatbot;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Controllers.Bots;
    using Netlarx.Products.Gobot.Pipelines;
    using SendGrid;
    using SendGrid.Helpers.Mail;

    [Route("api/email")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailController> _logger;

        public EmailController(IConfiguration config, ILogger<EmailController> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ✅ POST /api/email/send-bot-details
        [HttpPost("send-bot-details")]
        [MiddlewareFilter(typeof(ProtoPipeline))]
        public async Task<IActionResult> SendBotDetails()
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not EmailRequestBlock request)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (string.IsNullOrEmpty(request.To) || string.IsNullOrEmpty(request.Subject))
                return BadRequest(new { message = "Recipient email and subject are required." });

            // Build email content
            var emailContent = $@"
                <h2>{request.Subject}</h2>
                <p>{request.Message}</p>
                <ul>
                    <li><strong>Bot ID:</strong> {request.BotId}</li>
                    <li><strong>API Key:</strong> {request.ApiKey}</li>
                    <li><strong>Landing URL:</strong> {request.LandingUrl}</li>
                    <li><strong>Embed Code:</strong> {request.EmbedCode}</li>
                </ul>
            ";

            // Send email using SendGrid
            var apiKey = _config["SendGrid:ApiKey"]; // stored securely in appsettings.json or Azure KeyVault
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress("noreply@yourdomain.com", "Chatbot Service");
            var to = new EmailAddress(request.To);
            var msg = MailHelper.CreateSingleEmail(from, to, request.Subject, request.Message, emailContent);
            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
                return Ok(new { success = true, message = "Email sent successfully." });

            return StatusCode(500, new { success = false, message = "Failed to send email." });
        }
    }
}
