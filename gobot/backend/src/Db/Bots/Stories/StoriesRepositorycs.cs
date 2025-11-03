// ---------------------------------------------------------------------
// <copyright file="StoriesRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Nelarx.Products.Gobot.Db.DbLayer.Bots.Stories
{
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Db;
    using Netlarx.Products.Gobot.Db.DbLayer.Bots.Stories;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.Data.Common;
    using System.Linq;
    using System.Threading.Tasks;

    public class StoriesRepository:IStoriesRepository
    {
        private readonly BotDbContext _context;
        public StoriesRepository(BotDbContext context)
          {
                _context = context;
          }

        public async Task<(bool success, List<Stories>? stories)> GetStoriesAsync(Guid botId, Errors errors)
        {
            try
            {
                 var storiesList = await _context.Stories.Where(s => s.BotId == botId).ToListAsync();
                 return(true, storiesList);
            }
            catch(DbException ex) 
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occured when fetch stories : {ex.Message}");
                return(false, null);
            }
        }

        public async Task<(bool success, Stories? story)> GetStoryAsync(Guid botId, int storyId, Errors errors)
        {
            try
            {
                var story = await _context.Stories
                                          .FirstOrDefaultAsync(s => s.BotId == botId && s.ID == storyId);

                if (story == null)
                {
                    errors.Fill(FailureCode.NotFound, $"Story with ID {storyId} for Bot {botId} not found.");
                    return (false, null);
                }

                return (true, story);
            }
            catch (DbException ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occurred while fetching story: {ex.Message}");
                return (false, null);
            }
        }
        public async Task<bool> AddStoryAsync(Stories story, Errors errors)
        {
            try
            {
                await _context.Stories.AddAsync(story);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbException ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Database update failed while adding story: {ex.Message}");
                return false;
            }
        }
        public async Task<bool> UpdateStoryAsync(Stories story, Errors errors)
        {
            try
            {
                _context.Stories.Update(story);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbException ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Concurrency conflict while updating story: {ex.Message}");
                return false;
            }
            
        }
        public async Task<bool> DeleteStoryAsync(Stories story, Errors errors)
        {
            try
            {
                _context.Stories.Remove(story);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Database update failed while deleting story: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.UnknownError, $"Unexpected error while deleting story: {ex.Message}");
                return false;
            }
        }
    }
}