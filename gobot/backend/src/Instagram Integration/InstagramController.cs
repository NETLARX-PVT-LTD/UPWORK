// ---------------------------------------------------------------------
// <copyright file="InstagramController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace InstagramPublisher.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;

    [Route("api/instagram")]
    [ApiController]
    public class InstagramController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public InstagramController(HttpClient httpClient)
        {
            _httpClient = httpClient;
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
    }
}
