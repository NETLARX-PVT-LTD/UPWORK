// ---------------------------------------------------------------------
// <copyright file="AssistantsController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.AiAssistant
{
    using Chatbot;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Controllers.ConversationalForms;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class AssistantsController : ControllerBase
    {
        private readonly IBotDbContext _db;
        private readonly ILogger<AssistantsController> _logger;
        public AssistantsController(IBotDbContext db, ILogger<AssistantsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAssistant([FromBody] AiAssistantBlock request)
        {
            try
            {
                // ✅ Validate required fields
                if (string.IsNullOrWhiteSpace(request.AssistantName))
                    return BadRequest("Assistant Name is required.");
                if (string.IsNullOrWhiteSpace(request.ApiKey))
                    return BadRequest("API Key is required.");
                if (string.IsNullOrWhiteSpace(request.Plateform))
                    return BadRequest("Platform is required.");
                if (string.IsNullOrWhiteSpace(request.Model))
                    return BadRequest("Model is required.");
                if (request.MaxToken < 100 || request.MaxToken > 2000)
                    return BadRequest("MaxToken must be between 100 and 2000.");
                if (request.Temperature < 0 || request.Temperature > 0.7)
                    return BadRequest("Temperature must be between 0 and 0.7.");
                if (request.TopP < 0 || request.TopP > 0.4)
                    return BadRequest("TopP must be between 0 and 0.4.");

                // ✅ Convert block → model
                var assistant = new AiAssistant
                {
                    Id = string.IsNullOrWhiteSpace(request.Id) ? Guid.NewGuid() : Guid.Parse(request.Id),
                    AssistantName = request.AssistantName,
                    ApiKey = request.ApiKey,
                    Plateform = request.Plateform,
                    Instruction = request.Instruction,
                    Model = request.Model,
                    source = request.Source,
                    FallbackTextMessage = request.FallbackTextMessage,
                    FallbackStory = request.FallbackStory,
                    MaxToken = request.MaxToken,
                    Temperature = request.Temperature,
                    TopP = request.TopP,
                    CreatedAt = DateTime.UtcNow
                };

                // ✅ Convert TrainingFiles (if any)
                foreach (var tf in request.TrainingFiles)
                {
                    _db.TrainingFiles.Add(new TrainingFile
                    {
                        Id = string.IsNullOrWhiteSpace(tf.Id) ? Guid.NewGuid() : Guid.Parse(tf.Id),
                        FileName = tf.FileName,
                        FilePath = tf.FileUrl,        // mapping FileUrl → FilePath
                        AssistantId = assistant.Id
                    });
                }

                // ✅ Save to database
                _db.AiAssistants.Add(assistant);
                await _db.SaveChangesAsync();

                _logger.LogInformation($"AI Assistant '{assistant.AssistantName}' created successfully.");

                return Ok(new
                {
                    Message = "Assistant created successfully!",
                    AssistantId = assistant.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating AI Assistant.");
                return StatusCode(500, "Internal server error while creating assistant.");
            }
        }

        [HttpPut("{assistantId}")]
        public async Task<IActionResult> UpdateAssistant(Guid assistantId, [FromBody] AiAssistantBlock request)
        {
            try
            {
                // 🔎 Find the existing assistant
                var existingAssistant = await _db.AiAssistants
                                                 .Include(a => a.TrainingFiles)
                                                 .FirstOrDefaultAsync(a => a.Id == assistantId);

                if (existingAssistant == null)
                    return NotFound($"Assistant with Id '{assistantId}' not found.");

                // ✅ Validate required fields
                if (string.IsNullOrWhiteSpace(request.AssistantName))
                    return BadRequest("Assistant Name is required.");
                if (string.IsNullOrWhiteSpace(request.ApiKey))
                    return BadRequest("API Key is required.");
                if (string.IsNullOrWhiteSpace(request.Plateform))
                    return BadRequest("Platform is required.");
                if (string.IsNullOrWhiteSpace(request.Model))
                    return BadRequest("Model is required.");
                if (request.MaxToken < 100 || request.MaxToken > 2000)
                    return BadRequest("MaxToken must be between 100 and 2000.");
                if (request.Temperature < 0 || request.Temperature > 0.7)
                    return BadRequest("Temperature must be between 0 and 0.7.");
                if (request.TopP < 0 || request.TopP > 0.4)
                    return BadRequest("TopP must be between 0 and 0.4.");

                // ✅ Update assistant fields
                existingAssistant.AssistantName = request.AssistantName;
                existingAssistant.ApiKey = request.ApiKey;
                existingAssistant.Plateform = request.Plateform;
                existingAssistant.Model = request.Model;
                existingAssistant.Instruction = request.Instruction;
                existingAssistant.source = request.Source;
                existingAssistant.FallbackTextMessage = request.FallbackTextMessage;
                existingAssistant.FallbackStory = request.FallbackStory;
                existingAssistant.MaxToken = request.MaxToken;
                existingAssistant.Temperature = request.Temperature;
                existingAssistant.TopP = request.TopP;

                // ✅ Update TrainingFiles
                if (request.TrainingFiles != null && request.TrainingFiles.Count > 0)
                {
                    // Clear old training files (or handle smarter merge if needed)
                    _db.TrainingFiles.RemoveRange(existingAssistant.TrainingFiles);

                    foreach (var tf in request.TrainingFiles)
                    {
                        existingAssistant.TrainingFiles.Add(new TrainingFile
                        {
                            Id = string.IsNullOrWhiteSpace(tf.Id) ? Guid.NewGuid() : Guid.Parse(tf.Id),
                            FileName = tf.FileName,
                            FilePath = tf.FileUrl,        // Proto FileUrl → EF FilePath
                            AssistantId = existingAssistant.Id
                        });
                    }
                }

                await _db.SaveChangesAsync();

                _logger.LogInformation($"AI Assistant '{request.AssistantName}' updated successfully.");

                return Ok(new
                {
                    Message = "Assistant updated successfully!",
                    AssistantId = existingAssistant.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating AI Assistant.");
                return StatusCode(500, "Internal server error while updating assistant.");
            }
        }

        [HttpGet("{assistantId}")]
        public async Task<IActionResult> GetAssistant(Guid assistantId)
        {
            try
            {
                // Find assistant by Id
                var assistant = await _db.AiAssistants.FindAsync(assistantId);

                if (assistant == null)
                    return NotFound($"Assistant with Id '{assistantId}' not found.");

                // Return assistant details
                return Ok(assistant);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching AI Assistant with Id '{assistantId}'.");
                return StatusCode(500, "Internal server error while fetching assistant details.");
            }
        }

        [HttpPost("{assistantId}/files")]
        public async Task<IActionResult> UploadTrainingFiles(Guid assistantId, [FromForm] IFormFileCollection files)
        {
            try
            {
                var assistant = await _db.AiAssistants.FindAsync(assistantId);
                if (assistant == null)
                    return NotFound($"Assistant with Id '{assistantId}' not found.");

                if (files == null || files.Count == 0)
                    return BadRequest("No files uploaded.");

                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", assistantId.ToString());
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        var filePath = Path.Combine(uploadPath, file.FileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        // Save file metadata in DB linked to AssistantId
                        var trainingFile = new TrainingFile
                        {
                            FileName = file.FileName,
                            FilePath = filePath,
                            AssistantId = assistantId
                        };

                        _db.TrainingFiles.Add(trainingFile);
                    }
                }

                await _db.SaveChangesAsync();

                return Ok(new { Message = $"{files.Count} file(s) uploaded successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading training files.");
                return StatusCode(500, "Internal server error while uploading files.");
            }
        }

        [HttpPost("{assistantId}/websites")]
        public async Task<IActionResult> AddWebsiteSources(Guid assistantId, [FromBody] WebsiteDataBlock w)
        {
            try
            {
                var assistant = await _db.AiAssistants.FindAsync(assistantId);
                if (assistant == null)
                    return NotFound($"Assistant with Id '{assistantId}' not found.");

                if (w == null)
                    return BadRequest("No website provided.");

                // ✅ Convert proto → EF model
                var websiteEntity = new WebsiteData
                {
                    AssistantId = assistantId,
                    WebsiteType = w.WebsiteType,
                    Url = w.Url,
                    AutoSync = w.AutoSync,
                    MaxPages = w.MaxPages == 0 ? null : w.MaxPages,          // handle nullable int
                    MaxDepth = w.MaxDepth == 0 ? null : w.MaxDepth,
                    IncludeSubdomains = w.IncludeSubdomains,
                    ExcludePatterns = string.IsNullOrEmpty(w.ExcludePatterns) ? string.Empty : w.ExcludePatterns,
                    CssSelector = string.IsNullOrEmpty(w.CssSelector) ? string.Empty : w.CssSelector,
                    RespectRobots = w.RespectRobots,
                    CreatedAt = DateTime.UtcNow
                };

                _db.WebsiteSources.Add(websiteEntity);
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Website added successfully.",
                    WebsiteId = websiteEntity.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding website source.");
                return StatusCode(500, "Internal server error while adding website.");
            }
        }

    }
}
