//// ---------------------------------------------------------------------
//// <copyright file="StoriesController.cs" company="Netlarx">
//// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
//// </copyright>
//// ---------------------------------------------------------------------

//namespace Netlarx.Products.Gobot.Controllers.Bots
//{
//    using Chatbot;
//    using Microsoft.AspNetCore.Mvc;
//    using Microsoft.EntityFrameworkCore;
//    using Microsoft.Extensions.Logging;
//    using Netlarx.Products.Gobot.Interface;
//    using Netlarx.Products.Gobot.Models;
//    using Netlarx.Products.Gobot.Pipelines;
//    using System;
//    using System.Linq;
//    using System.Threading.Tasks;

//    [Route("api/bots/{botId}/stories")]
//    [ApiController]
//    public class StoriesController : ControllerBase
//    {
//        private readonly IBotDbContext _context;
//        //private readonly IHubContext<StoryHub> _hubContext;
//        private readonly ILogger<StoriesController> _logger;

//        public StoriesController(IBotDbContext context, ILogger<StoriesController> logger)
//        {
//            _context = context;
//            _logger = logger;
//        }

//        // GET /api/bots/{botId}/stories
//        [HttpGet]
//        public async Task<IActionResult> GetStories(Guid botId)
//        {
//            var bot = await _context.Bots.FirstOrDefaultAsync(b => b.BotId == botId);

//            if (bot == null)
//            {
//                return NotFound(new { message = $"Bot with ID {botId} not found." });
//            }

//            var stories = await _context.Stories
//                                      .Where(s => s.BotId == botId)
//                                      .ToListAsync();

//            return Ok(stories);
//        }

//        // POST: /api/bots/{botId}/stories
//        [HttpPost]
//        [MiddlewareFilter(typeof(ProtoPipeline))]
//        [Consumes("application/x-protobuf")]
//        public async Task<IActionResult> AddStory(int botId)
//        {
//            //Retrieve the deserialized Protobuf object from middleware
//            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not StoryBlock storyDto)
//            {
//                _logger.LogWarning("Protobuf body missing or invalid");
//                return BadRequest("Protobuf body missing or invalid");
//            }
//            // Try to find the bot
//            var bot = await _context.Bots.FindAsync(botId);

//            // If bot does not exist, create it
//            if (bot == null)
//            {
//                bot = new Bot
//                {// ✅ Make sure BotId is not auto-generated in DB
//                    BotId = Guid.NewGuid(),
//                    BotName = $"Bot-{botId}"
//                };

//                _context.Bots.Add(bot);
//                await _context.SaveChangesAsync();
//            }

//            // Create story for this bot
//            var story = new Stories
//            {
//                Name = storyDto.Name,
//                RootBlockConnectionId = Guid.Parse(storyDto.RootBlockConnectionId),
//                CreatedDate = DateTime.UtcNow,
//                BotId = bot.BotId
//            };

//            _context.Stories.Add(story);
//            await _context.SaveChangesAsync();

//            return Ok(story);
//        }


//        // PUT: /api/bots/{botId}/stories/{storyId}
//        [HttpPut("{storyId}")]
//        [MiddlewareFilter(typeof(ProtoPipeline))]
//        [Consumes("application/x-protobuf")]
//        public async Task<IActionResult> UpdateStory(Guid botId, int storyId)
//        {
//            //Retrieve the deserialized Protobuf object from middleware
//            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not StoryBlock updateRequest)
//            {
//                _logger.LogWarning("Protobuf body missing or invalid");
//                return BadRequest("Protobuf body missing or invalid");
//            }

//            if (updateRequest == null)
//                return BadRequest("Invalid story data.");

//            // Find the story for the given bot
//            var story = await _context.Stories
//                .FirstOrDefaultAsync(s => s.ID == storyId && s.BotId == botId);

//            if (story == null)
//                return NotFound($"Story with id {storyId} for Bot {botId} not found.");

//            // Update fields
//            story.Name = updateRequest.Name ?? story.Name;
//            story.RootBlockConnectionId = Guid.Parse(updateRequest.RootBlockConnectionId) != Guid.Empty
//                                            ? Guid.Parse(updateRequest.RootBlockConnectionId)
//                                            : story.RootBlockConnectionId;

//            story.CreatedDate = DateTime.UtcNow;

//            // Save changes
//            await _context.SaveChangesAsync();

//            return Ok(story);
//        }

//        // DELETE: /api/bots/{botId}/stories/{storyId}
//        [HttpDelete("{storyId}")]
//        public async Task<IActionResult> DeleteStory(Guid botId, int storyId)
//        {
//            // Find the story belonging to the bot
//            var story = await _context.Stories
//                .FirstOrDefaultAsync(s => s.ID == storyId && s.BotId == botId);

//            if (story == null)
//                return NotFound($"Story with id {storyId} for Bot {botId} not found.");

//            _context.Stories.Remove(story);
//            await _context.SaveChangesAsync();

//            return NoContent(); // ✅ 204 response (no body, success)
//        }
//    }
//}


// ---------------------------------------------------------------------
// <copyright file="StoriesController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Bots
{
    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Helper;
    using Netlarx.Products.Gobot.Interface.Bots;
    using Netlarx.Products.Gobot.ModelDTO.Bots;
    using System;
    using System.Threading.Tasks;

    [Route("api/bots/{botId}/stories")]
    [ApiController]
    public class StoriesController : ControllerBase
    {
        private readonly IStoriesService _storiesService;
        public StoriesController(IStoriesService storiesService)
        {
            _storiesService = storiesService;
        }

        // GET /api/bots/{botId}/stories/GetStoriesByBotId
        [HttpGet("GetStoriesByBotId")]
        public async Task<StoriesDetail> GetStoriesByBotIdAsync(Guid botId)
        {
            var errors = new Errors();
            var result = await _storiesService.GetStoriesAsync(botId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        // GET /api/bots/{botId}/stories/GetStoryById/{storyId}
        [HttpGet("GetStoryById/{storyId}")]
        public async Task<StoriesDetail> GetStoryByIdAsync(Guid botId, int storyId)
        {
            var errors = new Errors();
            var result = await _storiesService.GetStoryAsync(botId, storyId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        // POST /api/bots/{botId}/stories/AddStory
        [HttpPost("AddStory")]
        public async Task<StoriesResult> AddStoryAsync(Guid botId, [FromBody] StoriesRequest blockdto)
        {
            var errors = new Errors();
            var result = await _storiesService.AddStoryAsync(botId, blockdto, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        // PUT /api/bots/{botId}/stories/UpdateStoryById/{storyId}
        [HttpPut("UpdateStoryById/{storyId}")]
        public async Task<StoriesResult> UpdateStoryByIdAsync(Guid botId, int storyId, [FromBody] StoriesRequest blockdto)
        {
            var errors = new Errors();
            var result = await _storiesService.UpdateStoryAsync(botId, storyId, blockdto, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        // DELETE /api/bots/{botId}/stories/DeleteStoryById/{storyId}
        [HttpDelete("DeleteStoryById/{storyId}")]
        public async Task<StoriesResult> DeleteStoryByIdAsync(Guid botId, int storyId)
        {
            var errors = new Errors();
            var result = await _storiesService.DeleteStoryAsync(botId, storyId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }
    }
}
