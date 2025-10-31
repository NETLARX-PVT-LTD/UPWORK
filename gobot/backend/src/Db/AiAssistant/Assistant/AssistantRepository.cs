// ---------------------------------------------------------------------
// <copyright file="AssistantRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.DbLayer.AiAssistant.Assistant
{
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public class AssistantRepository : IAssistantRepository
    {
        private readonly BotDbContext _context;

        public AssistantRepository(BotDbContext context)
        {
            _context = context;
        }

        public async Task<(bool success, Guid assistantId)> CreateAssistant(AiAssistant assistantEntity, Errors errors)
        {
            try
            {
                await _context.AiAssistants.AddAsync(assistantEntity);
                await _context.SaveChangesAsync();
                return (true, assistantEntity.Id);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"An error occurred while creating the assistant. {ex.Message}");
                return (false, Guid.Empty);
            }
        }

        public async Task<(bool success, AiAssistant? assistant)> GetAiAssistantById(Guid assistantId, Errors errors)
        {
            try
            {
                var Assistant = await _context.AiAssistants
                               .Include(a => a.TrainingFiles)
                               .FirstOrDefaultAsync(a => a.Id == assistantId);
                if (Assistant == null)
                {
                    errors.Fill(FailureCode.NotFound, "Ai Assistant Not Found");
                    return (false, null);
                }

                return (true, Assistant);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"An error occurred while updating the assistant. {ex.Message}");
                return (false, null);
            }
        }

        public async Task<bool> UpdateAssistant(AiAssistant entity, Errors errors)
        {
            try
            {
                var existing = await _context.AiAssistants
                    .Include(a => a.TrainingFiles)
                    .FirstOrDefaultAsync(a => a.Id == entity.Id);

                if (existing == null)
                {
                    errors.Fill(FailureCode.NotFound, "Assistant not found");
                    return false;
                }

                if (existing.TrainingFiles != null && existing.TrainingFiles.Count != 0)
                {
                    _context.TrainingFiles.RemoveRange(existing.TrainingFiles);
                }

                if (entity.TrainingFiles != null && entity.TrainingFiles.Count != 0)
                {
                    foreach (var file in entity.TrainingFiles)
                    {
                        _context.TrainingFiles.Add(file);
                    }
                }

                _context.Entry(existing).CurrentValues.SetValues(entity);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error updating assistant: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> AddTrainingFiles(Guid assistantId, List<TrainingFile> files, Errors errors)
        {
            try
            {
                foreach (var file in files)
                {
                    file.AssistantId = assistantId;
                    await _context.TrainingFiles.AddAsync(file);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error saving training files: {ex.Message}");
                return false;
            }
        }

        public async Task<(bool success, int websiteId)> AddWebsiteSource(WebsiteData entity, Errors errors)
        {
            try
            {
                await _context.WebsiteSources.AddAsync(entity);
                await _context.SaveChangesAsync();
                return (true, entity.Id);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Database error adding website: {ex.Message}");
                return (true, -1);
            }
        }
    }
}