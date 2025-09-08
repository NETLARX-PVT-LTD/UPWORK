// ---------------------------------------------------------------------
// <copyright file="ComponentsController.cs" company="Netlarx">
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
    using Netlarx.Products.Gobot.ModelDTO;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Services;
    using System;
    using System.Collections.Generic;
    using System.IdentityModel.Tokens.Jwt;
    using System.IO;
    using System.Linq;
    using System.Reflection.PortableExecutable;
    using System.Threading.Tasks;
    using ProtoBuf;
    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Products.Gobot.Pipelines;

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
        public ComponentsController(IBotDbContext db, ILogger<ComponentsController> logger, StorySessionManager _manager)
        {
            _db = db;
            _logger = logger;
            manager = _manager;
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

        private BaseComponent? GetLastUnlinkedComponent(StorySessionData session)
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

        [MiddlewareFilter(typeof(ProtoPipeline))]
        [HttpPost("AddUserInputPhrase")]
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
        [MiddlewareFilter(typeof(ProtoPipeline))]
        [Consumes("application/x-protobuf")]
        public async Task<IActionResult> AddUserInputKeyword(int storyId)
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not UserInputBlock bl)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            //// 1. Read the binary request body
            //using var memoryStream = new MemoryStream();
            //await Request.Body.CopyToAsync(memoryStream);
            //memoryStream.Position = 0;

            //// 2. Deserialize the binary data to UserData
            //UserInputBlock bl;
            //try
            //{
            //    bl = UserInputBlock.Parser.ParseFrom(memoryStream);
            //}
            //catch
            //{
            //    return BadRequest("Invalid Protobuf data");
            //}

            if (bl == null)
            {
                _logger.LogWarning("Swagger sent null UserInputBlock");
                return BadRequest("Request body is missing or invalid.");
            }

            // Log input for debugging
            var jsonInput = System.Text.Json.JsonSerializer.Serialize(bl, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true
            });
            _logger.LogInformation("Received UserInputBlock: {Json}", jsonInput);

            // Generate a new ID for UserInputKeyword
            //Guid userInputKeywordId = Guid.NewGuid();

            // Build UserInputKeyword model
            var model = new Models.UserInputKeyword
            {
                StoryId = storyId,

                // Keyword groups
                KeywordGroups = bl.KeywordGroups?
                    .Select(kg => new Models.KeywordGroupp
                    {
                        Id = Guid.TryParse(kg.Id, out var guid) ? guid : Guid.NewGuid(),
                        //UserInputKeywordId = userInputKeywordId, // FK to parent
                        Keywords = kg.Keywords?
                            .Select(k => new Models.Keyword
                            {
                                Id = Guid.NewGuid(),
                                Value = k
                            })
                            .ToList() ?? new List<Models.Keyword>()
                    })
                    .ToList() ?? new List<Models.KeywordGroupp>(),

                // Plain keywords (if any)
                PlainKeywords = bl.Keywords?
                    .Select(k => new Models.PlainKeyword
                    {
                        Id = Guid.NewGuid(),
                        Value = k,
                        //UserInputKeywordId = userInputKeywordId
                    })
                    .ToList() ?? new List<Models.PlainKeyword>(),

                // Variables specific to Keyword input
                Variables = bl.AvailableVariables?
                    .Select(v => new Models.VariableKeyword
                    {
                        Id = Guid.NewGuid(),
                        Name = v.Name,
                        Type = v.Type,
                        //UserInputKeywordId = userInputKeywordId
                    })
                    .ToList() ?? new List<Models.VariableKeyword>()
            };

            var jsonModel = System.Text.Json.JsonSerializer.Serialize(model, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true, // Makes it readable
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            });

            // Log it
            _logger.LogInformation("UserInputKeyword model:\n{JsonModel}", jsonModel);

            // Add to DB or manager
            return AddComponent(
                storyId,
                model,
                ComponentTypes.UserInputKeyword,
                g => manager.GetStory(storyId).Keywords.Add(g)
            );
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
                //LinkStoryId = block.LinkStoryId,
                LinkStoryName = block.LinkStoryName,
                Type = block.Type
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
                                //jsonId = h.JsonId,
                                Key = h.HeaderKey ?? string.Empty,
                                Value = h.HeaderValue ?? string.Empty
                            })
                            .ToList()
            };
            return AddComponent(storyId, model, ComponentTypes.JsonAPI,
                 g => manager.GetStory(storyId).JsonAPIs.Add(g));
        }

        [HttpPost("AddConversationalform")]
        public IActionResult AddConversationalForm(int storyId, [FromBody] ConversationalFormBlock block)
        {
            var model = new ConversationalForm
            {
                StoryId = storyId,
                Type = block.Type,
                FormId = block.FormId,
                FormName = block.FormName,
                WebhookUrl = block.WebhookUrl,
                SendEmailNotification = block.SendEmailNotification,
                NotificationEmail = block.NotificationEmail,
                ShowAsInlineForm = block.ShowAsInlineForm,
                RenderFormResponses = block.RenderFormResponses,
                AllowMultipleSubmission = block.AllowMultipleSubmission,
                MultipleSubmissionMessage = block.MultipleSubmissionMessage,
                AllowExitForm = block.AllowExitForm,
                ExitFormMessage = block.ExitFormMessage,
                SuccessResponseType = block.SuccessResponseType,
                //SuccessRedirectStoryId = block.SuccessRedirectStoryId,
                ValidateEmail = block.ValidateEmail,
                ValidatePhone = block.ValidatePhone,
                SpamProtection = block.SpamProtection,
                RequireCompletion = block.RequireCompletion,
                SuccessMessage = block.SuccessMessage,
                RedirectUrl = block.RedirectUrl,

                // Map nested FormFields
                FormFields = block.FormFields?.Select(f => new FormField
                {
                    FormFieldId = f.FormFieldId,
                    Name = f.Name,
                    Type = f.Type,
                    Required = f.Required,
                    PromptPhrase = f.PromptPhrase,
                    Options = f.Options?.ToList(),
                    OptionsText = f.OptionsText
                }).ToList()
            };

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

        //// adding of media block api by ashutosh

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
            return AddComponent(storyId, model, ComponentTypes.Media, g => manager.GetStory(storyId).Medias.Add(g));
        }

        [HttpGet("GetMedia/{storyId}")]
        public async Task<IActionResult> GetMedia(int storyId)
        {
            // 1. Fetch the data using your internal DATABASE models
            var mediaEntity = await _db.Medias
                .Include(m => m.Slides)
                .Include(m => m.Buttons)
                    .ThenInclude(b => b.ApiHeaders)
                .FirstOrDefaultAsync(m => m.StoryId == storyId);

            if (mediaEntity == null)
            {
                return NotFound($"No Media component found for StoryId {storyId}");
            }

            // 2. Map the database entity to the clean API Model (DTO)
            var mediaBlockDto = new ModelDTO.MediaBlockDto
            {
                Type = "mediaBlock",
                MediaId = mediaEntity.MediaId,
                MediaType = (ModelDTO.MediaTypeDto)mediaEntity.MediaType,
                SingleImageUrl = mediaEntity.SingleImageUrl,
                VideoUrl = mediaEntity.VideoUrl,
                AudioUrl = mediaEntity.AudioUrl,
                FileUrl = mediaEntity.FileUrl,
                MediaName = mediaEntity.MediaName,
                ButtonTitle = mediaEntity.ButtonTitle,
                ButtonTextMessage = mediaEntity.ButtonTextMessage,
                ButtonType = mediaEntity.ButtonType,
                ButtonLinkedMediaId = mediaEntity.ButtonLinkedMediaId,
                ButtonUrl = mediaEntity.ButtonUrl,
                Slides = mediaEntity.Slides.Select(s => new ModelDTO.ImageSlideDto
                {
                    Url = s.Url,
                    Title = s.Title,
                    Description = s.Description
                }).ToList(),
                Buttons = mediaEntity.Buttons.Select(b => new ModelDTO.ButtonDto
                {
                    Id = b.ProtoId,
                    Title = b.Title,
                    Type = b.Type,
                    Value = b.Value,
                    TextMessage = b.TextMessage,
                    LinkedMediaId = b.LinkedMediaId,
                    Url = b.Url,
                    PhoneNumber = b.PhoneNumber,
                    StoryId = b.StoryId,
                    ApiHeaders = b.ApiHeaders.Select(h => new ModelDTO.ApiHeaderDto
                    {
                        Key = h.Key,
                        Value = h.Value
                    }).ToList()
                }).ToList()
            };

            // 3. Return the clean DTO to the user
            return Ok(mediaBlockDto);
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
                return NotFound($"No TextResponse found for StoryId {storyId}");
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
            var userInputKeywordss = await _db.UserInputKeywords.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (userInputKeywordss == null)
            {
                return NotFound($"No userInputKeywordss found for StoryId {storyId}");
            }

            return Ok(userInputKeywordss);
        }

        [HttpGet("GetUserInputAnything")]
        public async Task<IActionResult> GetUserInputAnything(int storyId)
        {
            var userInputTypeAnything = await _db.UserInputTypeAnythings.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (userInputTypeAnything == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(userInputTypeAnything);
        }

        [HttpGet("GetUserInputPhrases")]
        public async Task<IActionResult> GetUserInputPhrases(int storyId)
        {
            var UserInputPhrases = await _db.UserInputPhrases.FirstOrDefaultAsync(s => s.StoryId == storyId);

            if (UserInputPhrases == null)
            {
                return NotFound($"No LinkStory found for StoryId {storyId}");
            }

            return Ok(UserInputPhrases);
        }

    }
}
