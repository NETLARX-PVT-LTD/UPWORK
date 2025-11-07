// ---------------------------------------------------------------------
// <copyright file="BotConnectionRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.FacebookIntegration.BotConnection
{
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using System;
    using System.Threading.Tasks;

    public class BotConnectionRepository : IBotConnectionRepository
    {
        private readonly BotDbContext _context;

        public BotConnectionRepository(BotDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddBotConnection(BotConnection botConnection, Errors errors)
        {
            try
            {
                await _context.BotConnections.AddAsync(botConnection);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occurred while adding the bot connection. {ex.Message}");
                return false;
            }
        }

        public async Task<(bool success, BotConnection? botConnection)> GetBotConnectionByPageId(string pageId, Errors errors)
        {
            try
            {
                var connection = await _context.BotConnections.FirstOrDefaultAsync(b => b.PageId == pageId);
                if (connection == null)
                {
                    errors.Fill(FailureCode.NotFound, $"Bot connection for PageId '{pageId}' not found.");
                    return (false, null);
                }

                return (true, connection);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"An error occurred while retrieving the bot connection. {ex.Message}");
                return (false, null);
            }
        }

        public async Task<bool> UpdateBotConnection(BotConnection botConnection, Errors errors)
        {
            try
            {
                _context.BotConnections.Update(botConnection);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occurred while updating the bot connection. {ex.Message}");
                return false;
            }
        }
    }
}