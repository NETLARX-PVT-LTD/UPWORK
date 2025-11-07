// ---------------------------------------------------------------------
// <copyright file="TwilioController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.TwilioIntegration
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models.TwilioIntegration;
    using System;
    using System.Threading.Tasks;
    using Twilio;
    using Twilio.Rest.Api.V2010;
    using Twilio.Rest.Api.V2010.Account;
    using Twilio.TwiML;

    [Route("api/[controller]")]
    [ApiController]
    public class TwilioController : ControllerBase
    {

        private readonly IBotDbContext _context;
        public TwilioController(IBotDbContext context)
        {
            _context = context;
        }

        [HttpGet("config")]
        public async Task<IActionResult> GetTwilioConfig()
        {
            // Example: get logged-in userId (from claims or auth context)
            var userId = "user-123"; // Replace with actual authenticated user

            var config = await _context.TwilioConfigs
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (config == null)
                return NotFound(new { message = "No configuration found" });

            var result = new TwilioConfigDto
            {
                AccountSid = config.AccountSid,
                SmsNumber = config.SmsNumber,
                SenderId = config.SenderId,
                WebhookUrl = config.WebhookUrl,
                MessageHandling = new MessageHandlingConfig
                {
                    Type = config.MessageHandlingType,
                    Method = config.MessageHandlingMethod
                }
            };

            return Ok(result);
        }


        // Save Twilio configuration
        [HttpPost("configure")]
        public async Task<IActionResult> SaveTwilioConfig([FromBody] TwilioConfigDto request)
        {
            if (request == null)
                return BadRequest(new { message = "Invalid configuration request" });

            // Example: get logged-in userId (from claims or auth context)
            var userId = "user-123"; // Replace with real user identity

            var config = new TwilioConfig
            {
                UserId = userId,
                AccountSid = request.AccountSid,
                AuthToken = request.AuthToken,  // ⚠ Store encrypted
                SmsNumber = request.SmsNumber,
                SenderId = request.SenderId,
                WebhookUrl = request.WebhookUrl,
                MessageHandlingType = request.MessageHandling?.Type,
                MessageHandlingMethod = request.MessageHandling?.Method
            };

            _context.TwilioConfigs.Add(config);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Twilio configuration saved successfully" });
        }


        [HttpPost("test-connection")]
        public IActionResult TestConnection([FromBody] TwilioTestRequest request)
        {
            if (string.IsNullOrEmpty(request.AccountSid) || string.IsNullOrEmpty(request.AuthToken))
                return BadRequest(new { message = "AccountSid and AuthToken are required" });

            try
            {
                // Initialize Twilio client
                TwilioClient.Init(request.AccountSid, request.AuthToken);

                // Simple test: fetch the account resource
                var account = Twilio.Rest.Api.V2010.AccountResource.Fetch(pathSid: request.AccountSid);

                if (account != null && account.Status == AccountResource.StatusEnum.Active)
                {
                    return Ok(new { success = true, message = "Connection successful" });
                }

                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }
            catch (Twilio.Exceptions.AuthenticationException)
            {
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error connecting to Twilio", error = ex.Message });
            }
        }

        [HttpPost("sms")]
        public IActionResult ReceiveSms([FromForm] string From, [FromForm] string Body)
        {
            Console.WriteLine($"📩 Incoming SMS from {From}: {Body}");

            // Example bot logic
            string replyMessage = Body.ToLower() switch
            {
                string msg when msg.Contains("hello") => "Hi there! 👋 How can I help you today?",
                string msg when msg.Contains("help") => "You can ask me about: status, info, support.",
                _ => "Sorry, I didn’t understand that. Try 'hello' or 'help'."
            };

            // Build TwiML response
            var response = new MessagingResponse();
            response.Message(replyMessage);

            // Return TwiML to Twilio (Twilio will send SMS to the user)
            return Content(response.ToString(), "text/xml");
        }
    }
}
