// ---------------------------------------------------------------------
// <copyright file="StoryController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers
{
    using Chatbot;
    using Google.Protobuf.WellKnownTypes;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microsoft.SqlServer.Server;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Pipelines;
    using Netlarx.Products.Gobot.Services;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;
    using static System.Net.Mime.MediaTypeNames;

    [ApiController]
    [Route("api/[controller]")]
    public class StoryController : ControllerBase
    {
        private readonly IBotDbContext _db;
        private readonly ILogger<StoryController> _logger;

        public StoryController(IBotDbContext context, ILogger<StoryController> logger)
        {
            _db = context;
            _logger = logger;
        }

        [HttpGet("GetAllStorySchemaById/{storyId}")]
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
                var story = _db.Stories.FirstOrDefault(s => s.ID == storyId);

                var connection = await _db.Connection
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
                        var data = await _db.UserInputPhrases.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched UserInputPhrase ID: {Id}", currentId);
                    }
                    else if (currentType == ComponentTypes.UserInputKeyword)
                    {
                        var data = await _db.UserInputKeywords.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched UserInputKeyword ID: {Id}", currentId);
                    }
                    else if (currentType == ComponentTypes.UserInputTypeAnything)
                    {
                        var data = await _db.UserInputTypeAnythings.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched UserInputTypeAnything ID: {Id}", currentId);
                    }
                    else if (currentType == ComponentTypes.TypingDelay)
                    {
                        var data = await _db.TypingDelay.FirstOrDefaultAsync(td => td.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched typingDelay ID : ", currentId);
                    }
                    else if(currentType == ComponentTypes.LinkStory)
                    {
                        var data = await _db.LinkStory.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched LinkStory ID: {Id}", currentId);
                    }
                    else if(currentType == ComponentTypes.JsonAPI)
                    {
                        var data = await _db.JsonAPI.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched LinkStory ID: {Id}", currentId);
                    } 
                    else if(currentType == ComponentTypes.ConversationalForm)
                    {
                        var data = await _db.ConversationalForm.FirstOrDefaultAsync(u => u.ID == currentId);
                        if (data == null) break;
                        result.Add(data);
                        nextType = data.ToComponentType;
                        nextId = data.ToComponentId;
                        _logger.LogDebug("Fetched LinkStory ID: {Id}", currentId);
                    } 
                    else if(currentType == ComponentTypes.TextResponse)
                    {
                        var data = await _db.TextResponse.FirstOrDefaultAsync(u => u.ID == currentId);
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

        //[HttpPost("SaveStoryToDb")]
        //public async Task<ActionResult> SaveStoryToDb([FromBody] StorySessionData session)
        //{
        //    try
        //    {
        //        if (session == null)
        //        {
        //            _logger.LogWarning("Invalid session data received");
        //            return BadRequest("Invalid data");
        //        }

        //        // 1. Save Story first
        //        if (session.Story == null)
        //        {
        //            return BadRequest("Story data is required");
        //        }

        //        //await _db.Stories.AddAsync(session.Story);
        //        //await _db.SaveChangesAsync(); // This will assign Story.Id
        //        //var storyId = session.Story.ID;


        //        //_logger.LogInformation("Story saved with Id: {StoryId}", storyId);

        //        // Save phrases
        //        if (session.Phrases != null && session.Phrases.Any())
        //        {
        //            //foreach (var phrase in session.Phrases)
        //            //    phrase.StoryId = storyId;

        //            _db.UserInputPhrases.AddRange(session.Phrases);
        //        }

        //        // Save keywords
        //        if (session.Keywords != null && session.Keywords.Any())
        //        {

        //            _db.UserInputKeywords.AddRange(session.Keywords);
        //        }

        //        // Save "type anything"
        //        if (session.Anythings != null && session.Anythings.Any())
        //        {
        //            //foreach (var anything in session.Anythings)
        //            //    anything.StoryId = storyId;

        //            _db.UserInputTypeAnythings.AddRange(session.Anythings);
        //        }

        //        // Save connections
        //        if (session.Connections != null && session.Connections.Any())
        //        {
        //            //foreach (var conn in session.Connections)
        //            //    conn.StoryId = storyId;

        //            _db.Connection.AddRange(session.Connections);

        //            var firstConnection = session.Connections.FirstOrDefault();
        //            if (firstConnection != null)
        //            {
        //                var story = await _db.Stories
        //                                     .FirstOrDefaultAsync(s => s.ID == firstConnection.StoryId);

        //                if (story != null)
        //                {
        //                    story.RootBlockConnectionId = firstConnection.ID;
        //                    _db.Stories.Update(story);
        //                    _logger.LogInformation("Updated root connection for StoryId: {StoryId}", story.ID);
        //                }
        //                else
        //                {
        //                    // Story does not exist → create it
        //                    var newStory = new Stories
        //                    {
        //                        Name = session.Story.Name,
        //                        RootBlockConnectionId = firstConnection.ID
        //                    };

        //                    await _db.Stories.AddAsync(newStory);
        //                    _logger.LogInformation("Created new Story with StoryId: {StoryId}", newStory.ID);
        //                }
        //            }
        //        }

        //        // Save typing delays
        //        if (session.TypingDelays != null && session.TypingDelays.Any())
        //        {
        //            //foreach (var delay in session.TypingDelays)
        //            //    delay.StoryId = storyId;

        //            _db.TypingDelay.AddRange(session.TypingDelays);
        //        }

        //        // 7. Save conversational forms
        //        if (session.ConversationalForms != null && session.ConversationalForms.Any())
        //        {
        //            //foreach (var form in session.ConversationalForms)
        //            //    form.StoryId = storyId;

        //            _db.ConversationalForm.AddRange(session.ConversationalForms);
        //        }

        //        // 8. Save JSON APIs
        //        if (session.JsonAPIs != null && session.JsonAPIs.Any())
        //        {
        //            //foreach (var api in session.JsonAPIs)
        //            //    api.StoryId = storyId;

        //            _db.JsonAPI.AddRange(session.JsonAPIs);
        //        }

        //        // 9. Save text responses
        //        if (session.TextResponses != null && session.TextResponses.Any())
        //        {
        //            //foreach (var response in session.TextResponses)
        //            //    response.StoryId = storyId;

        //            _db.TextResponse.AddRange(session.TextResponses);
        //        }

        //        // 10. Save linked stories
        //        if (session.LinkStories != null && session.LinkStories.Any())
        //        {
        //            //foreach (var link in session.LinkStories)
        //            //    link.StoryId = storyId;

        //            _db.LinkStory.AddRange(session.LinkStories);
        //        }

        //        //Finally save all
        //        await _db.SaveChangesAsync();
        //        _logger.LogInformation("Session saved to DB successfully");

        //        return Ok(new { message = "Story saved to DB" });
        //    }
        //    catch (Exception ex)
        //    {
        //        var innerMessage = ex.InnerException?.Message ?? ex.Message;
        //        _logger.LogError(ex, "Error occurred while saving story session to DB");
        //        return StatusCode(500, new { error = innerMessage });
        //    }
        //}

        //[MiddlewareFilter(typeof(ProtoPipeline))]
        //[Consumes("application/x-protobuf")]
        //[MiddlewareFilter(typeof(ProtoPipeline))]
        //[HttpPost("SaveStoryToDbBlock")]
        //public async Task<ActionResult> SaveStoryToDbBlock()
        //{
        //    //Retrieve the deserialized Protobuf object from middleware
        //    if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not StorySessionDataBlock session)
        //    {
        //        _logger.LogWarning("Protobuf body missing or invalid");
        //        return BadRequest("Protobuf body missing or invalid");
        //    }

        //    try
        //    {
        //        if (session == null)
        //        {
        //            _logger.LogWarning("Invalid session data received");
        //            return BadRequest("Invalid data");
        //        }

        //        // 🟢 Step 1: Create ID map (frontend string IDs → backend GUIDs)
        //        var idMap = new Dictionary<string, Guid>();

        //        void MapId(string frontId)
        //        {
        //            if (string.IsNullOrEmpty(frontId)) return;
        //            if (!idMap.ContainsKey(frontId))
        //                idMap[frontId] = Guid.NewGuid();
        //        }

        //        // Map all blocks
        //        foreach (var phrase in session.Phrases)
        //            MapId(phrase.Id);
        //        foreach (var keyword in session.Keywords)
        //            MapId(keyword.Id);
        //        foreach (var any in session.Anythings)
        //            MapId(any.Id);
        //        foreach (var form in session.ConversationalForms)
        //            MapId(form.FormId);
        //        foreach (var delay in session.TypingDelays)
        //            MapId(delay.Id);
        //        foreach (var link in session.LinkStories)
        //            MapId(link.Id);
        //        foreach (var text in session.TextResponses)
        //            MapId(text.Id);
        //        foreach (var api in session.JsonAPIs)
        //            MapId(api.Id);
        //        foreach (var media in session.Medias)
        //            MapId(media.Id);
        //        foreach (var conn in session.Connections)
        //        {
        //            MapId(conn.Id);
        //            MapId(conn.FromComponentId);
        //        }

        //        // 1. Save Story first
        //        if (session.Story == null)
        //        {
        //            return BadRequest("Story data is required");
        //        }

        //        var Story = new Stories
        //        {
        //            Name = session.Story.Name,
        //            RootBlockConnectionId = Guid.Parse(session.Story.RootBlockConnectionId),
        //            CreatedDate = DateTime.UtcNow
        //        };

        //        _db.Stories.Add(Story);
        //        await _db.SaveChangesAsync();
        //        // 🔹 Map Block → DB Entity
        //        // 🔹 Map Block → DB Entity
        //        //var Phrases = session.Phrases != null
        //        //    ? session.Phrases.Select(p => new Models.UserInputPhrase
        //        //    {
        //        //        ID = Guid.Parse(p.Id),
        //        //        Phrase = p.PhraseText,
        //        //        ToComponentId = Guid.Parse(p.ToComponentId),
        //        //        ToComponentType = p.ToComponentType,
        //        //        Variables = p.AvailableVariables != null
        //        //                     ? p.AvailableVariables.Select(s => new Models.VariablePhrase
        //        //                     {
        //        //                         Name = s.Name,
        //        //                         Type = s.Type,
        //        //                         UserInputPhraseId = Guid.Parse(p.Id),
        //        //                     }).ToList() : new List<Models.VariablePhrase>(),
        //        //    }).ToList()
        //        //    : new List<Models.UserInputPhrase>();

        //        //// 🔹 Keywords
        //        //Keywords = session.Keywords != null
        //        //    ? session.Keywords.Select(bl => new Models.UserInputKeyword
        //        //    {
        //        //        StoryId = Story.ID,

        //        //        // Keyword groups
        //        //        KeywordGroups = bl.KeywordGroups?
        //        //            .Select(kg => new Models.KeywordGroupp
        //        //            {
        //        //                Keywords = kg.Keywords?
        //        //                    .Select(k => new Models.Keyword
        //        //                    {
        //        //                        Value = k,
        //        //                        KeywordGroupId = Guid.Parse(kg.Id)
        //        //                    })
        //        //                    .ToList() ?? new List<Models.Keyword>(),
        //        //                UserInputKeywordId = 
        //        //            })
        //        //            .ToList() ?? new List<Models.KeywordGroupp>(),

        //        //        // Plain keywords
        //        //        PlainKeywords = bl.Keywords?
        //        //            .Select(k => new Models.PlainKeyword
        //        //            {
        //        //                Id = Guid.NewGuid(),
        //        //                Value = k
        //        //            })
        //        //            .ToList() ?? new List<Models.PlainKeyword>(),

        //        //        // Variable keywords
        //        //        Variables = bl.AvailableVariables?
        //        //            .Select(v => new Models.VariableKeyword
        //        //            {
        //        //                Id = Guid.NewGuid(),
        //        //                Name = v.Name,
        //        //                Type = v.Type
        //        //            })
        //        //            .ToList() ?? new List<Models.VariableKeyword>()
        //        //    }).ToList()
        //        //    : new List<Models.UserInputKeyword>(),
        //        //Keywords = session.Keywords != null
        //        //           ? session.Keywords.Select(kw => new Models.UserInputKeyword
        //        //           {
        //        //               StoryId = Story.ID
        //        //           }).ToList(): new List<Models.UserInputKeyword>(),

        //        if (session.Phrases != null)
        //        {
        //            foreach (var a in session.Phrases)
        //            {
        //                var userInputPhrase = new Models.UserInputPhrase
        //                {
        //                    ID = Guid.NewGuid(),
        //                    StoryId = Story.ID,
        //                    Phrase = a.PhraseText // assuming a.Value is the string
        //                };

        //                // if session.Anythings contains variables too
        //                if (a.AvailableVariables != null)
        //                {
        //                    foreach (var variable in a.AvailableVariables)
        //                    {
        //                        var variablePhrase = new Models.VariablePhrase
        //                        {
        //                            UserInputPhraseId = userInputPhrase.ID,
        //                            Name = variable.Name,
        //                            Type = variable.Type
        //                        };

        //                        _db.PhraseVariables.Add(variablePhrase);
        //                    }
        //                }
        //                _db.UserInputPhrases.Add(userInputPhrase);
        //            }
        //        }
        //        if (session.Keywords != null)
        //        {
        //            foreach (var kw in session.Keywords)
        //            {
        //                var userInputKeyword = new Models.UserInputKeyword
        //                {
        //                    ID = Guid.NewGuid(),
        //                    StoryId = Story.ID
        //                };

        //                _db.UserInputKeywords.Add(userInputKeyword);

        //                foreach (var kwGro in kw.KeywordGroups) // depends on structure
        //                {
        //                    var keywordGroup = new Models.KeywordGroupp
        //                    {
        //                        UserInputKeywordId = userInputKeyword.ID
        //                    };

        //                    _db.KeywordGroups.Add(keywordGroup);
        //                    _db.SaveChanges();

        //                    // ✅ loop inside the property, not the object itself
        //                    foreach (var kwGroValue in kwGro.Keywords) // assuming Keywords is a collection inside KeywordGroupp
        //                    {
        //                        var keyword = new Models.Keyword
        //                        {
        //                            Value = kwGroValue,
        //                            KeywordGroupId = keywordGroup.Id
        //                        };

        //                        _db.Keywords.Add(keyword);
        //                    }
        //                }
        //                foreach (var keyword in kw.Keywords)
        //                {
        //                    var plainKeyword = new Models.PlainKeyword
        //                    {
        //                        UserInputKeywordId = userInputKeyword.ID,
        //                        Value = keyword
        //                    };
        //                    _db.PlainKeywords.Add(plainKeyword);
        //                }
        //                foreach (var variable in kw.AvailableVariables)
        //                {
        //                    var keywordVariable = new Models.VariableKeyword
        //                    {
        //                        UserInputKeywordId = userInputKeyword.ID,
        //                        Name = variable.Name,
        //                        Type = variable.Type
        //                    };
        //                    _db.KeywordVariables.Add(keywordVariable);
        //                }
        //            }

        //        }

        //        if (session.Anythings != null)
        //        {
        //            foreach (var a in session.Anythings)
        //            {
        //                var userInputAnything = new Models.UserInputTypeAnything
        //                {
        //                    ID = Guid.NewGuid(),
        //                    StoryId = Story.ID,
        //                    Anything = a.CustomMessage // assuming a.Value is the string
        //                };


        //                _db.UserInputTypeAnythings.Add(userInputAnything);

        //                //await _db.SaveChangesAsync();

        //                // if session.Anythings contains variables too
        //                if (a.AvailableVariables != null)
        //                {
        //                    foreach (var variable in a.AvailableVariables)
        //                    {
        //                        var variableAnything = new Models.VariableAnything
        //                        {
        //                            UserInputTypeAnything = userInputAnything,
        //                            Name = variable.Name,
        //                            Type = variable.Type
        //                        };

        //                        _db.AnythingVariables.Add(variableAnything);
        //                    }
        //                }
        //            }
        //        }


        //        // 🔹 Connections
        //        if (session.Connections != null)
        //        {
        //            foreach (var c in session.Connections)
        //            {
        //                _db.Connection.Add(new Models.Connection
        //                {
        //                    ID = Guid.NewGuid(),
        //                    FromComponentType = c.FromComponentType,
        //                    FromComponentId = Guid.Parse(c.FromComponentId),
        //                    StoryId = Story.ID
        //                });
        //            }
        //        }

        //        // 🔹 Typing Delays
        //        if (session.TypingDelays != null)
        //        {
        //            foreach (var t in session.TypingDelays)
        //            {
        //                _db.TypingDelay.Add(new Models.TypingDelay
        //                {
        //                    ID = Guid.NewGuid(),
        //                    DelaySeconds = t.DelaySeconds,
        //                    StoryId = Story.ID,
        //                    ToComponentId = Guid.Parse(t.ToComponentId),
        //                    ToComponentType = t.ToComponentType,
        //                    Type = t.Type,
        //                    CreatedDate = DateTime.UtcNow
        //                });
        //            }
        //        }

        //        // 🔹 Conversational Forms
        //        if (session.ConversationalForms != null)
        //        {
        //            foreach (var cf in session.ConversationalForms)
        //            {
        //                var form = new Models.ConversationalForm
        //                {
        //                    ID = Guid.NewGuid(),
        //                    StoryId = session.Story.Id,    // assuming you want to link to Story
        //                    Type = cf.Type,
        //                    FormName = cf.FormName,
        //                    WebhookUrl = cf.WebhookUrl,
        //                    SendEmailNotification = cf.SendEmailNotification,
        //                    NotificationEmail = cf.NotificationEmail,
        //                    ShowAsInlineForm = cf.ShowAsInlineForm,
        //                    RenderFormResponses = cf.RenderFormResponses,
        //                    AllowMultipleSubmission = cf.AllowMultipleSubmission,
        //                    MultipleSubmissionMessage = cf.MultipleSubmissionMessage,
        //                    AllowExitForm = cf.AllowExitForm,
        //                    ExitFormMessage = cf.ExitFormMessage,
        //                    SuccessResponseType = cf.SuccessResponseType,
        //                    ValidateEmail = cf.ValidateEmail,
        //                    ValidatePhone = cf.ValidatePhone,
        //                    SpamProtection = cf.SpamProtection,
        //                    RequireCompletion = cf.RequireCompletion,
        //                    SuccessMessage = cf.SuccessMessage,
        //                    RedirectUrl = cf.RedirectUrl
        //                };

        //                foreach (var f in cf.FormFields)
        //                {
        //                    var formfield = new Models.FormField
        //                    {
        //                        FormFieldId = f.FormFieldId,
        //                        Name = f.Name,
        //                        Type = f.Type,
        //                        Required = f.Required,
        //                        PromptPhrase = f.PromptPhrase,
        //                        Options = f.Options?.ToList(),
        //                        OptionsText = f.OptionsText,
        //                        ConversationalFormId = form.ID
        //                    };

        //                    _db.FormFields.Add(formfield);
        //                }
        //                _db.ConversationalForm.Add(form);
        //            }
        //        }

        //        // 🔹 JSON APIs
        //        if (session.JsonAPIs != null)
        //        {
        //            foreach (var api in session.JsonAPIs)
        //            {
        //                Guid modelId = Guid.NewGuid();
        //                var jsonApi = new Models.JsonAPI
        //                {
        //                    ID = modelId,
        //                    StoryId = Story.ID,
        //                    Type = api.Type,
        //                    ApiEndpoint = api.ApiEndpoint,
        //                    RequestType = api.RequestType,

        //                    // Map ApiHeaders (Proto → C#)
        //                    ApiHeaders = api.ApiHeaders.Select(h => new Models.ApiHeader
        //                    {
        //                        jsonId = modelId,
        //                        Key = h.HeaderKey,
        //                        Value = h.HeaderValue
        //                    }).ToList(),

        //                    // BaseComponent fields
        //                    ToComponentType = api.ToComponentType,
        //                    ToComponentId = Guid.Parse(api.ToComponentId)
        //                };

        //                _db.JsonAPI.Add(jsonApi);
        //            }
        //        }

        //        // 🔹Text Responses
        //        if (session.TextResponses != null)
        //        {
        //            foreach (var tr in session.TextResponses)
        //            {
        //                Guid quickReplyId = Guid.NewGuid();
        //               foreach(var qr in tr.QuickReplies)
        //                {
        //                    var QuickReply = new Models.QuickReplyModel
        //                    {
        //                        ID = quickReplyId,
        //                        Text = qr.Text
        //                    };
        //                }
        //                var textResponse = new Models.TextResponse
        //                {
        //                    ID = Guid.NewGuid(),
        //                    StoryId = Story.ID,  // link to parent story
        //                    Type = tr.Type,      // coming from proto
        //                    Content = tr.Content,
        //                    AlternateResponses = tr.AlternateResponses?.ToList() ?? new List<string>(),
        //                    QuickReplyId = quickReplyId,
        //                    // BaseComponent fields
        //                    ToComponentType = tr.ToComponentType,
        //                    ToComponentId = Guid.Parse(tr.ToComponentId)
        //                };

        //                _db.TextResponse.Add(textResponse);
        //            }
        //        }

        //        // 🔹 Link Stories
        //        if (session.LinkStories != null)
        //        {
        //            foreach (var ls in session.LinkStories)
        //            {
        //                _db.LinkStory.Add(new Models.LinkStory
        //                {
        //                    ID = Guid.NewGuid(),
        //                    LinkStoryId = ls.LinkStoryId,
        //                    LinkStoryName = ls.LinkStoryName,
        //                    ToComponentId = Guid.Parse(ls.ToComponentId),
        //                    ToComponentType = ls.ToComponentType,
        //                    Type = ls.Type
        //                });
        //            }
        //        }

        //        // 🔹 Media
        //        if (session.Medias != null)
        //        {
        //            foreach (var m in session.Medias)
        //            {
        //                var media = new Models.Media
        //                {
        //                    ID = Guid.NewGuid(),
        //                    StoryId = Story.ID, // link to parent story

        //                    MediaId = m.MediaId,
        //                    MediaType = (Models.MediaTypeblock)m.MediaType, // enum mapping
        //                    SingleImageUrl = m.SingleImageUrl,
        //                    VideoUrl = m.VideoUrl,
        //                    AudioUrl = m.AudioUrl,
        //                    FileUrl = m.FileUrl,
        //                    MediaName = m.MediaName,

        //                    // Button props
        //                    ButtonTitle = m.ButtonTitle,
        //                    ButtonTextMessage = m.ButtonTextMessage,
        //                    ButtonType = m.ButtonType,
        //                    ButtonLinkedMediaId = m.ButtonLinkedMediaId,
        //                    ButtonUrl = m.ButtonUrl,

        //                    // BaseComponent props
        //                    ToComponentType = m.ToComponentType,
        //                    ToComponentId = Guid.Parse(m.ToComponentId),

        //                    // Map slides
        //                    Slides = m.Slides.Select(s => new Models.ImageSlideblock
        //                    {
        //                        Url = s.Url,
        //                        Title = s.Title,
        //                        Description = s.Description
        //                    }).ToList(),

        //                    // Map buttons
        //                    Buttons = m.Buttons.Select(b => new Models.Buttonblock
        //                    {
        //                        Title = b.Title,
        //                        Type = b.Type,
        //                        Url = b.Url,
        //                        TextMessage = b.TextMessage,
        //                        LinkedMediaId = b.LinkedMediaId
        //                    }).ToList()
        //                };

        //                _db.Medias.Add(media);
        //            }
        //        }

        //        //Finally save all
        //        await _db.SaveChangesAsync();
        //        _logger.LogInformation("Session saved to DB successfully");

        //        return Ok(new { message = "Story saved to DB" });
        //    }
        //    catch (Exception ex)
        //    {
        //        var innerMessage = ex.InnerException?.Message ?? ex.Message;
        //        _logger.LogError(ex, "Error occurred while saving story session to DB");
        //        return StatusCode(500, new { error = innerMessage });
        //    }
        //}

        /* Working fine */
        //[MiddlewareFilter(typeof(ProtoPipeline))]
        //[HttpPost("SaveStoryToDbBlock")]
        //public async Task<ActionResult> SaveStoryToDbBlock()
        //{
        //    // Retrieve the deserialized Protobuf object from middleware
        //    if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not StorySessionDataBlock session)
        //    {
        //        _logger.LogWarning("Protobuf body missing or invalid");
        //        return BadRequest("Protobuf body missing or invalid");
        //    }

        //    try
        //    {
        //        if (session.Story == null)
        //            return BadRequest("Story data is required");

        //        // 1️⃣ Generate backend GUIDs for all blocks including Story
        //        var idMap = new Dictionary<string, Guid>(); // frontend ID -> backend GUID

        //        void MapId(string frontId)
        //        {
        //            if (string.IsNullOrEmpty(frontId)) return;
        //            if (!idMap.ContainsKey(frontId))
        //                idMap[frontId] = Guid.NewGuid();
        //        }

        //        // Map Story and RootBlockConnectionId
        //        //MapId(session.Story.Id);
        //        MapId(session.Story.RootBlockConnectionId);

        //        foreach (var phrase in session.Phrases)
        //        {
        //            MapId(phrase.Id);
        //            MapId(phrase.ToComponentId);
        //        };
        //        foreach (var keyword in session.Keywords)
        //        {
        //            MapId(keyword.Id);
        //            MapId(keyword.ToComponentId);
        //        }
        //        ;
        //        foreach (var any in session.Anythings)
        //        {
        //            MapId(any.Id);
        //            MapId(any.ToComponentId);
        //        }
        //        foreach (var form in session.ConversationalForms)
        //        {
        //            MapId(form.FormId);
        //            MapId(form.ToComponentId);
        //        }
        //        foreach (var delay in session.TypingDelays)
        //        {
        //            MapId(delay.Id);
        //            MapId(delay.ToComponentId);
        //        }
        //        ;
        //        foreach (var link in session.LinkStories)
        //        {
        //            MapId(link.Id);
        //            MapId(link.ToComponentId);
        //        }
        //        ;
        //        foreach (var text in session.TextResponses)
        //        {
        //            MapId(text.Id);
        //            MapId(text.ToComponentId);
        //        }
        //        foreach (var api in session.JsonAPIs)
        //        {
        //            MapId(api.Id);
        //            MapId(api.ToComponentId);
        //        }
        //        foreach (var media in session.Medias)
        //        {
        //            MapId(media.Id);
        //            MapId(media.ToComponentId);
        //        }
        //        foreach (var conn in session.Connections)
        //        {
        //            MapId(conn.Id);
        //            MapId(conn.FromComponentId);
        //        }

        //        Guid GetMappedId(string frontId)
        //        {
        //            if (string.IsNullOrEmpty(frontId)) return Guid.Empty; // or some default/fallback
        //            return idMap[frontId];
        //        }

        //        // 2️⃣ Save Story first
        //        //var storyGuid = idMap[session.Story.Id];
        //        var rootBlockGuid = idMap[session.Story.RootBlockConnectionId];

        //        var Story = new Stories
        //        {
        //            Name = session.Story.Name,
        //            RootBlockConnectionId = rootBlockGuid,
        //            CreatedDate = DateTime.UtcNow
        //        };
        //        _db.Stories.Add(Story);
        //        await _db.SaveChangesAsync();

        //        // 3️⃣ Save Phrases
        //        foreach (var a in session.Phrases)
        //        {
        //            var phraseGuid = GetMappedId[a.Id];
        //            var userInputPhrase = new Models.UserInputPhrase
        //            {
        //                ID = phraseGuid,
        //                StoryId = Story.ID,
        //                Phrase = a.PhraseText,
        //                ToComponentId = GetMappedId(a.ToComponentId),
        //                ToComponentType = a.ToComponentType
        //            };

        //            if (a.AvailableVariables != null)
        //            {
        //                foreach (var variable in a.AvailableVariables)
        //                {
        //                    _db.PhraseVariables.Add(new Models.VariablePhrase
        //                    {
        //                        UserInputPhraseId = phraseGuid,
        //                        Name = variable.Name,
        //                        Type = variable.Type
        //                    });
        //                }
        //            }

        //            _db.UserInputPhrases.Add(userInputPhrase);
        //        }

        //        // 4️⃣ Save Keywords
        //        foreach (var kw in session.Keywords)
        //        {
        //            var kwGuid = GetMappedId[kw.Id];
        //            var userInputKeyword = new Models.UserInputKeyword
        //            {
        //                ID = kwGuid,
        //                StoryId = Story.ID
        //            };
        //            _db.UserInputKeywords.Add(userInputKeyword);

        //            foreach (var kwGro in kw.KeywordGroups)
        //            {
        //                var keywordGroup = new Models.KeywordGroupp
        //                {
        //                    UserInputKeywordId = kwGuid
        //                };
        //                _db.KeywordGroups.Add(keywordGroup);
        //                await _db.SaveChangesAsync();

        //                foreach (var kwVal in kwGro.Keywords)
        //                {
        //                    _db.Keywords.Add(new Models.Keyword
        //                    {
        //                        Value = kwVal,
        //                        KeywordGroupId = keywordGroup.Id
        //                    });
        //                }
        //            }

        //            foreach (var k in kw.Keywords)
        //            {
        //                _db.PlainKeywords.Add(new Models.PlainKeyword
        //                {
        //                    UserInputKeywordId = kwGuid,
        //                    Value = k
        //                });
        //            }

        //            foreach (var v in kw.AvailableVariables)
        //            {
        //                _db.KeywordVariables.Add(new Models.VariableKeyword
        //                {
        //                    UserInputKeywordId = kwGuid,
        //                    Name = v.Name,
        //                    Type = v.Type
        //                });
        //            }
        //        }

        //        // 5️⃣ Save Anythings
        //        foreach (var a in session.Anythings)
        //        {
        //            var anyGuid = idMap[a.Id];
        //            var userInputAnything = new Models.UserInputTypeAnything
        //            {
        //                ID = anyGuid,
        //                StoryId = Story.ID,
        //                Anything = a.CustomMessage
        //            };
        //            _db.UserInputTypeAnythings.Add(userInputAnything);

        //            if (a.AvailableVariables != null)
        //            {
        //                foreach (var variable in a.AvailableVariables)
        //                {
        //                    _db.AnythingVariables.Add(new Models.VariableAnything
        //                    {
        //                        UserInputTypeAnything = userInputAnything,
        //                        Name = variable.Name,
        //                        Type = variable.Type
        //                    });
        //                }
        //            }
        //        }

        //        // 6️⃣ Save Connections
        //        foreach (var c in session.Connections)
        //        {
        //            _db.Connection.Add(new Models.Connection
        //            {
        //                ID = idMap[c.Id],
        //                StoryId = Story.ID,
        //                FromComponentId = idMap[c.FromComponentId],
        //                FromComponentType = c.FromComponentType
        //            });
        //        }

        //        // 7️⃣ Save TypingDelays
        //        foreach (var t in session.TypingDelays)
        //        {
        //            _db.TypingDelay.Add(new Models.TypingDelay
        //            {
        //                ID = idMap[t.Id],
        //                StoryId = Story.ID,
        //                DelaySeconds = t.DelaySeconds,
        //                ToComponentId = idMap[t.ToComponentId],
        //                ToComponentType = t.ToComponentType,
        //                Type = t.Type,
        //                CreatedDate = DateTime.UtcNow
        //            });
        //        }

        //        // 8️⃣ Save Conversational Forms
        //        foreach (var cf in session.ConversationalForms)
        //        {
        //            var formGuid = idMap[cf.FormId];
        //            var form = new Models.ConversationalForm
        //            {
        //                ID = formGuid,
        //                StoryId = Story.ID,
        //                FormName = cf.FormName,
        //                WebhookUrl = cf.WebhookUrl,
        //                SendEmailNotification = cf.SendEmailNotification,
        //                NotificationEmail = cf.NotificationEmail,
        //                ShowAsInlineForm = cf.ShowAsInlineForm,
        //                RenderFormResponses = cf.RenderFormResponses,
        //                AllowMultipleSubmission = cf.AllowMultipleSubmission,
        //                MultipleSubmissionMessage = cf.MultipleSubmissionMessage,
        //                AllowExitForm = cf.AllowExitForm,
        //                ExitFormMessage = cf.ExitFormMessage,
        //                SuccessResponseType = cf.SuccessResponseType,
        //                ValidateEmail = cf.ValidateEmail,
        //                ValidatePhone = cf.ValidatePhone,
        //                SpamProtection = cf.SpamProtection,
        //                RequireCompletion = cf.RequireCompletion,
        //                SuccessMessage = cf.SuccessMessage,
        //                RedirectUrl = cf.RedirectUrl
        //            };

        //            foreach (var f in cf.FormFields)
        //            {
        //                _db.FormFields.Add(new Models.FormField
        //                {
        //                    Name = f.Name,
        //                    Type = f.Type,
        //                    Required = f.Required,
        //                    PromptPhrase = f.PromptPhrase,
        //                    Options = f.Options?.ToList(),
        //                    OptionsText = f.OptionsText,
        //                    ConversationalFormId = formGuid
        //                });
        //            }
        //            _db.ConversationalForm.Add(form);
        //        }

        //        // 9️⃣ Save TextResponses
        //        foreach (var tr in session.TextResponses)
        //        {
        //            var trGuid = idMap[tr.Id];
        //            var quickReplyId = Guid.NewGuid();
        //            foreach (var qr in tr.QuickReplies)
        //            {
        //                _db.QuickReplies.Add(new Models.QuickReplyModel
        //                {
        //                    ID = quickReplyId,
        //                    Text = qr.Text
        //                });
        //            }

        //            _db.TextResponse.Add(new Models.TextResponse
        //            {
        //                ID = trGuid,
        //                StoryId = Story.ID,
        //                Type = tr.Type,
        //                Content = tr.Content,
        //                //AlternateResponses = tr.AlternateResponses?.ToList() ?? new List<string>(),
        //                QuickReplyId = quickReplyId,
        //                ToComponentId = idMap[tr.ToComponentId],
        //                ToComponentType = tr.ToComponentType
        //            });
        //        }

        //        // 🔟 Save LinkStories
        //        foreach (var ls in session.LinkStories)
        //        {
        //            var lsGuid = idMap[ls.Id];
        //            _db.LinkStory.Add(new Models.LinkStory
        //            {
        //                ID = lsGuid,
        //                LinkStoryId = ls.LinkStoryId,
        //                LinkStoryName = ls.LinkStoryName,
        //                ToComponentId = idMap[ls.ToComponentId],
        //                ToComponentType = ls.ToComponentType,
        //                Type = ls.Type
        //            });
        //        }

        //        // 1️⃣1️⃣ Save JsonAPIs
        //        foreach (var api in session.JsonAPIs)
        //        {
        //            var apiGuid = idMap[api.Id];
        //            var jsonApi = new Models.JsonAPI
        //            {
        //                ID = apiGuid,
        //                StoryId = Story.ID,
        //                Type = api.Type,
        //                ApiEndpoint = api.ApiEndpoint,
        //                RequestType = api.RequestType,
        //                ToComponentType = api.ToComponentType,
        //                ToComponentId = idMap[api.ToComponentId],
        //                ApiHeaders = api.ApiHeaders.Select(h => new Models.ApiHeader
        //                {
        //                    jsonId = apiGuid,
        //                    Key = h.HeaderKey,
        //                    Value = h.HeaderValue
        //                }).ToList()
        //            };
        //            _db.JsonAPI.Add(jsonApi);
        //        }

        //        // 1️⃣2️⃣ Save Media
        //        foreach (var m in session.Medias)
        //        {
        //            var mediaGuid = idMap[m.Id];
        //            var media = new Models.Media
        //            {
        //                ID = mediaGuid,
        //                StoryId = Story.ID,
        //                MediaId = m.MediaId,
        //                MediaType = (Models.MediaTypeblock)m.MediaType,
        //                SingleImageUrl = m.SingleImageUrl,
        //                VideoUrl = m.VideoUrl,
        //                AudioUrl = m.AudioUrl,
        //                FileUrl = m.FileUrl,
        //                MediaName = m.MediaName,
        //                ButtonTitle = m.ButtonTitle,
        //                ButtonTextMessage = m.ButtonTextMessage,
        //                ButtonType = m.ButtonType,
        //                ButtonLinkedMediaId = m.ButtonLinkedMediaId,
        //                ButtonUrl = m.ButtonUrl,
        //                ToComponentType = m.ToComponentType,
        //                ToComponentId = idMap[m.ToComponentId],
        //                Slides = m.Slides.Select(s => new Models.ImageSlideblock
        //                {
        //                    Url = s.Url,
        //                    Title = s.Title,
        //                    Description = s.Description
        //                }).ToList(),
        //                Buttons = m.Buttons.Select(b => new Models.Buttonblock
        //                {
        //                    Title = b.Title,
        //                    Type = b.Type,
        //                    Url = b.Url,
        //                    TextMessage = b.TextMessage,
        //                    LinkedMediaId = b.LinkedMediaId
        //                }).ToList()
        //            };
        //            _db.Medias.Add(media);
        //        }

        //        // 🔹 Finally save everything
        //        await _db.SaveChangesAsync();
        //        _logger.LogInformation("Story session saved successfully with backend-generated GUIDs.");

        //        return Ok(new { message = "Story saved successfully." });
        //    }
        //    catch (Exception ex)
        //    {
        //        var innerMessage = ex.InnerException?.Message ?? ex.Message;
        //        _logger.LogError(ex, "Error saving story session to DB");
        //        return StatusCode(500, new { error = innerMessage });
        //    }
        //}
        [MiddlewareFilter(typeof(ProtoPipeline))]
        [HttpPost("SaveStoryToDbBlock")]
        public async Task<ActionResult> SaveStoryToDbBlock()
        {
            // Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not StorySessionDataBlock session)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            try
            {
                if (session.Story == null)
                    return BadRequest("Story data is required");

                // 1️⃣ Generate backend GUIDs for all blocks including Story
                var idMap = new Dictionary<string, Guid>(); // frontend ID -> backend GUID

                void MapId(string frontId)
                {
                    if (string.IsNullOrEmpty(frontId)) return;
                    if (!idMap.ContainsKey(frontId))
                        idMap[frontId] = Guid.NewGuid();
                }

                Guid GetMappedId(string frontId)
                {
                    if (string.IsNullOrEmpty(frontId)) return Guid.Empty; // fallback for empty IDs
                    return idMap.TryGetValue(frontId, out var guid) ? guid : Guid.NewGuid();
                }

                // Map Story RootBlockConnectionId
                MapId(session.Story.RootBlockConnectionId);

                // Map all block IDs and ToComponentIds
                foreach (var b in session.Phrases.Cast<dynamic>()
                             .Concat(session.Keywords.Cast<dynamic>())
                             .Concat(session.Anythings.Cast<dynamic>())
                             .Concat(session.TypingDelays.Cast<dynamic>())
                             .Concat(session.LinkStories.Cast<dynamic>())
                             .Concat(session.TextResponses.Cast<dynamic>())
                             .Concat(session.JsonAPIs.Cast<dynamic>())
                             .Concat(session.Medias.Cast<dynamic>()))
                {
                    MapId(b.Id);
                    MapId(b.ToComponentId);
                }

                foreach (var form in session.ConversationalForms)
                {
                    MapId(form.FormId);
                    MapId(form.ToComponentId);
                }

                foreach (var tr in session.TextResponses)
                {
                    foreach (var qr in tr.QuickReplies)
                    {
                        MapId(qr.ToComponentId);
                    }
                }

                foreach (var c in session.Connections)
                {
                    MapId(c.Id);
                    MapId(c.FromComponentId);
                }

                // 2️⃣ Save Story first
                var rootBlockGuid = GetMappedId(session.Story.RootBlockConnectionId);

                var Story = new Stories
                {
                    Name = string.IsNullOrWhiteSpace(session.Story.Name)
                                    ? "New Story"
                                    : session.Story.Name,
                                    RootBlockConnectionId = rootBlockGuid,
                                    CreatedDate = DateTime.UtcNow,
                                    BotId = session.Story.Name
                };


                _db.Stories.Add(Story);
                await _db.SaveChangesAsync();

                // 3️⃣ Save Phrases
                foreach (var a in session.Phrases)
                {
                    var phraseGuid = GetMappedId(a.Id);
                    var userInputPhrase = new Models.UserInputPhrase
                    {
                        ID = phraseGuid,
                        StoryId = Story.ID,
                        Phrase = a.PhraseText,
                        ToComponentId = GetMappedId(a.ToComponentId),
                        ToComponentType = a.ToComponentType
                    };

                    if (a.AvailableVariables != null)
                    {
                        foreach (var variable in a.AvailableVariables)
                        {
                            _db.PhraseVariables.Add(new Models.VariablePhrase
                            {
                                UserInputPhraseId = phraseGuid,
                                Name = variable.Name,
                                Type = variable.Type
                            });
                        }
                    }

                    _db.UserInputPhrases.Add(userInputPhrase);
                }

                // 4️⃣ Save Keywords
                foreach (var kw in session.Keywords)
                {
                    var kwGuid = GetMappedId(kw.Id);
                    var userInputKeyword = new Models.UserInputKeyword
                    {
                        ID = kwGuid,
                        StoryId = Story.ID,
                        ToComponentId = GetMappedId(kw.ToComponentId),
                        ToComponentType = kw.ToComponentType
                    };
                    _db.UserInputKeywords.Add(userInputKeyword);

                    foreach (var kwGro in kw.KeywordGroups)
                    {
                        var keywordGroup = new Models.KeywordGroupp
                        {
                            UserInputKeywordId = kwGuid
                        };
                        _db.KeywordGroups.Add(keywordGroup);
                        await _db.SaveChangesAsync();

                        foreach (var kwVal in kwGro.Keywords)
                        {
                            _db.Keywords.Add(new Models.Keyword
                            {
                                Value = kwVal,
                                KeywordGroupId = keywordGroup.Id
                            });
                        }
                    }

                    foreach (var k in kw.Keywords)
                    {
                        _db.PlainKeywords.Add(new Models.PlainKeyword
                        {
                            UserInputKeywordId = kwGuid,
                            Value = k
                        });
                    }

                    foreach (var v in kw.AvailableVariables)
                    {
                        _db.KeywordVariables.Add(new Models.VariableKeyword
                        {
                            UserInputKeywordId = kwGuid,
                            Name = v.Name,
                            Type = v.Type
                        });
                    }
                }

                // 5️⃣ Save Anythings
                foreach (var a in session.Anythings)
                {
                    var anyGuid = GetMappedId(a.Id);
                    var userInputAnything = new Models.UserInputTypeAnything
                    {
                        ID = anyGuid,
                        StoryId = Story.ID,
                        Anything = a.CustomMessage,
                        ToComponentId = GetMappedId(a.ToComponentId),
                        ToComponentType = a.ToComponentType
                    };
                    _db.UserInputTypeAnythings.Add(userInputAnything);

                    if (a.AvailableVariables != null)
                    {
                        foreach (var variable in a.AvailableVariables)
                        {
                            _db.AnythingVariables.Add(new Models.VariableAnything
                            {
                                UserInputTypeAnything = userInputAnything,
                                Name = variable.Name,
                                Type = variable.Type
                            });
                        }
                    }
                }

                // 6️⃣ Save Connections
                foreach (var c in session.Connections)
                {
                    _db.Connection.Add(new Models.Connection
                    {
                        ID = GetMappedId(c.Id),
                        StoryId = Story.ID,
                        FromComponentId = GetMappedId(c.FromComponentId),
                        FromComponentType = c.FromComponentType
                    });
                }

                // 7️⃣ Save TypingDelays
                foreach (var t in session.TypingDelays)
                {
                    _db.TypingDelay.Add(new Models.TypingDelay
                    {
                        ID = GetMappedId(t.Id),
                        StoryId = Story.ID,
                        DelaySeconds = t.DelaySeconds,
                        ToComponentId = GetMappedId(t.ToComponentId),
                        ToComponentType = t.ToComponentType,
                        Type = t.Type,
                        CreatedDate = DateTime.UtcNow
                    });
                }

                // 8️⃣ Save Conversational Forms
                foreach (var cf in session.ConversationalForms)
                {
                    var formGuid = GetMappedId(cf.FormId);
                    var form = new Models.ConversationalForm
                    {
                        ID = formGuid,
                        StoryId = Story.ID,
                        FormName = cf.FormName,
                        WebhookUrl = cf.WebhookUrl,
                        SendEmailNotification = cf.SendEmailNotification,
                        NotificationEmail = cf.NotificationEmail,
                        ShowAsInlineForm = cf.ShowAsInlineForm,
                        RenderFormResponses = cf.RenderFormResponses,
                        AllowMultipleSubmission = cf.AllowMultipleSubmission,
                        MultipleSubmissionMessage = cf.MultipleSubmissionMessage,
                        AllowExitForm = cf.AllowExitForm,
                        ExitFormMessage = cf.ExitFormMessage,
                        SuccessResponseType = cf.SuccessResponseType,
                        ValidateEmail = cf.ValidateEmail,
                        ValidatePhone = cf.ValidatePhone,
                        SpamProtection = cf.SpamProtection,
                        RequireCompletion = cf.RequireCompletion,
                        SuccessMessage = cf.SuccessMessage,
                        RedirectUrl = cf.RedirectUrl,
                        Type = cf.Type
                    };

                    foreach (var f in cf.FormFields)
                    {
                        _db.FormFields.Add(new Models.FormField
                        {
                            Name = f.Name,
                            Type = f.Type,
                            Required = f.Required,
                            PromptPhrase = f.PromptPhrase,
                            Options = f.Options?.ToList(),
                            OptionsText = f.OptionsText,
                            ConversationalFormId = formGuid
                        });
                    }
                    _db.ConversationalForm.Add(form);
                }

                // 9️⃣ Save TextResponses
                foreach (var tr in session.TextResponses)
                {
                    var trGuid = GetMappedId(tr.Id);
                    var quickReplyId = Guid.NewGuid();
                    foreach (var qr in tr.QuickReplies)
                    {
                        _db.QuickReplies.Add(new Models.QuickReplyModel
                        {
                            ID = Guid.NewGuid(),
                            Text = qr.Text,
                            ToComponentType = tr.ToComponentType,
                            ToComponentId = GetMappedId(qr.ToComponentId),
                            textResponseId = trGuid
                        });
                    }

                    _db.TextResponse.Add(new Models.TextResponse
                    {
                        ID = trGuid,
                        StoryId = Story.ID,
                        Type = tr.Type,
                        Content = tr.Content,
                        QuickReplyId = quickReplyId,
                        ToComponentId = GetMappedId(tr.ToComponentId),
                        ToComponentType = tr.ToComponentType,
                        AlternateResponses = tr.AlternateResponses?.ToList() ?? new List<string>()
                    });
                }

                // 🔟 Save LinkStories
                foreach (var ls in session.LinkStories)
                {
                    _db.LinkStory.Add(new Models.LinkStory
                    {
                        ID = GetMappedId(ls.Id),
                        LinkStoryId = ls.LinkStoryId,
                        LinkStoryName = ls.LinkStoryName,
                        ToComponentId = GetMappedId(ls.ToComponentId),
                        ToComponentType = ls.ToComponentType,
                        Type = ls.Type
                    });
                }

                // 1️⃣1️⃣ Save JsonAPIs
                foreach (var api in session.JsonAPIs)
                {
                    var apiGuid = GetMappedId(api.Id);
                    var jsonApi = new Models.JsonAPI
                    {
                        ID = apiGuid,
                        StoryId = Story.ID,
                        Type = api.Type,
                        ApiEndpoint = api.ApiEndpoint,
                        RequestType = api.RequestType,
                        ToComponentType = api.ToComponentType,
                        ToComponentId = GetMappedId(api.ToComponentId),
                        ApiHeaders = (api.ApiHeaders).Select(h => new Models.ApiHeader
                        {
                            jsonId = apiGuid,
                            Key = h.HeaderKey,
                            Value = h.HeaderValue
                        }).ToList()
                    };

                    //foreach (var f in api.ApiHeaders)
                    //{
                    //    _db.ApiHeaders.Add(new Models.ApiHeader
                    //    {
                    //        jsonId = apiGuid,
                    //        Key = f.HeaderKey,
                    //        Value = f.HeaderValue,
                    //        Id = Guid.NewGuid()
                    //    });
                    //}
                    _db.JsonAPI.Add(jsonApi);
                }

                // 1️⃣2️⃣ Save Medias
                foreach (var m in session.Medias)
                {
                    var mediaGuid = GetMappedId(m.Id);
                    var media = new Models.Media
                    {
                        ID = mediaGuid,
                        StoryId = Story.ID,
                        MediaId = m.MediaId,
                        MediaType = (Models.MediaTypeblock)m.MediaType,
                        SingleImageUrl = m.SingleImageUrl,
                        VideoUrl = m.VideoUrl,
                        AudioUrl = m.AudioUrl,
                        FileUrl = m.FileUrl,
                        MediaName = m.MediaName,
                        ButtonTitle = m.ButtonTitle,
                        ButtonTextMessage = m.ButtonTextMessage,
                        ButtonType = m.ButtonType,
                        ButtonLinkedMediaId = m.ButtonLinkedMediaId,
                        ButtonUrl = m.ButtonUrl,
                        ToComponentType = m.ToComponentType,
                        ToComponentId = GetMappedId(m.ToComponentId),
                        Slides = (m.Slides).Select(s => new Models.ImageSlideblock
                        {
                            Url = s.Url,
                            Title = s.Title,
                            Description = s.Description
                        }).ToList(),
                        Buttons = (m.Buttons).Select(b => new Models.Buttonblock
                        {
                            Title = b.Title,
                            Type = b.Type,
                            Url = b.Url,
                            TextMessage = b.TextMessage,
                            LinkedMediaId = b.LinkedMediaId
                        }).ToList()
                    };
                    _db.Medias.Add(media);
                }

                // 🔹 Finally save everything
                await _db.SaveChangesAsync();
                _logger.LogInformation("Story session saved successfully with backend-generated GUIDs.");
                return Ok(new { message = "Story saved successfully." });
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                _logger.LogError(ex, "Error saving story session to DB");
                return StatusCode(500, new { error = innerMessage });
            }
        }

        [HttpDelete("DeleteStory/{storyId}")]
        public async Task<IActionResult> DeleteStory(int storyId)
        {
            try
            {
                // 🔹 Fetch the story
                var story = await _db.Stories.FirstOrDefaultAsync(s => s.ID == storyId);
                if (story == null)
                {
                    return NotFound(new { message = "Story not found" });
                }

                // 🔹 Delete related entities manually (cascade-like)
                var phrases = _db.UserInputPhrases.Where(p => p.StoryId == storyId);
                var phraseIds = phrases.Select(p => p.ID).ToList();
                var phraseVars = _db.PhraseVariables.Where(v => phraseIds.Contains(v.UserInputPhraseId));
                _db.PhraseVariables.RemoveRange(phraseVars);
                _db.UserInputPhrases.RemoveRange(phrases);

                var keywords = _db.UserInputKeywords.Where(k => k.StoryId == storyId);
                var keywordIds = keywords.Select(k => k.ID).ToList();
                var keywordGroups = _db.KeywordGroups.Where(g => keywordIds.Contains(g.UserInputKeywordId));
                var keywordGroupIds = keywordGroups.Select(g => g.Id).ToList();
                var keywordsInsideGroup = _db.Keywords.Where(kw => keywordGroupIds.Contains(kw.KeywordGroupId));
                var plainKeywords = _db.PlainKeywords.Where(pk => keywordIds.Contains(pk.UserInputKeywordId));
                var keywordVars = _db.KeywordVariables.Where(v => keywordIds.Contains(v.UserInputKeywordId));

                _db.Keywords.RemoveRange(keywordsInsideGroup);
                _db.KeywordGroups.RemoveRange(keywordGroups);
                _db.PlainKeywords.RemoveRange(plainKeywords);
                _db.KeywordVariables.RemoveRange(keywordVars);
                _db.UserInputKeywords.RemoveRange(keywords);

                var anythings = _db.UserInputTypeAnythings.Where(a => a.StoryId == storyId);
                var anythingIds = anythings.Select(a => a.ID).ToList();
                var anythingVars = _db.AnythingVariables.Where(v => anythingIds.Contains(v.UserInputTypeAnything.ID));
                _db.AnythingVariables.RemoveRange(anythingVars);
                _db.UserInputTypeAnythings.RemoveRange(anythings);

                var connections = _db.Connection.Where(c => c.StoryId == storyId);
                _db.Connection.RemoveRange(connections);

                var typingDelays = _db.TypingDelay.Where(t => t.StoryId == storyId);
                _db.TypingDelay.RemoveRange(typingDelays);

                var forms = _db.ConversationalForm.Where(cf => cf.StoryId == storyId);
                var formIds = forms.Select(f => f.ID).ToList();
                var formFields = _db.FormFields.Where(f => formIds.Contains(f.ConversationalFormId));
                _db.FormFields.RemoveRange(formFields);
                _db.ConversationalForm.RemoveRange(forms);

                var textResponses = _db.TextResponse.Where(tr => tr.StoryId == storyId);
                var textResponseIds = textResponses.Select(tr => tr.ID).ToList();
                var quickReplies = _db.QuickReplies.Where(q => textResponseIds.Contains(q.textResponseId));
                _db.QuickReplies.RemoveRange(quickReplies);
                _db.TextResponse.RemoveRange(textResponses);

                var linkStories = _db.LinkStory.Where(ls => ls.StoryId == storyId);
                _db.LinkStory.RemoveRange(linkStories);

                var jsonApis = _db.JsonAPI.Where(api => api.StoryId == storyId);
                var jsonApiIds = jsonApis.Select(api => api.ID).ToList();
                var apiHeaders = _db.ApiHeaders.Where(h => jsonApiIds.Contains(h.jsonId));
                //_db.ApiHeaders.RemoveRange(apiHeaders);
                _db.JsonAPI.RemoveRange(jsonApis);

                var medias = _db.Medias.Where(m => m.StoryId == storyId);
                foreach (var media in medias)
                {
                    //_db.ImageSlideblocks.RemoveRange(media.Slides);
                    //_db.Buttonblocks.RemoveRange(media.Buttons);
                }
                _db.Medias.RemoveRange(medias);

                // 🔹 Finally, delete the Story itself
                _db.Stories.Remove(story);

                // 🔹 Save all changes
                await _db.SaveChangesAsync();

                _logger.LogInformation("Deleted story {StoryId} and all related data", storyId);
                return Ok(new { message = "Story deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting story {StoryId}", storyId);
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("UpdateStory")]
        public async Task<ActionResult> UpdateStory([FromBody] StorySessionData session)
        {
            try
            {
                if (session == null || session.Story == null)
                {
                    _logger.LogWarning("Invalid session data received");
                    return BadRequest("Invalid data");
                }

                // 1. Fetch existing story
                var story = await _db.Stories
                                     .FirstOrDefaultAsync(s => s.ID == session.Story.ID);

                if (story == null)
                    return NotFound($"Story with ID {session.Story.ID} not found");

                // 2. Update story fields
                story.Name = session.Story.Name;
                //story.Description = session.Story.Description; // if exists
                _db.Stories.Update(story);
                var storyId = story.ID;

                // 3. Update Phrases
                if (session.Phrases != null && session.Phrases.Any())
                {
                    foreach (var phrase in session.Phrases)
                        phrase.StoryId = storyId;

                    var existingPhrases = _db.UserInputPhrases.Where(p => p.StoryId == storyId);
                    _db.UserInputPhrases.RemoveRange(existingPhrases);
                    await _db.UserInputPhrases.AddRangeAsync(session.Phrases);
                }

                // 4. Update Keywords
                if (session.Keywords != null && session.Keywords.Any())
                {
                    foreach (var keyword in session.Keywords)
                        keyword.StoryId = storyId;

                    var existingKeywords = _db.UserInputKeywords.Where(k => k.StoryId == storyId);
                    _db.UserInputKeywords.RemoveRange(existingKeywords);
                    await _db.UserInputKeywords.AddRangeAsync(session.Keywords);
                }

                // 5. Update Anythings
                if (session.Anythings != null && session.Anythings.Any())
                {
                    foreach (var any in session.Anythings)
                        any.StoryId = storyId;

                    var existingAnythings = _db.UserInputTypeAnythings.Where(a => a.StoryId == storyId);
                    _db.UserInputTypeAnythings.RemoveRange(existingAnythings);
                    await _db.UserInputTypeAnythings.AddRangeAsync(session.Anythings);
                }

                // 6. Update Connections
                if (session.Connections != null && session.Connections.Any())
                {
                    foreach (var conn in session.Connections)
                        conn.StoryId = storyId;

                    var existingConnections = _db.Connection.Where(c => c.StoryId == storyId);
                    _db.Connection.RemoveRange(existingConnections);
                    await _db.Connection.AddRangeAsync(session.Connections);

                    // Update root connection
                    var firstConnection = session.Connections.FirstOrDefault();
                    if (firstConnection != null)
                    {
                        story.RootBlockConnectionId = firstConnection.ID;
                        _db.Stories.Update(story);
                    }
                }

                // 7. Update ConversationalForms
                if (session.ConversationalForms != null && session.ConversationalForms.Any())
                {
                    foreach (var form in session.ConversationalForms)
                        form.StoryId = storyId;

                    var existingForms = _db.ConversationalForm.Where(f => f.StoryId == storyId);
                    _db.ConversationalForm.RemoveRange(existingForms);
                    await _db.ConversationalForm.AddRangeAsync(session.ConversationalForms);
                }

                // 8. Update TypingDelays
                if (session.TypingDelays != null && session.TypingDelays.Any())
                {
                    foreach (var delay in session.TypingDelays)
                        delay.StoryId = storyId;

                    var existingDelays = _db.TypingDelay.Where(t => t.StoryId == storyId);
                    _db.TypingDelay.RemoveRange(existingDelays);
                    await _db.TypingDelay.AddRangeAsync(session.TypingDelays);
                }

                // 9. Update JsonAPIs
                if (session.JsonAPIs != null && session.JsonAPIs.Any())
                {
                    foreach (var api in session.JsonAPIs)
                        api.StoryId = storyId;

                    var existingApis = _db.JsonAPI.Where(j => j.StoryId == storyId);
                    _db.JsonAPI.RemoveRange(existingApis);
                    await _db.JsonAPI.AddRangeAsync(session.JsonAPIs);
                }

                // 10. Update TextResponses
                if (session.TextResponses != null && session.TextResponses.Any())
                {
                    foreach (var text in session.TextResponses)
                        text.StoryId = storyId;

                    var existingTexts = _db.TextResponse.Where(t => t.StoryId == storyId);
                    _db.TextResponse.RemoveRange(existingTexts);
                    await _db.TextResponse.AddRangeAsync(session.TextResponses);
                }

                // 11. Update LinkStories
                if (session.LinkStories != null && session.LinkStories.Any())
                {
                    foreach (var link in session.LinkStories)
                        link.StoryId = storyId;

                    var existingLinks = _db.LinkStory.Where(l => l.StoryId == storyId);
                    _db.LinkStory.RemoveRange(existingLinks);
                    await _db.LinkStory.AddRangeAsync(session.LinkStories);
                }

                // 12. Save all changes
                await _db.SaveChangesAsync();

                _logger.LogInformation("Story and all components updated successfully for StoryId: {StoryId}", storyId);
                return Ok(new { message = "Story updated successfully", storyId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating story session to DB");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("StorySaveToDB")]
        public async Task<IActionResult> StorySaveToDB([FromBody] StorySessionData session)
        {
            try
            {
                if (session == null)
                {
                    _logger.LogWarning("Invalid session data received");
                    return BadRequest("Invalid data");
                }

                // 1. Save Story first
                if (session.Story == null)
                {
                    return BadRequest("Story data is required");
                }

                await _db.Stories.AddAsync(session.Story);
                await _db.SaveChangesAsync(); // This will assign Story.Id
                var storyId = session.Story.ID;


                _logger.LogInformation("Story saved with Id: {StoryId}", storyId);

                // Save phrases
                if (session.Phrases != null && session.Phrases.Any())
                    _db.UserInputPhrases.AddRange(session.Phrases);

                // Save keywords
                if (session.Keywords != null && session.Keywords.Any())
                    _db.UserInputKeywords.AddRange(session.Keywords);

                // Save "type anything"
                if (session.Anythings != null && session.Anythings.Any())
                    _db.UserInputTypeAnythings.AddRange(session.Anythings);

                // Save connections
                if (session.Connections != null && session.Connections.Any())
                {
                    _db.Connection.AddRange(session.Connections);

                    var firstConnection = session.Connections.FirstOrDefault();
                    if (firstConnection != null)
                    {
                        var story = await _db.Stories
                                             .FirstOrDefaultAsync(s => s.ID == firstConnection.StoryId);

                        if (story != null)
                        {
                            story.RootBlockConnectionId = firstConnection.ID;
                            _db.Stories.Update(story);
                            _logger.LogInformation("Updated root connection for StoryId: {StoryId}", story.ID);
                        }
                        else
                        {
                            // Story does not exist → create it
                            var newStory = new Stories
                            {
                                ID = firstConnection.StoryId,
                                RootBlockConnectionId = firstConnection.ID
                            };

                            await _db.Stories.AddAsync(newStory);
                            _logger.LogInformation("Created new Story with StoryId: {StoryId}", newStory.ID);
                        }
                    }
                }

                // Save typing delays
                if (session.TypingDelays != null && session.TypingDelays.Any())
                    _db.TypingDelay.AddRange(session.TypingDelays);

                // Save conversational forms
                if (session.ConversationalForms != null && session.ConversationalForms.Any())
                    _db.ConversationalForm.AddRange(session.ConversationalForms);

                // Save JSON APIs
                if (session.JsonAPIs != null && session.JsonAPIs.Any())
                    _db.JsonAPI.AddRange(session.JsonAPIs);

                // Save text responses
                if (session.TextResponses != null && session.TextResponses.Any())
                    _db.TextResponse.AddRange(session.TextResponses);

                // Save linked stories
                if (session.LinkStories != null && session.LinkStories.Any())
                    _db.LinkStory.AddRange(session.LinkStories);

                // Finally save all
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
