// ---------------------------------------------------------------------
// <copyright file="BotsController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Bots
{
    using Chatbot;
    using Gobot.Interface.Bots;
    using Gobot.ModelDTO.Bots;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Helper;
    using System;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class BotsController : ControllerBase
    {
        private readonly IBotService _botService;

        private readonly ILogger<StoriesController> _logger;
        public BotsController(IBotService botService)
        {
            _botService = botService;
        }

        // api/bots/{botId}
        [HttpGet("GetBotByBotId{botId}")]
        public async Task<BotResult> GetBotByBotIdAsync(Guid botId)
        {
            var errors = new Errors();
            var result = await _botService.GetBotByIdAsync(botId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        // POST /api/bots/{botId}
        [HttpPost("CreateBot")]
        public async Task<BotActionResult> CreateBotAsync()
        {
            var errors = new Errors();
            BotActionResult result;

            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not BotBlock block)
            {
                errors.Fill(FailureCode.InvalidInput, "Protobuf body missing or invalid.");
                result = new BotActionResult(false, "400", Guid.Empty, errors);
            }
            else
            {
                result = await _botService.CreateBotAsync(block, errors);
            }

            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        [HttpPut("UpdateBotByBotId/{botId}")]
        public async Task<BotActionResult> UpdateBotByBotIdAsync(Guid botId)
        {
            var errors = new Errors();
            BotActionResult result;

            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not BotBlock block)
            {
                errors.Fill(FailureCode.InvalidInput, "Protobuf body missing or invalid.");
                result = new BotActionResult(false, "400", Guid.Empty, errors);
            }
            else
            {
                result = await _botService.UpdateBotAsync(botId, block, errors);
            }

            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        //  DELETE /api/bots/{botId}
        [HttpDelete("DeleteBotById{botId}")]
        public async Task<BotActionResult> DeleteBoAsynctById(Guid botId)
        {
            var errors = new Errors();
            var result = await _botService.DeleteBotAsync(botId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }


        // GET /api/landing/{botId}
        [HttpGet("GetLandingPageById/{botId}")]
        public async Task<LandingPageResult> GetLandingPageByIdAsync(Guid botId)
        {
            var errors = new Errors();
            var result = await _botService.GetLandingPageAsync(botId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }
    }
}
