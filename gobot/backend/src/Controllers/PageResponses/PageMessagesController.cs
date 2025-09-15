// ---------------------------------------------------------------------
// <copyright file="PageMessagesController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.PageResponses
{
    using Chatbot;
    using global::Gobot.Controllers.Email;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Pipelines;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    [Route("api/page-messages")]
    [ApiController]
    public class PageMessagesController : ControllerBase
    {
        private readonly IBotDbContext _db;
        private readonly ILogger<PageMessagesController> _logger;
        public PageMessagesController(IBotDbContext db, ILogger<PageMessagesController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ✅ POST: Create Page Message
        [HttpPost("{botId}")]
        [MiddlewareFilter(typeof(ProtoPipeline))]
        public async Task<ActionResult<PageMessage>> CreatePageMessage(string botId)
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not PageMessageBlock request)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (request == null)
                return BadRequest(new { message = "Invalid request payload." });

            var newMessage = new PageMessage
            {
                Id = Guid.NewGuid().ToString("N"), // database-generated ID
                BotId = botId,
                Urls = request.Urls.ToList() ?? new List<string>(),
                ShowAfterDelay = request.ShowAfterDelay,
                Delay = request.Delay,
                MessageType = request.MessageType,
                TextMessage = request.TextMessage,
                // ✅ Explicit conversion
                SelectedStory = request.SelectedStory == null
                    ? null
                    : new StoryReference
                    {
                        Id = request.SelectedStory.Id,
                        Name = request.SelectedStory.Name
                    }
                
            };

            await _db.PageMessages.AddAsync(newMessage);

            return Ok(newMessage);
        }

        // ✅ GET: Fetch all Page Messages for a bot
        [HttpGet("{botId}")]
        public async Task<ActionResult<IEnumerable<PageMessage>>> GetPageMessages(string botId)
        {
            // Fetch all messages for this botId (assuming botId is stored in DB)
            var messages = _db.PageMessages
                .Where(m => m.BotId == botId) // 🔑 requires BotId in PageMessage model
                .ToList();

            if (!messages.Any())
                return NotFound(new { message = $"No page messages found for BotId {botId}" });

            return Ok(messages);
        }

        [HttpPut("{id}")]
        [MiddlewareFilter(typeof(ProtoPipeline))]
        public async Task<ActionResult<PageMessage>> UpdatePageMessage(string id)
        {
            // Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not PageMessageBlock request)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            // Find the existing message
            var existingMessage = await _db.PageMessages.FindAsync(id);
            if (existingMessage == null)
            {
                return NotFound(new { message = $"PageMessage with ID '{id}' not found." });
            }

            // Update fields
            existingMessage.BotId = request.BotId;
            existingMessage.Urls = request.Urls.ToList() ?? new List<string>();
            existingMessage.ShowAfterDelay = request.ShowAfterDelay;
            existingMessage.Delay = request.Delay;
            existingMessage.MessageType = request.MessageType;
            existingMessage.TextMessage = request.TextMessage;

            existingMessage.SelectedStory = request.SelectedStory == null
                ? null
                : new StoryReference
                {
                    Id = request.SelectedStory.Id,
                    Name = request.SelectedStory.Name
                };

            // Save changes
            await _db.SaveChangesAsync();

            return Ok(existingMessage); // ✅ Return updated object
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePageMessage(string id)
        {
            // Find the existing message
            var existingMessage = await _db.PageMessages.FindAsync(id);

            if (existingMessage == null)
            {
                return NotFound(new { message = $"PageMessage with ID '{id}' not found." });
            }

            // Remove it from DB
            _db.PageMessages.Remove(existingMessage);
            await _db.SaveChangesAsync();

            // Return success with no content
            return NoContent();
        }
    }
}
