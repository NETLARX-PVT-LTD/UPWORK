// ---------------------------------------------------------------------
// <copyright file="ChatController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.ChatConversations
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Model;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ILogger<ChatController> _logger;
        private readonly IBotDbContext _db;

        public ChatController(ILogger<ChatController> logger, IBotDbContext _db)
        {
            _logger = logger;
            _db = _db;
        }

        /// <summary>
        /// Handles user messages and returns chatbot responses
        /// </summary>
        [HttpPost("message")]
        public async Task<ActionResult<ChatResponse>> SendMessage([FromBody] ChatRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message) || string.IsNullOrWhiteSpace(request.BotId))
            {
                return BadRequest(new { message = "Invalid request payload." });
            }

            //   need to add more logic
            
            var response = new ChatResponse
            {
                Response = $"Echo from bot {request.BotId}: {request.Message}",
                Actions = new List<string> { "showMenu", "highlightButton" } // optional actions
            };

            _logger.LogInformation($"Bot {request.BotId}, Session {request.SessionId}: User said '{request.Message}' → Bot replied '{response.Response}'");

            return Ok(response);
        }
    }
}
