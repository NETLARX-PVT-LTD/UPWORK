using BotsifySchemaTest.Db;
using BotsifySchemaTest.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BotsifySchemaTest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoryController : ControllerBase
    {
        private readonly BotDbContext _context;
        private readonly ILogger<StoryController> _logger;

        public StoryController(BotDbContext context, ILogger<StoryController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("GetAllStorySchemaById")]
        public async Task<IActionResult> GetAllStorySchemaById(int storyId)
        {
            try
            {
                if (storyId <= 0)
                {
                    _logger.LogWarning("Invalid StoryId received: {StoryId}", storyId);
                    return BadRequest(new { message = "Invalid StoryId. It must be greater than zero." });
                }

                _logger.LogInformation("Fetching story schema for StoryId: {StoryId}", storyId);

                var result = new List<object>(); 
                var story = _context.Stories.FirstOrDefault(s => s.ID == storyId);


                var connection = await _context.Connection
                    .FirstOrDefaultAsync(c => c.ID == story.RootBlockConnectionId);

                if (connection == null)
                {
                    _logger.LogWarning("No connection found for StoryId: {StoryId}", storyId);
                    return NotFound(new { message = $"No connection found for StoryId {storyId}" });
                }

                string currentType = connection.FromComponentType;
                Guid currentId = connection.FromComponentId;

                while (!string.IsNullOrEmpty(currentType))
                {
                    string? nextType = null;
                    Guid? nextId = null;

                    if (currentType == ComponentTypes.UserInputPhrase)
                    {
                        var data = await _context.UserInputPhrase.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched UserInputPhrase ID: {Id}", currentId);
                    }
                    else if (currentType == ComponentTypes.UserInputKeyword)
                    {
                        var data = await _context.UserInputKeyword.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched UserInputKeyword ID: {Id}", currentId);
                    }
                    else if (currentType == ComponentTypes.UserInputTypeAnything)
                    {
                        var data = await _context.UserInputTypeAnything.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched UserInputTypeAnything ID: {Id}", currentId);
                    }
                    else if (currentType == ComponentTypes.TypingDelay)
                    {
                        var data = await _context.TypingDelay.FirstOrDefaultAsync(td => td.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched typingDelay ID : ", currentId);
                    }
                    else if(currentType == ComponentTypes.LinkStory)
                    {
                        var data = await _context.LinkStory.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched LinkStory ID: {Id}", currentId);
                    }
                    if (string.IsNullOrEmpty(nextType) || nextId == null)
                        break;

                    currentType = nextType;
                    currentId = nextId.Value;
                }

                _logger.LogInformation("Story schema fetched successfully for StoryId: {StoryId}", storyId);

                return Ok(new
                {
                    message = "Story schema fetched successfully",
                    storyId = storyId,
                    components = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching story schema for StoryId: {StoryId}", storyId);
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching the story schema.",
                    error = ex.Message
                });
            }
        }
    }
}
