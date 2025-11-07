// ---------------------------------------------------------------------
// <copyright file="ConfigController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Config
{
    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Products.Gobot.Helper;
    using Netlarx.Products.Gobot.Interface.Config;
    using Netlarx.Products.Gobot.ModelDTO.Config;
    using System;
    using System.Threading.Tasks;


    [Route("api/[controller]")]
    [ApiController]
    public class ConfigController : ControllerBase
    {
        private readonly IConfigService _configService;

        public ConfigController(IConfigService configService)
        {
            _configService = configService;
        }

        //  GET /api/config/{botId}
        [HttpGet("GetConfigByBotId{botId}")]
        public async Task<BotConfigResult> GetConfigByBotIdAsync(Guid botId)
        {
            var errors = new Errors.Errors();
            var result = await _configService.GetConfig(botId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }
    }
}
