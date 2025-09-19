// ---------------------------------------------------------------------
// <copyright file="FacebookService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Facebook_Service
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using System;
    using System.Collections.Generic;
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;

    public class FacebookService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<FacebookService> _logger;

        public FacebookService(HttpClient httpClient, IConfiguration config, ILogger<FacebookService> logger)
        {
            _httpClient = httpClient;
            _config = config;
            _logger = logger;
        }

        public async Task<Dictionary<string, string>> GetPageAccessTokensAsync()
        {
            var userToken = _config["Facebook:UserAccessToken"];
            var url = $"https://graph.facebook.com/v18.0/me/accounts?access_token={userToken}";

            var response = await _httpClient.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to fetch pages: {Error}", content);
                throw new Exception("Unable to fetch page tokens");
            }

            var json = JsonDocument.Parse(content);
            var tokens = new Dictionary<string, string>();

            foreach (var page in json.RootElement.GetProperty("data").EnumerateArray())
            {
                var pageId = page.GetProperty("id").GetString();
                var accessToken = page.GetProperty("access_token").GetString();
                tokens[pageId] = accessToken;
            }

            return tokens;
        }
    }
}
