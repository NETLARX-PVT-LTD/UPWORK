// ---------------------------------------------------------------------
// <copyright file="ConfigController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Config
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using System.Threading.Tasks;


    [Route("api/[controller]")]
    [ApiController]
    public class ConfigController : ControllerBase
    {
        private readonly IBotDbContext _db;

        public ConfigController(IBotDbContext db)
        {
            _db = db;
        }

        // ✅ GET /api/config/{botId}
        [HttpGet("{botId}")]
        public async Task<IActionResult> GetConfig(string botId)
        {
            var bot = await _db.BotConfigs.FirstOrDefaultAsync(b => b.BotId == botId);
            if (bot == null)
                return NotFound(new { message = $"Bot with Id '{botId}' not found." });

            var response = new BotConfigResponse
            {
                Branding = new Branding
                {
                    BotName = bot.BotName,
                    PrimaryColor = bot.PrimaryColor,
                    SecondaryColor = bot.SecondaryColor
                    //ImageUrl = bot.Imageurl
                },
                WelcomeMessage = bot.WelcomeMessage,
                InputPlaceholder = bot.InputPlaceholder
            };

            return Ok(response);
        }
    }
}
