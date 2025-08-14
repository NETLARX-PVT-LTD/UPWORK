using BotsifySchemaTest.Db;
using BotsifySchemaTest.Hubs;
using BotsifySchemaTest.Models;
using BotsifySchemaTest.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BotsifySchemaTest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComponentsController : ControllerBase
    {
        private readonly BotDbContext _db;
        private readonly IHubContext<StoryHub> _hubContext;
        private readonly ILogger<ComponentsController> _logger;

        public ComponentsController(BotDbContext db, IHubContext<StoryHub> hubContext, ILogger<ComponentsController> logger)
        {
            _db = db;
            _hubContext = hubContext;
            _logger = logger;
        }

        [HttpPost("AddStory")]
        public async Task<IActionResult> AddStory([FromBody] Stories model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid Story model received");
                    return BadRequest(ModelState);
                }

                model.CreatedDate = DateTime.UtcNow;
                _db.Stories.Add(model);
                await _db.SaveChangesAsync();

                _logger.LogInformation("Story created with ID: {StoryId}", model.ID);
                return Ok(new { message = "Story created", storyId = model.ID });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating story");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private IActionResult AddComponent<T>(int storyId, T model, string compType, Action<T> addToCollection) where T : BaseComponent
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid component model received for StoryId: {StoryId}", storyId);
                    return BadRequest(ModelState);
                }

                var session = StorySessionManager.GetStory(storyId);
                var componentId = Guid.NewGuid();

                if (session.Connections.Count == 0)
                {
                    var connId = Guid.NewGuid();
                    session.Connections.Add(new Connection
                    {
                        ID = connId,
                        StoryId = storyId,
                        FromComponentType = compType,
                        FromComponentId = componentId,
                        CreatedDate = DateTime.UtcNow
                    });

                    session.Story.RootBlockConnectionId = connId;
                    _logger.LogInformation("Root connection created for StoryId: {StoryId}", storyId);
                }
                else
                {
                    var lastComponent = GetLastUnlinkedComponent(session);
                    if (lastComponent != null)
                    {
                        lastComponent.ToComponentType = compType;
                        lastComponent.ToComponentId = componentId;
                        _logger.LogDebug("Linked new component {CompType} to last unlinked component", compType);
                    }
                }

                model.ID = componentId;
                model.CreatedDate = DateTime.UtcNow;
                model.ToComponentType = null;
                model.ToComponentId = null;

                addToCollection(model);
             
                _logger.LogInformation("{CompType} added in memory for StoryId: {StoryId}", compType, storyId);
                return Ok(new
                {
                    message = $"{compType} added in memory",
                    storyId = storyId,
                    sessionData = session 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding component {CompType} for StoryId: {StoryId}", compType, storyId);
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private BaseComponent GetLastUnlinkedComponent(StorySessionData session)
        {
            return session.GetType()
                .GetProperties()
                .Where(p => typeof(System.Collections.IEnumerable).IsAssignableFrom(p.PropertyType)
                            && p.PropertyType.IsGenericType
                            && typeof(BaseComponent).IsAssignableFrom(p.PropertyType.GetGenericArguments()[0]))
                .SelectMany(p => (IEnumerable<BaseComponent>)p.GetValue(session))
                .Where(c => c.ToComponentId == null)
                .LastOrDefault();
        }

        [HttpPost("AddUserInputPhrase")]
        public IActionResult AddUserInputPhrase(int storyId, [FromBody] UserInputPhrase model)
        {
            return AddComponent(storyId, model, ComponentTypes.UserInputPhrase,
                m => StorySessionManager.GetStory(storyId).Phrases.Add(m));
        }

        [HttpPost("AddUserInputKeyword")]
        public IActionResult AddUserInputKeyword(int storyId, [FromBody] UserInputKeyword model)
        {
            return AddComponent(storyId, model, ComponentTypes.UserInputKeyword,
                 g => StorySessionManager.GetStory(storyId).Keywords.Add(g));
        }

        [HttpPost("AddUserInputAnything")]
        public IActionResult AddUserInputAnything(int storyId, [FromBody] UserInputTypeAnything model)
        {
            return AddComponent(storyId, model, ComponentTypes.UserInputTypeAnything,
                  g => StorySessionManager.GetStory(storyId).Anythings.Add(g));
        }

        [HttpGet("AllStories")]
        public async Task<IActionResult> AllStories()
        {
            try
            {
                var data = await _db.Stories.ToListAsync();
                _logger.LogInformation("Fetched all stories. Count: {Count}", data.Count);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all stories");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("SaveStoryToDb")]
        public async Task<IActionResult> SaveStoryToDb([FromBody] StorySessionData session)
        {
            try
            {
                if (session == null)
                {
                    _logger.LogWarning("Invalid session data received");
                    return BadRequest("Invalid data");
                }

                if (session.Phrases != null)
                    _db.UserInputPhrase.AddRange(session.Phrases);

                if (session.Keywords != null)
                    _db.UserInputKeyword.AddRange(session.Keywords);

                if (session.Anythings != null)
                    _db.UserInputTypeAnything.AddRange(session.Anythings);

                if (session.Connections != null)
                {
                    _db.Connection.AddRange(session.Connections);

                    var firstConnection = session.Connections.FirstOrDefault();
                    if (firstConnection != null)
                    {
                        var story = await _db.Stories.FirstOrDefaultAsync(s => s.ID == firstConnection.StoryId);
                        if (story != null)
                        {
                            story.RootBlockConnectionId = firstConnection.ID;
                            _db.Stories.Update(story);
                            _logger.LogInformation("Updated root connection for StoryId: {StoryId}", story.ID);
                        }
                    }
                }

                await _db.SaveChangesAsync();
                _logger.LogInformation("Session saved to DB successfully");
                return Ok(new { message = "Story saved to DB" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while saving story session to DB");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
