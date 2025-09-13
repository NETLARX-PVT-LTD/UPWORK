// ---------------------------------------------------------------------
// <copyright file="LinkStoryController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.LinkStories
{
    using Chatbot;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Pipelines;
    using System;
    using System.Linq;
    using System.Threading.Tasks;

    [Route("api/bots/{botId}/linkstories")]
    [ApiController]
    public class LinkStoryController : ControllerBase
    {
        private readonly IBotDbContext _context;
        private readonly ILogger<LinkStoryController> _logger;

        public LinkStoryController(IBotDbContext context, ILogger<LinkStoryController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /api/bots/{botId}/linkstories
        [HttpGet]
        public async Task<IActionResult> GetLinkStories(string botId)
        {
            var bot = await _context.Bots.FirstOrDefaultAsync(b => b.BotId == botId);

            if (bot == null)
                return NotFound(new { message = $"Bot with ID {botId} not found." });

            var linkStories = await _context.LinkStory
                                           .Where(ls => ls.BotId == botId)
                                           .ToListAsync();

            return Ok(linkStories);
        }

        [HttpPost]
        [MiddlewareFilter(typeof(ProtoPipeline))]
        [Consumes("application/x-protobuf")]
        public async Task<IActionResult> AddLinkStory(string botId, [FromBody] LinkStoryBlock linkStoryDto)
        {
            // Try to find the bot
            var bot = await _context.Bots.FindAsync(botId);

            // If bot does not exist, create it
            if (bot == null)
            {
                bot = new Bot
                {
                    BotName = $"Bot-{botId}",
                    BotId = botId
                   
                };

                _context.Bots.Add(bot);
                await _context.SaveChangesAsync();
            }

            var linkStory = new LinkStory
            {
                LinkStoryName = linkStoryDto.LinkStoryName,
                ToComponentId = Guid.Parse(linkStoryDto.ToComponentId),
                ToComponentType = linkStoryDto.ToComponentType,
                LinkStoryId = linkStoryDto.LinkStoryId,
                BotId = bot.BotId
            };

            _context.LinkStory.Add(linkStory);
            await _context.SaveChangesAsync();

            return Ok(linkStory);
        }

        // PUT: /api/bots/{botId}/linkstories/{linkStoryId}
        [HttpPut("{linkStoryId}")]
        public async Task<IActionResult> UpdateLinkStory(string botId, Guid linkStoryId, [FromBody] LinkStoryBlock updateRequest)
        {
            if (updateRequest == null)
                return BadRequest("Invalid link story data.");

            var linkStory = await _context.LinkStory
                .FirstOrDefaultAsync(ls => ls.ID == linkStoryId && ls.BotId == botId);

            if (linkStory == null)
                return NotFound($"LinkStory with id {linkStoryId} for Bot {botId} not found.");

            linkStory.LinkStoryName = updateRequest.LinkStoryName ?? linkStory.LinkStoryName;
            linkStory.LinkStoryId = updateRequest.LinkStoryId != 0
                                        ? updateRequest.LinkStoryId
                                        : linkStory.LinkStoryId;
            linkStory.CreatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(linkStory);
        }

        // DELETE: /api/bots/{botId}/linkstories/{linkStoryId}
        [HttpDelete("{linkStoryId}")]
        public async Task<IActionResult> DeleteLinkStory(string botId, Guid linkId)
        {
            var linkStory = await _context.LinkStory
                .FirstOrDefaultAsync(ls => ls.ID == linkId && ls.BotId == botId);

            if (linkStory == null)
                return NotFound($"LinkStory with id {linkId} for Bot {botId} not found.");

            _context.LinkStory.Remove(linkStory);
            await _context.SaveChangesAsync();

            return NoContent(); // ✅ 204 success, no body
        }
    }
}
