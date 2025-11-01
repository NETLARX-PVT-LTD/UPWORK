// ---------------------------------------------------------------------
// <copyright file="BotRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.Bots.Bot
{
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Db;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Threading.Tasks;

    public class BotRepository : IBotRepository
    {
        private readonly BotDbContext _context;
        public BotRepository(BotDbContext context)
        {
            _context = context;
        }

        public async Task<(bool success, Bot? bot)> GetBotById(Guid botId, Errors errors)
        {
            try
            {
                var botcheck = await _context.Bots
                          .Include(t=>t.Theme)
                          .Include(l=>l.LandingConfig)
                          .FirstOrDefaultAsync(b => b.BotId == botId);

                if (botcheck == null)
                {
                    errors.Fill(FailureCode.NotFound, "Bot Not Found");
                    return (false, null);
                }

                return (true, botcheck);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Failed to get bot detail : {ex.Message}");
                return (false, null);
            }
        }

        public async Task<(bool success, Guid? botId)> CreateBot(Bot bot, Errors errors)
        {
            try
            {
                var botEntity = await _context.Bots.AddAsync(bot);
                await _context.SaveChangesAsync();
                return (true, bot.BotId);

            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occured on create bot : {ex.Message}");
                return (false, Guid.Empty);
            }
        }

        public async Task<bool> UpdateBot(Bot bot, Errors errors)
        {
            try
            {
                _context.Bots.Update(bot);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occured on update bot : {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DeleteBot(Bot bot, Errors errors)
        {
            try
            {
                if (bot.LandingConfig != null)
                {
                    _context.LandingConfigs.Remove(bot.LandingConfig);
                }

                if (bot.Theme != null)
                {
                    _context.Themes.Remove(bot.Theme);
                }

                _context.Bots.Remove(bot);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occurred on delete bot: {ex.Message}");
                return false;
            }
        }


        //Landing
        public async Task<(bool success, Bot? bot)> GetLandingPage(Guid botId, Errors errors)
        {
            try
            {
                var ladingPage = await _context.Bots
                                 .Include(b => b.Theme)
                                 .Include(b => b.LandingConfig)
                                 .FirstOrDefaultAsync(b => b.BotId == botId);

                if (ladingPage == null)
                {
                    errors.Fill(FailureCode.NotFound, "Landing Page Not Found");
                    return (false, null);
                }

                return (true, ladingPage);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occured on get landing page : {ex.Message} ");
                return (false, null);
            }
        }
    }
}