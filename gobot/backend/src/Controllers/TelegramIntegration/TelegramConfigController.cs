// ---------------------------------------------------------------------
// <copyright file="TelegramConfigController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.TelegramIntegration
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models.TelegramIntegration;
    using System;
    using System.Linq;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/telegram/config")]
    public class TelegramConfigController : ControllerBase
    {
        private readonly IBotDbContext _context;

        public TelegramConfigController(IBotDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get saved Telegram bot configuration
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetConfigs()
        {
            var configs = await _context.TelegramConfigs.ToListAsync();

            if (configs == null || !configs.Any())
                return NotFound(new { message = "No configurations found." });

            return Ok(configs.Select(config => new
            {
                accessToken = config.AccessToken,
                botName = config.BotName,
                telegramNumber = config.TelegramNumber,
                chatbotUrl = config.ChatbotUrl
            }));
        }

        /// <summary>
        /// Save or update Telegram bot configuration
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SaveConfig([FromBody] TelegramConfig request)
        {
            if (string.IsNullOrEmpty(request.AccessToken))
                return BadRequest(new { message = "Access token is required." });

            //var existingConfig = await _context.TelegramConfigs.FirstOrDefaultAsync();

            //if (existingConfig != null)
            //{
            //    // Update existing config
            //    existingConfig.AccessToken = request.AccessToken;
            //    existingConfig.BotName = request.BotName;
            //    existingConfig.TelegramNumber = request.TelegramNumber;
            //    existingConfig.ChatbotUrl = request.ChatbotUrl;
            //    _context.TelegramConfigs.Update(existingConfig);
            //}
            //else
            //{
                // Insert new config
                _context.TelegramConfigs.Add(request);
            //}

            await _context.SaveChangesAsync();

            return Ok(new { message = "Configuration saved successfully." });
        }

        /// <summary>
        /// Delete Telegram bot configuration by Id
        /// </summary>
        [HttpDelete]
        public async Task<IActionResult> DeleteConfig(Guid id)
        {
            var config = await _context.TelegramConfigs
                .FirstOrDefaultAsync(c => c.Id == id);

            if (config == null)
                return NotFound(new { message = $"No configuration found with id {id}." });

            _context.TelegramConfigs.Remove(config);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Configuration deleted successfully." });
        }
    }
}
