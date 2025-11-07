// ---------------------------------------------------------------------
// <copyright file="FacebookService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services.FacebookIntegration
{
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Db.FacebookIntegration.BotConnection;
    using Netlarx.Products.Gobot.Db.FacebookIntegration.PageToken;
    using Netlarx.Products.Gobot.Db.FacebookIntegration.UserToken;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Interface.FacebookIntegration;
    using Netlarx.Products.Gobot.ModelDTO.FacebookIntegration;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using Netlarx.Products.Gobot.Result;
    using Netlarx.Products.Gobot.Validations;
    using Newtonsoft.Json.Linq;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;


    public class FacebookIntegrationService : IFacebookIntegrationService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly UserTokenRepository _userTokenRepo;
        private readonly PageTokenRepository _pageTokenRepo;
        private readonly BotConnectionRepository _botConnectionRepo;
        private readonly ILogger<FacebookIntegrationService> _logger;

        private const string AppId = "YOUR_APP_ID";
        private const string AppSecret = "YOUR_APP_SECRET";

        public FacebookIntegrationService(
            IHttpClientFactory httpClientFactory,
            UserTokenRepository userTokenRepo,
            PageTokenRepository pageTokenRepo,
            BotConnectionRepository botConnectionRepo,
            ILogger<FacebookIntegrationService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _userTokenRepo = userTokenRepo;
            _pageTokenRepo = pageTokenRepo;
            _botConnectionRepo = botConnectionRepo;
            _logger = logger;
        }

        public async Task<SyncPagesResult> SyncPages(TokenRequest request, Errors errors)
        {
            if (string.IsNullOrEmpty(request.ShortLivedAccessToken))
            {
                errors.Fill(FailureCode.ValidationError, "Access token is required.");
                return new SyncPagesResult(false, "400", null, errors);
            }

            try
            {
                var httpClient = _httpClientFactory.CreateClient();

                var tokenExchangeUrl =
                    $"https://graph.facebook.com/v20.0/oauth/access_token?" +
                    $"grant_type=fb_exchange_token&client_id={AppId}&client_secret={AppSecret}" +
                    $"&fb_exchange_token={request.ShortLivedAccessToken}";

                var tokenResponse = await httpClient.GetStringAsync(tokenExchangeUrl);
                var tokenJson = JObject.Parse(tokenResponse);
                var longLivedUserToken = tokenJson["access_token"]?.ToString();

                if (string.IsNullOrEmpty(longLivedUserToken))
                {
                    errors.Fill(FailureCode.InternalServerError, "Failed to exchange Facebook token.");
                    return new SyncPagesResult(false, "500", null, errors);
                }

                var pagesUrl = $"https://graph.facebook.com/v20.0/me/accounts?access_token={longLivedUserToken}";
                var pagesResponse = await httpClient.GetStringAsync(pagesUrl);
                var pagesJson = JObject.Parse(pagesResponse);
                var pagesList = pagesJson["data"] as JArray;

                var syncPagesDto = new SyncPageDto
                {
                    LongLivedUserToken = longLivedUserToken,
                    Pages = pagesList?.Select(page => new FacebookPageDto
                    {
                        PageId = page["id"]?.ToString(),
                        Name = page["name"]?.ToString(),
                        Category = page["category"]?.ToString(),
                        AccessToken = page["access_token"]?.ToString()
                    }).ToList() ?? new List<FacebookPageDto>()
                };

                var userToken = new UserToken
                {
                    Id = Guid.NewGuid(),
                    LongLivedUserToken = longLivedUserToken
                };

                var successUserToken = await _userTokenRepo.AddUserToken(userToken,errors);
                if (!successUserToken)
                {
                    return new SyncPagesResult(false, "500", null, errors);
                }

                foreach (var page in syncPagesDto.Pages)
                {
                    var pageEntity = new PageToken
                    {
                        Id = Guid.NewGuid(),
                        PageId = page.PageId,
                        Name = page.Name,
                        Category = page.Category,
                        PageAccessToken = page.AccessToken,
                        UserTokenId = userToken.Id
                    };

                    var sucesspage = await _pageTokenRepo.AddPageToken(pageEntity, errors);
                    if (!sucesspage)
                    {
                        return new SyncPagesResult(false, "500", null, errors);
                    }
                }

                return new SyncPagesResult(true, "200", syncPagesDto, errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Facebook page sync.");
                errors.Fill(FailureCode.InternalServerError, ex.Message);
                return new SyncPagesResult(false, "500", null, errors);
            }
        }

        public async Task<Result> ConnectBot(ConnectBotRequest request, Errors errors)
        {
            var check = UniversalValidation.Validate(request, errors);
            if (!check)
            {
                return new Result(false, errors, "400");
            }

            try
            {
                var (pageFound, pageToken) = await _pageTokenRepo.GetPageTokenByPageId(request.PageId, errors);
                if (!pageFound || pageToken == null)
                {
                    return new Result(false, errors, "400");
                }

                var httpClient = _httpClientFactory.CreateClient();
                var subscribeUrl = $"https://graph.facebook.com/v20.0/{request.PageId}/subscribed_apps?access_token={pageToken.PageAccessToken}";
                var response = await httpClient.PostAsync(subscribeUrl, new StringContent("{}", Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                {
                    errors.Fill(FailureCode.InternalServerError, $"Failed to subscribe page. Response: {await response.Content.ReadAsStringAsync()}");
                    return new Result(false, errors, "500");
                }

                var botConnection = new BotConnection
                {
                    Id = Guid.NewGuid(),
                    PageId = request.PageId,
                    BotName = request.BotName,
                    WebhookStatus = "connected"
                };

                var botconnectionsuccess = await _botConnectionRepo.AddBotConnection(botConnection, errors);
                if (!botconnectionsuccess)
                {
                    return new Result(false, errors, "500");
                }

                return new Result(true, null, "200");
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.InternalServerError, ex.Message);
                return new Result(false, errors, "400");
            }
        }

        public async Task<Result> DisconnectBot(DisconnectBotRequest request, Errors errors)
        {

            if (string.IsNullOrEmpty(request.PageId))
            {
                errors.Fill(FailureCode.ValidationError, "PageId is required.");
                return new Result(false, errors, "400");
            }

            try
            {
                var (pageFound, pageToken) = await _pageTokenRepo.GetPageTokenByPageId(request.PageId, errors);
                if (!pageFound || pageToken == null)
                {
                    errors.Fill(FailureCode.NotFound, "Page not found.");
                    return new Result(false, errors, "404");
                }

                var httpClient = _httpClientFactory.CreateClient();
                var unsubscribeUrl = $"https://graph.facebook.com/v20.0/{request.PageId}/subscribed_apps?access_token={pageToken.PageAccessToken}";
                var response = await httpClient.DeleteAsync(unsubscribeUrl);

                if (!response.IsSuccessStatusCode)
                {
                    errors.Fill(FailureCode.InternalServerError, $"Failed to unsubscribe. {await response.Content.ReadAsStringAsync()}");
                    return new Result(false, errors, "500");
                }

                var (found, botConnection) = await _botConnectionRepo.GetBotConnectionByPageId(request.PageId, errors);
                if (found && botConnection != null)
                {
                    botConnection.WebhookStatus = "disconnected";
                    await _botConnectionRepo.UpdateBotConnection(botConnection, errors);
                }

                return new Result(false, null, "200");
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.UnknownError, ex.Message);
                return new Result(false, errors, "500");
            }
        }

        public async Task<BotStatusResult> GetBotStatus(string pageId, Errors errors)
        {
            if (string.IsNullOrEmpty(pageId))
            {
                errors.Fill(FailureCode.ValidationError, "PageId is required.");
                return new BotStatusResult(false, "400", null, errors);
            }

            var (found, botConnection) = await _botConnectionRepo.GetBotConnectionByPageId(pageId, errors);
            if (!found || botConnection == null)
            {
                return new BotStatusResult(false, "500", null, errors);
            }

            var result = new BotStatusDto
            {
                Connected = found && botConnection?.WebhookStatus == "connected",
                BotName = botConnection?.BotName
            };

            return new BotStatusResult(true, "200", result);
        }
    }
}
