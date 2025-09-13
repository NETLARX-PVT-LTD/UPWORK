// ---------------------------------------------------------------------
// <copyright file="MenuController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.Menus
{
    using Chatbot;
    using global::Gobot.Controllers.Email;
    using Gobot.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Pipelines;
    using System;
    using System.Collections.Generic;
    using System.Text.Json;
    using System.Threading.Tasks;

    [Route("api/bots/{botId}/menu")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly IBotDbContext _db;
        private readonly ILogger<MenuController> _logger;

        public MenuController(IBotDbContext db, ILogger<MenuController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ✅ GET /api/bots/{botId}/menu
        [HttpGet]
        public async Task<IActionResult> GetMenu(string botId)
        {
            var botMenu = await _db.BotMenus.FirstOrDefaultAsync(m => m.BotId == botId);
            if (botMenu == null)
                return NotFound(new { message = $"No menu found for bot {botId}" });

            var menu = JsonSerializer.Deserialize<List<MenuButton>>(botMenu.MenuJson);

            return Ok(menu);
        }

        // ✅ PUT /api/bots/{botId}/menu
        [HttpPut]
        [MiddlewareFilter(typeof(ProtoPipeline))]
        public async Task<IActionResult> SaveMenu(string botId)
        {
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not List<MenuButtonBlock> menu)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            var botMenu = await _db.BotMenus.FirstOrDefaultAsync(m => m.BotId == botId);

            string menuJson = JsonSerializer.Serialize(menu);

            if (botMenu == null)
            {
                botMenu = new BotMenu
                {
                    BotId = botId,
                    MenuJson = menuJson
                };
                _db.BotMenus.Add(botMenu);
            }
            else
            {
                botMenu.MenuJson = menuJson;
                botMenu.UpdatedAt = DateTime.UtcNow;
                _db.BotMenus.Update(botMenu);
            }

            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Menu saved successfully." });
        }
    }
}
