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