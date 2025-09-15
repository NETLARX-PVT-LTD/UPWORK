// ---------------------------------------------------------------------
// <copyright file="BotPublishController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Whatsapp_Integration
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Threading.Tasks;
    using Chatbot;

    [Route("api/whatsapp")]
    [ApiController]
    public class BotPublishController : ControllerBase
    {
        private readonly ILogger<BotPublishController> _logger;
        private readonly IBotDbContext _db;

        public BotPublishController(ILogger<BotPublishController> logger, IBotDbContext db)
        {
            _logger = logger;
            _db = db;
        }

        [HttpPost("publish")]
        public async Task<IActionResult> PublishBot()
        {
            // Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not BotPublishRequestBlock request)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (request == null || string.IsNullOrEmpty(request.BotId))
            {
                return BadRequest(new { success = false, message = "Invalid bot data." });
            }

            try
            {
                // Map Protobuf DTO -> EF Core Model
                var entity = new BotPublishRequest
                {
                    BotPublishRequestId = Guid.NewGuid(), // new ID
                    BotId = request.BotId,
                    BotName = request.BotName,
                    ApiType = request.ApiType,
                    PhoneNumber = request.PhoneNumber,
                    WebhookUrl = request.WebhookUrl,
                    VerifyToken = request.VerifyToken,
                    AccessToken = request.AccessToken,
                    PhoneNumberId = request.PhoneNumberId,
                    BusinessAccountId = request.BusinessAccountId,
                    storyId = request.StoryId,
                    PublishedAt = DateTime.UtcNow,
                    isActive = true
                };

                // Save into DB
                _db.BotPublishRequests.Add(entity);
                await _db.SaveChangesAsync();

                // Build Response
                var response = new BotPublishResponse
                {
                    Success = true,
                    Message = "Bot published successfully!",
                    BotId = entity.BotId,
                    PublishedAt = entity.PublishedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing bot with ID {BotId}", request.BotId);
                return StatusCode(500, new { success = false, message = "Internal server error while publishing bot." });
            }
        }

        [HttpPost("unpublish/{botId}")]
        public async Task<IActionResult> UnpublishBot(string botId)
        {
            if (string.IsNullOrEmpty(botId))
            {
                return BadRequest(new { success = false, message = "Bot ID is required." });
            }

            try
            {
                var bot = await _db.BotPublishRequests.FirstOrDefaultAsync(b => b.BotId == botId);

                if (bot == null)
                {
                    return NotFound(new { success = false, message = $"Bot with ID {botId} not found." });
                }

                if (!bot.isActive)
                {
                    return Ok(new { success = true, message = "Bot is already unpublished." });
                }

                bot.isActive = false;
                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Bot unpublished successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unpublishing bot with ID {BotId}", botId);
                return StatusCode(500, new { success = false, message = "Internal server error while unpublishing bot." });
            }
        }

        [HttpGet("status/{botId}")]
        public async Task<IActionResult> GetBotStatus(string botId)
        {
            if (string.IsNullOrEmpty(botId))
            {
                return BadRequest(new { success = false, message = "Bot ID is required." });
            }

            try
            {
                var bot = await _db.BotPublishRequests.FirstOrDefaultAsync(b => b.BotId == botId);

                if (bot == null)
                {
                    return NotFound(new { success = false, message = $"Bot with ID {botId} not found." });
                }

                var status = bot.isActive ? "active" : "inactive";

                var response = new
                {
                    botId = bot.BotId,
                    status = status,
                    lastPinged = bot.PublishedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching status for bot with ID {BotId}", botId);
                return StatusCode(500, new { success = false, message = "Internal server error while retrieving bot status." });
            }
        }
    }
}
