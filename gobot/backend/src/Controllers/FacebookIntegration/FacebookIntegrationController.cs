// ---------------------------------------------------------------------
// <copyright file="FacebookIntegrationController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.FacebookIntegration
{

    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Helper;
    using Netlarx.Products.Gobot.Interface.FacebookIntegration;
    using Netlarx.Products.Gobot.ModelDTO.FacebookIntegration;
    using Netlarx.Products.Gobot.Result;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/facebook")]
    public class FacebookIntegrationController : ControllerBase
    {
        private readonly IFacebookIntegrationService _facebookIntegrationService;

        public FacebookIntegrationController(IFacebookIntegrationService facebookIntegrationService)
        {
            _facebookIntegrationService = facebookIntegrationService;
        }

        [HttpPost("SyncPages")]
        public async Task<SyncPagesResult> SyncPagesAsync([FromBody] TokenRequest request)
        {
            var errors = new Errors();
            var result = await _facebookIntegrationService.SyncPages(request,errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        [HttpPost("ConnectBot")]
        public async Task<Result> ConnectBotAsync([FromBody] ConnectBotRequest request)
        {
            var errors = new Errors();
            var result = await _facebookIntegrationService.ConnectBot(request, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        [HttpPost("DisconnectBot")]
        public async Task<Result> DisconnectBotAsync([FromBody] DisconnectBotRequest request)
        {
            var errors = new Errors();
            var result = await _facebookIntegrationService.DisconnectBot(request,errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        [HttpGet("GetBotStatus/{pageId}")]
        public async Task<Result> GetBotStatusAsync(string pageId)
        {
            var errors = new Errors();
            var result = await _facebookIntegrationService.GetBotStatus(pageId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }
    }
}