// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers
{
    using Chatbot;
    using Gobot;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Services;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection.PortableExecutable;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/[controller]")]
    public class ComponentsController : ControllerBase
    {
        private readonly IBotDbContext _db;
        //private readonly IHubContext<StoryHub> _hubContext;
        private readonly ILogger<ComponentsController> _logger;

        private readonly StorySessionManager manager;

        TypingDelayBlock typingdelayblock = new TypingDelayBlock();
        UserInputBlock userInputBlock = new UserInputBlock();
        LinkStoryBlock linkStoryBlock = new LinkStoryBlock();
        JsonApiBlock JsonApiBlock = new JsonApiBlock();
        TextResponseBlock textResponseBlock = new TextResponseBlock();
        Button btn = new Button();
        public ComponentsController(IBotDbContext db, ILogger<ComponentsController> logger, StorySessionManager manager)
        {
            _db = db;
            _logger = logger;
            this.manager = manager;
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
                _db.addStory(model);
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

                _logger.LogWarning("Invalid component model received for StoryId: {StoryId}", storyId);
                var session = manager.GetStory(storyId);
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

                    var story = session.Story;
                    story.Name = compType;
                    story.ID = storyId;

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

        [HttpPost("AddUserInputPhrase/{storyId}")]
        public IActionResult AddUserInputPhrase(int storyId, [FromBody] UserInputBlock block)
        {
            var model = new Models.UserInputPhrase
            {
                StoryId = storyId,
                json = block.CustomMessage
            };
            return AddComponent(storyId, model, ComponentTypes.UserInputPhrase,
                m => manager.GetStory(storyId).Phrases.Add(m));
        }

        [HttpPost("AddUserInputKeyword")]
        public IActionResult AddUserInputKeyword(int storyId, [FromBody] UserInputBlock block)
        {
            var model = new Models.UserInputKeyword
            {
                StoryId = storyId,
                json = block.Keywords.ToString()
            };
            return AddComponent(storyId, model, ComponentTypes.UserInputKeyword,
                 g => manager.GetStory(storyId).Keywords.Add(g));
        }

        [HttpPost("AddUserInputAnything")]
        public IActionResult AddUserInputAnything(int storyId, [FromBody] UserInputBlock block)
        {
            var model = new Models.UserInputTypeAnything
            {
                StoryId = storyId,
                json = block.CustomMessage
            };
            return AddComponent(storyId, model, ComponentTypes.UserInputTypeAnything,
                  g => manager.GetStory(storyId).Anythings.Add(g));
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

        [HttpPost("AddTypingDelay")]
        public IActionResult AddTypingDelay(int storyId, [FromBody] TypingDelayBlock typingDelay)
        {
            var model = new Models.TypingDelay
            {
                DelaySeconds = typingDelay.DelaySeconds,
                StoryId = storyId
            };

            return AddComponent(storyId, model, ComponentTypes.TypingDelay,
                 g => manager.GetStory(storyId).TypingDelays.Add(g));
        }


        [HttpPost("AddLinkStory")]
        public IActionResult AddLinkStory(int storyId, [FromBody] LinkStoryBlock block)
        {
            var model = new Models.LinkStory
            {
                StoryId = storyId,
                LinkStoryId = block.LinkStoryId,
                LinkStoryName = block.LinkStoryName
            };
            return AddComponent(storyId, model, ComponentTypes.LinkStory,
                 g => manager.GetStory(storyId).LinkStories.Add(g));
        }

        [HttpPost("AddJsonApi")]
        public IActionResult AddJsonApi(int storyId, [FromBody] JsonApiBlock block)
        {
            var model = new Models.JsonAPI
            {
                ApiEndpoint = block.ApiEndpoint,
                RequestType = block.RequestType,
                ApiHeaders = block.ApiHeaders
                            .Select(h => new Models.ApiHeader
                            {
                                jsonId = h.JsonId,
                                Key = h.HeaderKey ?? string.Empty,
                                Value = h.HeaderValue ?? string.Empty
                            })
                            .ToList()
            };
            return AddComponent(storyId, model, ComponentTypes.JsonAPI,
                 g => manager.GetStory(storyId).JsonAPIs.Add(g));
        }

        [HttpPost("AddConversationalform")]
        public IActionResult AddConversationalForm(int storyId, [FromBody] ConversationalForm model)
        {
            return AddComponent(storyId, model, ComponentTypes.ConversationalForm,
                 g => manager.GetStory(storyId).ConversationalForms.Add(g));
        }

        [HttpPost("AddTextReponse")]
        public IActionResult AddTextResponse(int storyId, [FromBody] TextResponseBlock block)
        {
            var model = new Models.TextResponse
            {
                StoryId = storyId,
                Type = block.Type,
                Content = block.Content
            };
            return AddComponent(storyId, model, ComponentTypes.TextResponse,
                 g => manager.GetStory(storyId).TextResponses.Add(g));
        }

        [HttpGet("GetTypingDelay/{storyId}")]
        public async Task<IActionResult> GetTypingDelay(int storyId)
        {
            var typingDelays = await _db.allTypingDelay(storyId);

            if (typingDelays == null || typingDelays.Count == 0)
            {
                return NotFound($"No typing delays found for StoryId {storyId}");
            }

            return Ok(typingDelays);
        }

        [HttpGet("GetLinkStory")]
        public async Task<IActionResult> GetLinkStory(int storyId)
        {
            var LinkStories = await _db.LinkStory.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (LinkStories == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(LinkStories);
        }

        [HttpGet("GetConversationalForm")]
        public async Task<IActionResult> GetConversationalForm(int storyId)
        {
            var ConversationalForms = await _db.ConversationalForm.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (ConversationalForms == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(ConversationalForms);
        }

        [HttpGet("GetTextReponse")]
        public async Task<IActionResult> GetTextReponse(int storyId)
        {
            var TextResponses = await _db.TextResponse.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (TextResponses == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(TextResponses);
        }

        [HttpGet("GetJsonApi")]
        public async Task<IActionResult> GetJsonApi(int storyId)
        {
            var jsonAPIs = await _db.JsonAPI.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (jsonAPIs == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(jsonAPIs);
        }

        [HttpGet("GetUserInputKeyword")]
        public async Task<IActionResult> GetUserInputKeyword(int storyId)
        {
            var userInputKeywordss = await _db.UserInputKeyword.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (userInputKeywordss == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(userInputKeywordss);
        }

        [HttpGet("GetUserInputAnything")]
        public async Task<IActionResult> GetUserInputAnything(int storyId)
        {
            var userInputTypeAnything = await _db.UserInputTypeAnything.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (userInputTypeAnything == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(userInputTypeAnything);
        }

        [HttpGet("GetUserInputPhrases")]
        public async Task<IActionResult> GetUserInputPhrases(int storyId)
        {
            var UserInputPhrases = await _db.UserInputPhrase.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (UserInputPhrases == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(UserInputPhrases);
        }

        [HttpPost("UpdateStoryToDB")]
        public async Task<IActionResult> UpdateStoryToDB([FromBody] StorySessionData session)
        {
            try
            {
                if (session == null)
                {
                    _logger.LogWarning("Invalid session data received for update");
                    return BadRequest("Invalid data");
                }

                // ✅ Update Phrases
                if (session.Phrases != null && session.Phrases.Any())
                {
                    foreach (var phrase in session.Phrases)
                    {
                        var existing = await _db.UserInputPhrase
                            .FirstOrDefaultAsync(p => p.ID == phrase.ID);

                        if (existing != null)
                            _db.EntryAll(phrase,existing);
                        else
                            _db.UserInputPhrase.Add(phrase); // fallback if not found
                    }
                }

                // ✅ Update Keywords
                if (session.Keywords != null && session.Keywords.Any())
                {
                    foreach (var keyword in session.Keywords)
                    {
                        var existing = await _db.UserInputKeyword
                            .FirstOrDefaultAsync(k => k.ID == keyword.ID);

                        if (existing != null)
                            _db.EntryAll(keyword,existing);
                        else
                            _db.UserInputKeyword.Add(keyword);
                    }
                }

                // ✅ Update Anythings
                if (session.Anythings != null && session.Anythings.Any())
                {
                    foreach (var any in session.Anythings)
                    {
                        var existing = await _db.UserInputTypeAnything
                            .FirstOrDefaultAsync(a => a.ID == any.ID);

                        if (existing != null)
                            _db.EntryAll(any,existing);
                        else
                            _db.UserInputTypeAnything.Add(any);
                    }
                }

                // ✅ Update Connections & Story
                if (session.Connections != null && session.Connections.Any())
                {
                    foreach (var conn in session.Connections)
                    {
                        var existing = await _db.Connection
                            .FirstOrDefaultAsync(c => c.ID == conn.ID);

                        if (existing != null)
                            _db.EntryAll(conn,existing);
                        else
                            _db.Connection.Add(conn);
                    }

                    var firstConnection = session.Connections.FirstOrDefault();
                    if (firstConnection != null)
                    {
                        var story = await _db.Stories.FirstOrDefaultAsync(s => s.ID == firstConnection.StoryId);
                        if (story != null)
                        {
                            story.RootBlockConnectionId = firstConnection.ID;
                            _db.Stories.Update(story);
                        }
                        else if (session.Story != null)
                        {
                            session.Story.RootBlockConnectionId = firstConnection.ID;
                            _db.Stories.Add(session.Story);
                        }
                    }
                }

                // ✅ Update TextResponses
                if (session.TextResponses != null && session.TextResponses.Any())
                {
                    foreach (var tr in session.TextResponses)
                    {
                        var existing = await _db.TextResponse
                            .FirstOrDefaultAsync(t => t.ID == tr.ID);

                        if (existing != null)
                            _db.EntryAll(tr, existing);
                        else
                            _db.TextResponse.Add(tr);
                    }
                }

                // ✅ Update ConversationalForms
                if (session.ConversationalForms != null && session.ConversationalForms.Any())
                {
                    foreach (var cf in session.ConversationalForms)
                    {
                        var existing = await _db.ConversationalForm
                            .FirstOrDefaultAsync(c => c.ID == cf.ID);

                        if (existing != null)
                            _db.EntryAll(cf,existing);
                        else
                            _db.ConversationalForm.Add(cf);
                    }
                }

                // ✅ Update TypingDelays
                if (session.TypingDelays != null && session.TypingDelays.Any())
                {
                    foreach (var td in session.TypingDelays)
                    {
                        var existing = await _db.TypingDelay
                            .FirstOrDefaultAsync(t => t.ID == td.ID);

                        if (existing != null)
                            _db.EntryAll(td, existing);
                        else
                            _db.TypingDelay.Add(td);
                    }
                }

                // ✅ Update LinkStories
                if (session.LinkStories != null && session.LinkStories.Any())
                {
                    foreach (var ls in session.LinkStories)
                    {
                        var existing = await _db.LinkStory
                            .FirstOrDefaultAsync(l => l.ID == ls.ID);

                        if (existing != null)
                            _db.EntryAll(ls,existing);
                        else
                            _db.LinkStory.Add(ls);
                    }
                }

                // ✅ Update JsonAPIs
                if (session.JsonAPIs != null && session.JsonAPIs.Any())
                {
                    foreach (var api in session.JsonAPIs)
                    {
                        var existing = await _db.JsonAPI
                            .FirstOrDefaultAsync(j => j.ID == api.ID);

                        if (existing != null)
                            _db.EntryAll(api,existing);
                        else
                            _db.JsonAPI.Add(api);
                    }
                }

                await _db.SaveChangesAsync();
                _logger.LogInformation("Session updated successfully in DB");

                return Ok(new { message = "Story updated successfully" });
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? "No inner exception";
                _logger.LogError(ex, "Error occurred while updating story session. Inner: {Inner}", innerMessage);

                return StatusCode(500, new
                {
                    error = ex.Message,
                    inner = innerMessage
                });
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
                            _logger.LogInformation("Updated root connection for existing StoryId: {StoryId}", story.ID);
                        }
                        else if (session.Story != null)
                        {
                            session.Story.RootBlockConnectionId = firstConnection.ID;
                            _db.Stories.Add(session.Story);
                            _logger.LogInformation("New story created with RootBlockConnectionId: {RootId}", firstConnection.ID);
                        }
                        else
                        {
                            _logger.LogWarning("No story found in DB and no session.Story provided.");
                        }
                    }
                }

                if(session.TextResponses != null)
                {
                    _db.TextResponse.AddRange(session.TextResponses);
                }

                if(session.ConversationalForms != null)
                {
                    _db.ConversationalForm.AddRange(session.ConversationalForms);
                }

                if(session.TypingDelays != null)
                {
                    _db.TypingDelay.AddRange(session.TypingDelays);
                }

                if(session.LinkStories != null)
                {
                    _db.LinkStory.AddRange(session.LinkStories);
                }

                if(session.TextResponses != null)
                {
                    _db.TextResponse.AddRange(session.TextResponses);
                }

                if(session.JsonAPIs != null)
                {
                    _db.JsonAPI.AddRange(session.JsonAPIs);
                }

                await _db.SaveChangesAsync();
                _logger.LogInformation("Session saved to DB successfully");
                return Ok(new { message = "Story saved to DB" });
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? "No inner exception";
                _logger.LogError(ex, "Error occurred while saving story session to DB. Inner: {Inner}", innerMessage);

                return StatusCode(500, new
                {
                    error = ex.Message,
                    inner = innerMessage
                });
            }
        }
    }
}
