// ---------------------------------------------------------------------
// <copyright file="TelegramController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Gobot.Controllers.TelegramIntegration
{
    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Product.Gobot.Models.TelegramIntegration;
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Text.Json;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/[controller]")]
    public class TelegramController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public TelegramController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// Validate Telegram Bot Token
        /// </summary>
        /// <param name="accessToken">Telegram Bot API token</param>
        /// <returns>Basic bot information if valid</returns>
        [HttpGet("validate-token/{accessToken}")]
        public async Task<IActionResult> ValidateToken(string accessToken)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
                return BadRequest(new { message = "Access token is required." });

            try
            {
                var url = $"https://api.telegram.org/bot{accessToken}/getMe";

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return BadRequest(new { message = "Invalid token or unable to reach Telegram API." });

                var json = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (!root.TryGetProperty("ok", out var okProp) || !okProp.GetBoolean())
                    return BadRequest(new { message = "Invalid Telegram bot token." });

                var result = root.GetProperty("result");

                return Ok(new
                {
                    id = result.GetProperty("id").GetInt64(),
                    is_bot = result.GetProperty("is_bot").GetBoolean(),
                    first_name = result.GetProperty("first_name").GetString(),
                    username = result.GetProperty("username").GetString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error validating token.", error = ex.Message });
            }
        }

        /// <summary>
        /// Set Telegram Bot Webhook
        /// </summary>
        /// <param name="request">Access token and webhook URL</param>
        /// <returns>Webhook set status</returns>
        [HttpPost("set-webhook")]
        public async Task<IActionResult> SetWebhook([FromBody] SetWebhookRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.AccessToken) || string.IsNullOrWhiteSpace(request.Url))
                return BadRequest(new { message = "AccessToken and Url are required." });

            try
            {
                var apiUrl = $"https://api.telegram.org/bot{request.AccessToken}/setWebhook";

                var payload = JsonSerializer.Serialize(new { url = request.Url });
                var content = new StringContent(payload, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(apiUrl, content);
                var json = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    // Return your custom response instead of Telegram's raw response
                    return Ok(new
                    {
                        ok = true,
                        description = "Webhook was set"
                    });
                }

                // If Telegram API failed, forward its error
                return StatusCode((int)response.StatusCode, json);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error setting webhook.", error = ex.Message });
            }
        }


        [HttpGet("webhook-info/{accessToken}")]
        public async Task<TelegramWebhookInfo> GetWebhookInfo(string accessToken)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                return new TelegramWebhookInfo
                {
                    Status = "Inactive",
                    Message = "AccessToken is required."
                };
            }

            try
            {
                var apiUrl = $"https://api.telegram.org/bot{accessToken}/getWebhookInfo";
                var response = await _httpClient.GetAsync(apiUrl);
                var json = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return new TelegramWebhookInfo
                    {
                        Status = "Error",
                        Message = $"Telegram API returned {response.StatusCode}"
                    };
                }

                var telegramResponse = JsonSerializer.Deserialize<TelegramWebhookInfoResponse>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (telegramResponse == null || telegramResponse.Result == null)
                {
                    return new TelegramWebhookInfo
                    {
                        Status = "Inactive",
                        Message = "Webhook info not found."
                    };
                }

                var webhookInfo = telegramResponse.Result;

                string status = string.IsNullOrWhiteSpace(webhookInfo.Url)
                    ? "Inactive"
                    : !string.IsNullOrWhiteSpace(webhookInfo.LastErrorMessage)
                        ? "Error"
                        : "Active";

                return new TelegramWebhookInfo
                {
                    Url = webhookInfo.Url,
                    HasCustomCertificate = webhookInfo.HasCustomCertificate,
                    PendingUpdateCount = webhookInfo.PendingUpdateCount,
                    LastErrorDate = webhookInfo.LastErrorDate,
                    LastErrorMessage = webhookInfo.LastErrorMessage,
                    Status = status,
                    Message = "Success"
                };
            }
            catch (Exception ex)
            {
                return new TelegramWebhookInfo
                {
                    Status = "Error",
                    Message = $"Exception: {ex.Message}"
                };
            }
        }

        [HttpGet("delete-webhook/{accessToken}")]
        public async Task<WebhookActionResponse> DeleteWebhook(string accessToken)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                return new WebhookActionResponse
                {
                    Ok = false,
                    Description = "AccessToken is required."
                };
            }

            try
            {
                var apiUrl = $"https://api.telegram.org/bot{accessToken}/deleteWebhook";
                var response = await _httpClient.GetAsync(apiUrl);
                var json = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return new WebhookActionResponse
                    {
                        Ok = false,
                        Description = $"Telegram API returned {response.StatusCode}: {json}"
                    };
                }

                // Deserialize Telegram response to check success
                var telegramResponse = JsonSerializer.Deserialize<TelegramActionResponse>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return new WebhookActionResponse
                {
                    Ok = telegramResponse?.Ok ?? false,
                    Description = telegramResponse?.Description ?? "Webhook deletion failed"
                };
            }
            catch (Exception ex)
            {
                return new WebhookActionResponse
                {
                    Ok = false,
                    Description = $"Exception: {ex.Message}"
                };
            }
        }
    }
}
