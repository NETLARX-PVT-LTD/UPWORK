// ---------------------------------------------------------------------
// <copyright file="FacebookService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.FacebookIntegration
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using Newtonsoft.Json.Linq;
    using System;
    using System.Collections.Generic;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;


    [ApiController]
    [Route("api/facebook")]
    public class FacebookController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IBotDbContext _context;

        private const string AppId = "YOUR_APP_ID";
        private const string AppSecret = "YOUR_APP_SECRET";

        public FacebookController(IHttpClientFactory httpClientFactory, IBotDbContext context)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        /// <summary>
        /// Sync user pages by exchanging short-lived token for long-lived token
        /// </summary>
        [HttpPost("sync-pages")]
        public async Task<IActionResult> SyncPages([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request.ShortLivedAccessToken))
                return BadRequest(new { status = "error", message = "Access token is required" });

            var httpClient = _httpClientFactory.CreateClient();

            try
            {
                // Step 1: Exchange short-lived token for a long-lived token
                var tokenExchangeUrl =
                    $"https://graph.facebook.com/v20.0/oauth/access_token?" +
                    $"grant_type=fb_exchange_token&client_id={AppId}&client_secret={AppSecret}&fb_exchange_token={request.ShortLivedAccessToken}";

                var tokenResponse = await httpClient.GetStringAsync(tokenExchangeUrl);
                var tokenJson = JObject.Parse(tokenResponse);
                var longLivedUserToken = tokenJson["access_token"]?.ToString();

                if (string.IsNullOrEmpty(longLivedUserToken))
                    return BadRequest(new { status = "error", message = "Failed to exchange token" });

                // Step 2: Fetch user-managed pages
                var pagesUrl = $"https://graph.facebook.com/v20.0/me/accounts?access_token={longLivedUserToken}";
                var pagesResponse = await httpClient.GetStringAsync(pagesUrl);
                var pagesJson = JObject.Parse(pagesResponse);

                var pagesList = pagesJson["data"];

                // Step 3: Save long-lived token and page tokens in DB
                var userToken = new UserToken
                {
                    Id = Guid.NewGuid(),
                    LongLivedUserToken = longLivedUserToken
                };

                _context.UserTokens.Add(userToken);

                foreach (var page in pagesList)
                {
                    var pageEntity = new PageToken
                    {
                        Id = Guid.NewGuid(),
                        PageId = page["id"]?.ToString(),
                        Name = page["name"]?.ToString(),
                        Category = page["category"]?.ToString(),
                        PageAccessToken = page["access_token"]?.ToString(),
                        UserTokenId = userToken.Id
                    };
                    _context.PageTokens.Add(pageEntity);
                }

                await _context.SaveChangesAsync();

                // Step 4: Return response
                return Ok(new
                {
                    status = "success",
                    pages = pagesList
                });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

        /// <summary>
        /// Connects a Facebook Page to a bot and subscribes it to webhook
        /// </summary>
        [HttpPost("connect-bot")]
        public async Task<IActionResult> ConnectBot([FromBody] ConnectBotRequest request)
        {
            if (string.IsNullOrEmpty(request.PageId) || string.IsNullOrEmpty(request.BotName))
                return BadRequest(new { status = "error", message = "PageId and BotName are required." });

            try
            {
                // Step 1: Get Page Access Token from DB
                var pageToken = await _context.PageTokens.FirstOrDefaultAsync(p => p.PageId == request.PageId);
                if (pageToken == null)
                    return NotFound(new { status = "error", message = "Page not found in database." });

                var httpClient = _httpClientFactory.CreateClient();

                // Step 2: Subscribe the Page to Webhook
                var subscribeUrl =
                    $"https://graph.facebook.com/v20.0/{request.PageId}/subscribed_apps?access_token={pageToken.PageAccessToken}";

                var content = new StringContent("{}", Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(subscribeUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new
                    {
                        status = "error",
                        message = "Failed to subscribe page to webhook.",
                        details = responseContent
                    });
                }

                // Step 3: Save Bot Connection in DB
                var botConnection = new BotConnection
                {
                    Id = Guid.NewGuid(),
                    PageId = request.PageId,
                    BotName = request.BotName,
                    WebhookStatus = "connected"
                };

                _context.BotConnections.Add(botConnection);
                await _context.SaveChangesAsync();

                // Step 4: Response
                return Ok(new
                {
                    status = "success",
                    message = "Page successfully connected to bot."
                });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

        /// <summary>
        /// Disconnects a Facebook Page from a bot by unsubscribing webhook
        /// </summary>
        [HttpPost("disconnect-bot")]
        public async Task<IActionResult> DisconnectBot([FromBody] DisconnectBotRequest request)
        {
            if (string.IsNullOrEmpty(request.PageId))
                return BadRequest(new { status = "error", message = "PageId is required." });

            try
            {
                // Step 1: Get Page Access Token from DB
                var pageToken = await _context.PageTokens.FirstOrDefaultAsync(p => p.PageId == request.PageId);
                if (pageToken == null)
                    return NotFound(new { status = "error", message = "Page not found in database." });

                var httpClient = _httpClientFactory.CreateClient();

                // Step 2: Unsubscribe Page from Webhook
                var unsubscribeUrl =
                    $"https://graph.facebook.com/v20.0/{request.PageId}/subscribed_apps?access_token={pageToken.PageAccessToken}";

                var response = await httpClient.DeleteAsync(unsubscribeUrl);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new
                    {
                        status = "error",
                        message = "Failed to unsubscribe page from webhook.",
                        details = responseContent
                    });
                }

                // Step 3: Update BotConnection in DB
                var botConnection = await _context.BotConnections.FirstOrDefaultAsync(b => b.PageId == request.PageId);
                if (botConnection != null)
                {
                    botConnection.WebhookStatus = "disconnected";
                    _context.BotConnections.Update(botConnection);
                    await _context.SaveChangesAsync();
                }

                // Step 4: Response
                return Ok(new
                {
                    status = "success",
                    message = "Page successfully disconnected from bot."
                });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> ReceiveWebhook([FromBody] JObject body)
        {
            try
            {
                if (body["object"]?.ToString() == "page")
                {
                    foreach (var entry in body["entry"]!)
                    {
                        var pageId = entry["id"]?.ToString(); //Get Page ID from webhook
                        if (string.IsNullOrEmpty(pageId)) continue;

                        foreach (var messagingEvent in entry["messaging"]!)
                        {
                            var senderId = messagingEvent["sender"]?["id"]?.ToString();
                            var messageText = messagingEvent["message"]?["text"]?.ToString();

                            if (!string.IsNullOrEmpty(senderId) && !string.IsNullOrEmpty(messageText))
                            {
                                // Use correct Page Access Token for this page
                                var pageToken = await _context.PageTokens.FirstOrDefaultAsync(p => p.PageId == pageId);
                                if (pageToken != null)
                                {
                                    await SendMessageAsync(senderId, messageText, pageToken.PageAccessToken);
                                }
                            }
                        }
                    }
                }

                return Ok();
            }
            catch
            {
                return Ok();
            }
        }

        // Send reply using the correct page access token
        private async Task SendMessageAsync(string recipientId, string text, string pageAccessToken)
        {
            var httpClient = _httpClientFactory.CreateClient();

            var payload = new
            {
                recipient = new { id = recipientId },
                message = new { text = text }
            };

            var json = JObject.FromObject(payload).ToString();
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = $"https://graph.facebook.com/v20.0/me/messages?access_token={pageAccessToken}";
            await httpClient.PostAsync(url, content);
        }
    }
}
