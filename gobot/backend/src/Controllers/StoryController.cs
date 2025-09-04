// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Netlarx.Products.Gobot.Services;

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

        [HttpPost("SaveStoryToDb")]
        public async Task<ActionResult> SaveStoryToDb([FromBody] StorySessionData session)
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

                //await _db.Stories.AddAsync(session.Story);
                //await _db.SaveChangesAsync(); // This will assign Story.Id
                var storyId = session.Story.ID;


                _logger.LogInformation("Story saved with Id: {StoryId}", storyId);

                // Save phrases
                if (session.Phrases != null && session.Phrases.Any())
                {
                    foreach (var phrase in session.Phrases)
                        phrase.StoryId = storyId;

                    _db.UserInputPhrases.AddRange(session.Phrases);
                }

                // Save keywords
                if (session.Keywords != null && session.Keywords.Any())
                {
                    foreach (var keyword in session.Keywords)
                        keyword.StoryId = storyId;

                    _db.UserInputKeywords.AddRange(session.Keywords);
                }

                // Save "type anything"
                if (session.Anythings != null && session.Anythings.Any())
                {
                    foreach (var anything in session.Anythings)
                        anything.StoryId = storyId;

                    _db.UserInputTypeAnythings.AddRange(session.Anythings);
                }

                // Save connections
                if (session.Connections != null && session.Connections.Any())
                {
                    foreach (var conn in session.Connections)
                        conn.StoryId = storyId;

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
                                Name = session.Story.Name,
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
                {
                    foreach (var delay in session.TypingDelays)
                        delay.StoryId = storyId;

                    _db.TypingDelay.AddRange(session.TypingDelays);
                }

                // 7. Save conversational forms
                if (session.ConversationalForms != null && session.ConversationalForms.Any())
                {
                    foreach (var form in session.ConversationalForms)
                        form.StoryId = storyId;

                    _db.ConversationalForm.AddRange(session.ConversationalForms);
                }

                // 8. Save JSON APIs
                if (session.JsonAPIs != null && session.JsonAPIs.Any())
                {
                    foreach (var api in session.JsonAPIs)
                        api.StoryId = storyId;

                    _db.JsonAPI.AddRange(session.JsonAPIs);
                }

                // 9. Save text responses
                if (session.TextResponses != null && session.TextResponses.Any())
                {
                    foreach (var response in session.TextResponses)
                        response.StoryId = storyId;

                    _db.TextResponse.AddRange(session.TextResponses);
                }

                // 10. Save linked stories
                if (session.LinkStories != null && session.LinkStories.Any())
                {
                    foreach (var link in session.LinkStories)
                        link.StoryId = storyId;

                    _db.LinkStory.AddRange(session.LinkStories);
                }

                //Finally save all
                await _db.SaveChangesAsync();
                _logger.LogInformation("Session saved to DB successfully");

                return Ok(new { message = "Story saved to DB" });
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                _logger.LogError(ex, "Error occurred while saving story session to DB");
                return StatusCode(500, new { error = innerMessage });
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
