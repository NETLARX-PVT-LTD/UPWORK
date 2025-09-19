// ---------------------------------------------------------------------
// <copyright file="LandingController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Bots
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Interface;
    using System.Threading.Tasks;
    using System;

    [Route("api/[controller]")]
    [ApiController]
    public class LandingController : ControllerBase
    {
        private readonly IBotDbContext _context;

        public LandingController(IBotDbContext context)
        {
            _context = context;
        }

        // ✅ GET /api/landing/{botId}
        [HttpGet("{botId}")]
        public async Task<IActionResult> GetLandingPage(Guid botId)
        {
            var bot = await _context.Bots
                .Include(b => b.Theme)
                .Include(b => b.LandingConfig)
                .FirstOrDefaultAsync(b => b.BotId == botId);

            if (bot == null)
                return NotFound(new { message = $"Bot with ID {botId} not found." });

            // Build response payload
            var response = new
            {
                title = bot.LandingConfig?.Title,
                description = bot.LandingConfig?.Description,
                backgroundStyle = bot.LandingConfig?.BackgroundStyle,
                botConfig = new
                {
                    id = bot.BotId,
                    story = bot.StoryId,
                    primaryColor = bot.Theme?.PrimaryColor,
                    name = bot.BotName,
                    greeting = bot.Greeting
                }
            };

            return Ok(response);
        }
    }
}
