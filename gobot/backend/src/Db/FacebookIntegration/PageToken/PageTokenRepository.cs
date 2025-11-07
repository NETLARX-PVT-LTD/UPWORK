// ---------------------------------------------------------------------
// <copyright file="PageTokenRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.FacebookIntegration.PageToken
{
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public class PageTokenRepository: IPageTokenRepository
    {
        private readonly BotDbContext _context;

        public PageTokenRepository(BotDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddPageToken(PageToken pageToken, Errors errors)
        {
            try
            {
                await _context.PageTokens.AddAsync(pageToken);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occurred while adding the page token. {ex.Message}");
                return false;
            }
        }

        public async Task<(bool success, PageToken? pageToken)> GetPageTokenByPageId(string pageId, Errors errors)
        {
            try
            {
                var pageToken = await _context.PageTokens.FirstOrDefaultAsync(p => p.PageId == pageId);
                if (pageToken == null)
                {
                    errors.Fill(FailureCode.NotFound, $"Page token with PageId '{pageId}' not found.");
                    return (false, null);
                }

                return (true, pageToken);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"An error occurred while retrieving the page token. {ex.Message}");
                return (false, null);
            }
        }

        public async Task<(bool success, List<PageToken> pageTokens)> GetAllPageTokens(Errors errors)
        {
            try
            {
                var tokens = await _context.PageTokens.ToListAsync();
                return (true, tokens);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"An error occurred while fetching all page tokens. {ex.Message}");
                return (false, new List<PageToken>());
            }
        }
    }
}
