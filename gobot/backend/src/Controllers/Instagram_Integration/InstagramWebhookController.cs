// ---------------------------------------------------------------------
// <copyright file="InstagramWebhookController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Instagram_Integration
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Controllers.Facebook_Service;
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Text.Json;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/instagram/webhook")]
    public class InstagramWebhookController : ControllerBase
    {
        private readonly ILogger<InstagramWebhookController> _logger;
        private readonly FacebookService _facebookService;
        private readonly HttpClient _httpClient;

        public InstagramWebhookController(ILogger<InstagramWebhookController> logger, FacebookService facebookService, HttpClient httpClient)
        {
            _logger = logger;
            _facebookService = facebookService;
            _httpClient = httpClient;
        }

        [HttpPost]
        public async Task<IActionResult> ReceiveWebhook([FromBody] JsonElement body)
        {
            try
            {
                _logger.LogInformation("Received Instagram webhook: {Payload}", body.ToString());

                if (body.TryGetProperty("entry", out var entries))
                {
                    foreach (var entry in entries.EnumerateArray())
                    {
                        if (entry.TryGetProperty("messaging", out var messagingArray))
                        {
                            foreach (var messageEvent in messagingArray.EnumerateArray())
                            {
                                var senderId = messageEvent.GetProperty("sender").GetProperty("id").GetString();
                                var messageText = messageEvent.GetProperty("message").GetProperty("text").GetString();

                                _logger.LogInformation("Message from {SenderId}: {Text}", senderId, messageText);

                                // 🔹 Fetch tokens dynamically
                                var pageTokens = await _facebookService.GetPageAccessTokensAsync();
                                var pageId = entry.GetProperty("id").GetString(); // Page ID from webhook

                                if (pageTokens.TryGetValue(pageId, out var pageAccessToken))
                                {
                                    await SendMessageToInstagram(senderId, "Thanks for your message!", pageAccessToken);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Instagram webhook");
            }

            return Ok();
        }

        private async Task SendMessageToInstagram(string recipientId, string messageText, string pageAccessToken)
        {
            var url = $"https://graph.facebook.com/v18.0/me/messages?access_token={pageAccessToken}";

            var payload = new
            {
                recipient = new { id = recipientId },
                message = new { text = messageText }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to send message: {Error}", error);
            }
        }
    }

}
