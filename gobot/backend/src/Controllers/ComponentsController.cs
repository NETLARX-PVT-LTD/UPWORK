// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers
{
    using Chatbot;
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
                Phrase = block.CustomMessage
            };
            return AddComponent(storyId, model, ComponentTypes.UserInputPhrase,
                m => manager.GetStory(storyId).Phrases.Add(m));
        }

        [HttpPost("AddUserInputKeyword")]
        public IActionResult AddUserInputKeyword(int storyId, [FromBody] UserInputBlock block)
        {
            Guid Id = Guid.NewGuid();
            var model = new Models.UserInputKeyword
            {
                ID = Id,
                StoryId = storyId,
                Keywords = block.Keywords?.ToList() ?? new List<string>(),
                KeywordGroup = block.KeywordGroups?
                        .Select(kg => new Models.KeywordGroup
                        {
                            Id = Guid.TryParse(kg.Id, out var guid) ? guid : Guid.NewGuid(),
                            UserInputKeywordId = Id, // 🔑 set FK properly
                            Keywords = kg.Keywords?.ToList() ?? new List<string>()
                        })
                        .ToList() ?? new List<Models.KeywordGroup>(),
                Variables = block.AvailableVariables?
                        .Select(v => new Models.Variable
                        {
                            UserInputKeywordId = Id, // 🔑 set FK properly
                            name = v.Name,
                            type = v.Type
                        })
                        .ToList() ?? new List<Models.Variable>()
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
                Anything = block.CustomMessage
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
        [HttpPost("AddMediaBlock")]
        public IActionResult AddMediaBlock(int storyId, [FromBody] MediaBlock block)
        {
            // Changed to use your new Models.MediaBlock class
            var model = new Models.Media
            {
                StoryId = storyId,
                MediaId = block.MediaId,
                MediaType = (Models.MediaTypeblock)block.MediaType,
                SingleImageUrl = block.SingleImageUrl,
                VideoUrl = block.VideoUrl,
                AudioUrl = block.AudioUrl,
                FileUrl = block.FileUrl,
                MediaName = block.MediaName,
                ButtonTitle = block.ButtonTitle,
                ButtonTextMessage = block.ButtonTextMessage,
                ButtonType = block.ButtonType,
                ButtonLinkedMediaId = block.ButtonLinkedMediaId,
                ButtonUrl = block.ButtonUrl,

                // Corrected to map to Models.ImageSlideBlock
                Slides = block.Slides.Select(s => new Models.ImageSlideblock
                {
                    Url = s.Url,
                    Title = s.Title,
                    Description = s.Description
                }).ToList(),

                // Corrected to map to Models.ButtonBlock
                Buttons = block.Buttons.Select(b => new Models.Buttonblock
                {
                    // Using ProtoId to store the string ID from the API
                    ProtoId = b.Id,
                    Title = b.Title,
                    Type = b.Type,
                    Value = b.Value,
                    TextMessage = b.TextMessage,
                    LinkedMediaId = b.LinkedMediaId,
                    Url = b.Url,
                    PhoneNumber = b.PhoneNumber,
                    StoryId = b.StoryId,
                    RssUrl = b.RssUrl,
                    RssItemCount = b.RssItemCount,
                    RssButtonText = b.RssButtonText,
                    // ... mapping all other button properties for completeness ...

                    // Corrected to map to Models.ApiHeaderBlock
                    ApiHeaders = b.ApiHeaders.Select(h => new Models.ApiHeaderblock
                    {
                        Key = h.Key,
                        Value = h.Value
                    }).ToList()
                }).ToList()
            };

            // Note: You may also need to update ComponentTypes and the StorySessionData collection name
            return AddComponent(storyId, model, ComponentTypes.Media,
                g => manager.GetStory(storyId).Media.Add(g));
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

        
    }
}
