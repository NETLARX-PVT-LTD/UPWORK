// ---------------------------------------------------------------------
// <copyright file="WhatsAppWebhookController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Gobot.Controllers.Whatsapp_Integration
{
    using Chatbot;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Controllers.PageResponses;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Text.Json;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class WhatsAppWebhookController : ControllerBase
    {

        private readonly HttpClient _httpClient;
        private readonly ILogger<WhatsAppWebhookController> _logger;

        public WhatsAppWebhookController(HttpClient httpClient, ILogger<WhatsAppWebhookController> logger)
        {
            _logger = logger;
            _httpClient = httpClient;
        }

        [HttpPost("validate-webhook")]
        public async Task<IActionResult> ValidateWebhook()
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not WebhookValidationRequestBlock request)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (string.IsNullOrEmpty(request.WebhookUrl) || string.IsNullOrEmpty(request.VerifyToken))
            {
                return BadRequest(new WebhookValidationResponse
                {
                    Success = false,
                    Message = "Webhook URL and Verify Token are required."
                });
            }

            try
            {
                // Simulate challenge payload
                var challengePayload = new
                {
                    hub_mode = "subscribe",
                    hub_verify_token = request.VerifyToken,
                    hub_challenge = "test_challenge_12345"
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(challengePayload),
                    Encoding.UTF8,
                    "application/json"
                );

                // Send test POST to webhook URL
                var response = await _httpClient.PostAsync(request.WebhookUrl, content);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new WebhookValidationResponse
                    {
                        Success = false,
                        Message = "Webhook validation failed. Please check your URL and token."
                    });
                }

                // Read response
                var responseBody = await response.Content.ReadAsStringAsync();

                if (responseBody.Contains("test_challenge_12345", StringComparison.OrdinalIgnoreCase))
                {
                    return Ok(new WebhookValidationResponse
                    {
                        Success = true,
                        Message = "Webhook validation successful."
                    });
                }

                return BadRequest(new WebhookValidationResponse
                {
                    Success = false,
                    Message = "Webhook validation failed. Challenge response mismatch."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new WebhookValidationResponse
                {
                    Success = false,
                    Message = $"Webhook validation error: {ex.Message}"
                });
            }
        }

        [HttpPost("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not TestConnectionRequestBlock request)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (string.IsNullOrEmpty(request.AccessToken) || string.IsNullOrEmpty(request.PhoneNumberId))
            {
                return BadRequest(new TestConnectionResponse
                {
                    Success = false,
                    Message = "AccessToken and PhoneNumberId are required."
                });
            }

            try
            {
                // WhatsApp Cloud API endpoint for phone numbers
                var url = $"https://graph.facebook.com/v18.0/{request.PhoneNumberId}?fields=display_phone_number&access_token={request.AccessToken}";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new TestConnectionResponse
                    {
                        Success = false,
                        Message = "API connection failed. Invalid access token or configuration."
                    });
                }

                var responseBody = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                var phoneNumber = root.GetProperty("display_phone_number").GetString();

                return Ok(new TestConnectionResponse
                {
                    Success = true,
                    Message = "API connection test successful.",
                    Details = new
                    {
                        accountId = request.BusinessAccountId,
                        phoneNumber = $"+{phoneNumber}",
                        apiVersion = "v18.0"
                    }
                });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new TestConnectionResponse
                {
                    Success = false,
                    Message = $"API connection failed: {ex.Message}"
                });
            }
        }
    }
}
