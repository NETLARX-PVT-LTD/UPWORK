// ---------------------------------------------------------------------
// <copyright file="IEmailService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services.Email
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Interface.Email;
    using Netlarx.Products.Gobot.ModelDTO.Email;
    using Netlarx.Products.Gobot.Result;
    using Netlarx.Products.Gobot.Validations;
    using SendGrid;
    using SendGrid.Helpers.Mail;
    using System.Net;
    using System.Threading.Tasks;

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task<Result> SendBotDetailsAsync(EmailBotDetailRequest request, Errors errors)
        {
            // Validation
            var check = UniversalValidation.Validate(request, errors);
            if (!check)
            {
                return new Result(false, errors, "400");
            }

            try
            {
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

                var apiKey = _config["SendGrid:ApiKey"];
                var client = new SendGridClient(apiKey);
                var from = new EmailAddress("noreply@yourdomain.com", "Chatbot Service");
                var to = new EmailAddress(request.To);
                var msg = MailHelper.CreateSingleEmail(from, to, request.Subject, request.Message, emailContent);
                var response = await client.SendEmailAsync(msg);

                if (response.StatusCode == HttpStatusCode.Accepted)
                {
                    return new Result(false, null, "200");
                }

                _logger.LogError("SendGrid failed with status code {StatusCode}", response.StatusCode);
                errors.Fill(FailureCode.InternalServerError, "Failed to send email");
                return new Result(false, errors, "500");
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error sending email");
                errors.Fill(FailureCode.InternalServerError, $"Server Error while sending email {ex.Message}");
                return new Result(false, errors, "500");
            }
        }
    }
}
