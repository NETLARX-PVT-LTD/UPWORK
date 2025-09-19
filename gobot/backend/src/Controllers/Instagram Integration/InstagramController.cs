// ---------------------------------------------------------------------
// <copyright file="InstagramController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace InstagramPublisher.Controllers
{
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microsoft.Identity.Client;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;

    [Route("api/instagram")]
    [ApiController]
    public class InstagramController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IBotDbContext _db;
        private readonly ILogger<InstagramController> _logger;


        public InstagramController(HttpClient httpClient, IBotDbContext db, ILogger<InstagramController> logger)
        {
            _httpClient = httpClient;
            _db = db;
            _logger = logger;
        }

        public class SyncPagesRequest
        {
            public string UserAccessToken { get; set; }
        }

        public class InstagramPage
        {
            public string IgAccountId { get; set; }
            public string PageName { get; set; }
            public string Username { get; set; }
            public string ProfilePictureUrl { get; set; }
            public string PageAccessToken { get; set; }
        }

        public class SyncPagesResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; }
            public InstagramPage[] Pages { get; set; }
        }
        public class UnpublishBotRequest
        {
            public string IgAccountId { get; set; }
            public string PageAccessToken { get; set; }
        }


        [HttpPost("sync-pages")]
        public async Task<IActionResult> SyncPages([FromBody] SyncPagesRequest request)
        {
            if (string.IsNullOrEmpty(request.UserAccessToken))
                return BadRequest(new { success = false, message = "Access token is required." });

            try
            {
                // Step 1: Exchange short-lived token for long-lived token
                var tokenExchangeUrl = $"https://graph.facebook.com/v18.0/oauth/access_token" +
                                       $"?grant_type=fb_exchange_token" +
                                       $"&client_id=YOUR_APP_ID" +
                                       $"&client_secret=YOUR_APP_SECRET" +
                                       $"&fb_exchange_token={request.UserAccessToken}";

                var tokenResponse = await _httpClient.GetStringAsync(tokenExchangeUrl);
                using var tokenJson = JsonDocument.Parse(tokenResponse);
                var longLivedToken = tokenJson.RootElement.GetProperty("access_token").GetString();

                // Step 2: Get user pages
                var pagesUrl = $"https://graph.facebook.com/me/accounts?access_token={longLivedToken}";
                var pagesResponse = await _httpClient.GetStringAsync(pagesUrl);
                using var pagesJson = JsonDocument.Parse(pagesResponse);

                var pagesList = new System.Collections.Generic.List<InstagramPage>();

                foreach (var page in pagesJson.RootElement.GetProperty("data").EnumerateArray())
                {
                    // Check if page has an Instagram Business Account
                    if (page.TryGetProperty("instagram_business_account", out var igAccount))
                    {
                        pagesList.Add(new InstagramPage
                        {
                            IgAccountId = igAccount.GetProperty("id").GetString(),
                            PageName = page.GetProperty("name").GetString(),
                            Username = "", // You can fetch username via another IG Graph API call
                            ProfilePictureUrl = "", // Optional: fetch profile picture if needed
                            PageAccessToken = page.GetProperty("access_token").GetString()
                        });
                    }
                }

                return Ok(new SyncPagesResponse
                {
                    Success = true,
                    Message = "Successfully synchronized user's pages.",
                    Pages = pagesList.ToArray()
                });
            }
            catch (HttpRequestException ex)
            {
                return BadRequest(new SyncPagesResponse
                {
                    Success = false,
                    Message = "Failed to synchronize pages. " + ex.Message,
                    Pages = new InstagramPage[] { }
                });
            }
        }

        [HttpPost("publish-bot")]
        public async Task<IActionResult> PublishBot([FromBody] InstagramPublishBotRequest req)
        {
            try
            {
                // Generate BotId
                var botId = Guid.NewGuid().ToString("N");

                // Save bot configuration
                var botConfig = new BotConfig
                {
                    BotConfigId = Guid.NewGuid().ToString("N"),
                    BotId = req.igAccountId,
                    BotName = req.botConfig.name,
                    WelcomeMessage = req.botConfig.welcomeMessage,
                    InputPlaceholder = req.botConfig.fallbackMessage,
                    FallbackMessage = req.botConfig.fallbackMessage,
                    IsActive = req.botConfig.isActive,
                    PrimaryColor = "#000000",
                    SecondaryColor = "#ffffff",
                    ImageURL = null
                };

                _db.BotConfigs.Add(botConfig);
                await _db.SaveChangesAsync();

                // -------------------------------
                // Step 2: Subscribe the IG page
                // -------------------------------

                var webhookUrl = "https://your-backend.com/api/instagram/webhook"; // Your backend webhook URL
                var subscriptionUrl = $"https://graph.facebook.com/v18.0/{req.igAccountId}/subscribed_apps";

                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("access_token", req.pageAccessToken),
                    //new KeyValuePair<string, string>("subscribed_fields", "messages,comments,mentions") // fields you want
                });

                var response = await _httpClient.PostAsync(subscriptionUrl, content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to subscribe IG page: {Error}", errorContent);
                    return StatusCode(500, new
                    {
                        success = false,
                        message = "Bot saved but failed to subscribe page.",
                        botId
                    });
                }

                // Success
                return Ok(new
                {
                    success = true,
                    message = "Bot published successfully and page subscribed to webhook!",
                    botId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to publish Instagram bot");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Internal server error while publishing bot.",
                    botId = (string)null
                });
            }
        }

        [HttpPost("unpublish-bot")]
        public async Task<IActionResult> UnpublishBot([FromBody] UnpublishBotRequest req)
        {
            if (string.IsNullOrEmpty(req.IgAccountId) || string.IsNullOrEmpty(req.PageAccessToken))
                return BadRequest(new { success = false, message = "IgAccountId and PageAccessToken are required." });

            try
            {
                // Step 1: Unsubscribe from webhook
                var unsubscribeUrl = $"https://graph.facebook.com/v18.0/{req.IgAccountId}/subscribed_apps?access_token={req.PageAccessToken}";

                var response = await _httpClient.DeleteAsync(unsubscribeUrl);
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to unsubscribe IG account {IgAccountId}: {Error}", req.IgAccountId, errorBody);
                    return StatusCode(500, new { success = false, message = "Failed to unsubscribe IG account from webhook." });
                }

                // Step 2: Mark bot inactive in DB
                var botConfig = await _db.BotConfigs.FirstOrDefaultAsync(b => b.BotId == req.IgAccountId);
                if (botConfig != null)
                {
                    botConfig.IsActive = false;
                    await _db.SaveChangesAsync();
                }

                return Ok(new
                {
                    success = true,
                    message = "Bot unpublished successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unpublishing bot for IG account {IgAccountId}", req.IgAccountId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Internal server error while unpublishing bot."
                });
            }
        }


    }
}
