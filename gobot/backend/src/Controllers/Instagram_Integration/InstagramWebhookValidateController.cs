//namespace InstagramWebhook.Controllers
//{
//    using Microsoft.AspNetCore.Mvc;
//    using Microsoft.Extensions.Logging;
//    using Newtonsoft.Json;
//    using System;
//    using System.Collections.Generic;
//    using System.Threading.Tasks;

//    [ApiController]
//    [Route("api/instagram/webhook")]
//    public class InstagramWebhookController : ControllerBase
//    {
//        private readonly ILogger<InstagramWebhookController> _logger;
//        private readonly IInstagramMessageProcessor _messageProcessor;

//        public InstagramWebhookController(
//            ILogger<InstagramWebhookController> logger,
//            IInstagramMessageProcessor messageProcessor)
//        {
//            _logger = logger;
//            _messageProcessor = messageProcessor;
//        }

//        [HttpPost]
//        public async Task<IActionResult> ReceiveWebhook()
//        {
//            try
//            {
//                // Log the incoming request for debugging purposes
//                _logger.LogInformation("Instagram webhook received");

//                // Read the request body
//                string requestBody = await new System.IO.StreamReader(Request.Body).ReadToEndAsync();

//                // Validate the request contains data
//                if (string.IsNullOrEmpty(requestBody))
//                {
//                    _logger.LogWarning("Empty request body received");
//                    return Ok(); // Still return 200 to acknowledge receipt
//                }

//                // Deserialize the Instagram webhook payload
//                var webhookPayload = JsonConvert.DeserializeObject<InstagramWebhookPayload>(requestBody);

//                // Validate the payload structure
//                if (webhookPayload == null || webhookPayload.Entry == null || webhookPayload.Entry.Count == 0)
//                {
//                    _logger.LogWarning("Invalid webhook payload structure");
//                    return Ok(); // Still return 200 to acknowledge receipt
//                }

//                // Process each entry in the webhook payload
//                foreach (var entry in webhookPayload.Entry)
//                {
//                    if (entry.Messaging != null)
//                    {
//                        foreach (var messagingEvent in entry.Messaging)
//                        {
//                            // Process the message asynchronously (fire and forget)
//                            _ = Task.Run(() => _messageProcessor.ProcessMessageAsync(messagingEvent));
//                        }
//                    }
//                }

//                // Always return 200 OK to acknowledge receipt
//                return Ok();
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error processing Instagram webhook");
//                // Still return 200 to prevent Instagram from retrying
//                return Ok();
//            }
//        }

//        // GET endpoint for webhook verification (required by Instagram/Facebook)
//        [HttpGet]
//        public IActionResult VerifyWebhook(
//            [FromQuery] string hub_mode,
//            [FromQuery] string hub_verify_token,
//            [FromQuery] string hub_challenge)
//        {
//            _logger.LogInformation("Webhook verification request received");

//            // Verify the token (you should store this securely in configuration)
//            var expectedVerifyToken = Environment.GetEnvironmentVariable("INSTAGRAM_VERIFY_TOKEN");

//            if (hub_mode == "subscribe" && hub_verify_token == expectedVerifyToken)
//            {
//                _logger.LogInformation("Webhook verified successfully");
//                return Ok(hub_challenge);
//            }

//            _logger.LogWarning("Webhook verification failed");
//            return Forbid();
//        }
//    }
//}