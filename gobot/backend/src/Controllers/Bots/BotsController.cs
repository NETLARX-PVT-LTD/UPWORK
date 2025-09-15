// ---------------------------------------------------------------------
// <copyright file="BotsController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Bots
{
    using Chatbot;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class BotsController : ControllerBase
    {
        private readonly IBotDbContext _context;

        private readonly ILogger<StoriesController> _logger;
        public BotsController(IBotDbContext context, ILogger<StoriesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ✅ GET /api/bots/{botId}
        [HttpGet("{botId}")]
        public async Task<IActionResult> GetBot(string botId)
        {
            var bot = await _context.Bots.FirstOrDefaultAsync(b => b.BotId == botId);

            if (bot == null)
                return NotFound(new { message = $"Bot with ID {botId} not found." });

            return Ok(bot);
        }

        // ✅ POST /api/bots/{botId}
        [HttpPost("{botId}")]
        public async Task<IActionResult> CreateBot(string botId)
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not BotBlock block)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (await _context.Bots.AnyAsync(b => b.BotId == botId))
                return Conflict(new { message = $"Bot with ID {botId} already exists." });

            //botRequest.BotId = botId;
            //botRequest.ApiKey = botRequest.ApiKey;
            var model =  new Bot
            {
                BotId = botId,
                BotName = block.BotName,
                ApiKey = string.IsNullOrEmpty(block.ApiKey) ? Guid.NewGuid().ToString("N") : block.ApiKey,
                Story = block.Story,
                Position = block.Position,
                Size = block.Size,
                Greeting = block.Greeting,
                Placeholder = block.Placeholder,
                AllowFullscreen = block.AllowFullscreen,
                ShowBranding = block.ShowBranding,
                BackgroundStyle = block.BackgroundStyle,

                Theme = block.Theme == null ? null : new Theme
                {
                    Id = block.Theme.Id,
                    PrimaryColor = block.Theme.PrimaryColor
                },

                LandingConfig = block.LandingConfig == null ? null : new LandingConfig
                {
                    Id = string.IsNullOrEmpty(block.LandingConfig.Id) ? Guid.NewGuid() : Guid.Parse(block.LandingConfig.Id),
                    Title = block.LandingConfig.Title,
                    Description = block.LandingConfig.Description,
                    BackgroundStyle = block.LandingConfig.BackgroundStyle
                }
            };

        _context.Bots.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                botId = model.BotId,
                apiKey = model.ApiKey,
                message = "Chatbot created successfully."
            });
        }

        [HttpPut("{botId}")]
        public async Task<IActionResult> UpdateBot(string botId)
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not BotBlock botRequest)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (botRequest == null)
                return BadRequest(new { message = "Invalid request payload." });

            var existingBot = await _context.Bots.FirstOrDefaultAsync(b => b.BotId == botId);

            if (existingBot == null)
                return NotFound(new { message = $"Bot with ID {botId} not found." });

            // 🔄 Map fields from BotBlock → existing Bot
            existingBot.BotName = botRequest.BotName ?? existingBot.BotName;
            existingBot.Story = botRequest.Story ?? existingBot.Story;
            existingBot.Position = botRequest.Position ?? existingBot.Position;
            existingBot.Size = botRequest.Size ?? existingBot.Size;
            existingBot.Greeting = botRequest.Greeting ?? existingBot.Greeting;
            existingBot.Placeholder = botRequest.Placeholder ?? existingBot.Placeholder;
            existingBot.AllowFullscreen = botRequest.AllowFullscreen;
            existingBot.ShowBranding = botRequest.ShowBranding;
            existingBot.BackgroundStyle = botRequest.BackgroundStyle ?? existingBot.BackgroundStyle;
            existingBot.ApiKey = botRequest.ApiKey;

            // ✅ Handle Theme update
            if (botRequest.Theme != null)
            {
                if (existingBot.Theme == null)
                    existingBot.Theme = new Theme();

                existingBot.Theme.PrimaryColor = botRequest.Theme.PrimaryColor ?? existingBot.Theme.PrimaryColor;
            }

            // ✅ Handle LandingConfig update
            if (botRequest.LandingConfig != null)
            {
                if (existingBot.LandingConfig == null)
                {
                    existingBot.LandingConfig = new LandingConfig
                    {
                        Id = string.IsNullOrEmpty(botRequest.LandingConfig.Id)
                            ? Guid.NewGuid()
                            : Guid.Parse(botRequest.LandingConfig.Id)
                    };
                }

                existingBot.LandingConfig.Title = botRequest.LandingConfig.Title ?? existingBot.LandingConfig.Title;
                existingBot.LandingConfig.Description = botRequest.LandingConfig.Description ?? existingBot.LandingConfig.Description;
                existingBot.LandingConfig.BackgroundStyle = botRequest.LandingConfig.BackgroundStyle ?? existingBot.LandingConfig.BackgroundStyle;
            }

            await _context.SaveChangesAsync();

            return Ok(new { botId, message = "Chatbot updated successfully." });
        }

        // ✅ DELETE /api/bots/{botId}
        [HttpDelete("{botId}")]
        public async Task<IActionResult> DeleteBot(string botId)
        {
            var bot = await _context.Bots.FirstOrDefaultAsync(b => b.BotId == botId);
            if (bot == null)
                return NotFound(new { message = $"Bot with ID {botId} not found." });

            _context.Bots.Remove(bot);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Chatbot deleted successfully." });
        }
    }
}
