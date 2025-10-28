
namespace Netlarx.Products.Gobot.Services.AiAssistant
{
    using Chatbot;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Db.DbLayer.AiAssistant.Assistant;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Interface.Assistant;
    using Netlarx.Products.Gobot.ModelDTO.AIAssistant;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Validation;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;

    public class AssistantService:IAssistantService
    {
        private readonly IAssistantRepository _repository;
        private readonly ILogger<AssistantService> _logger;

        public AssistantService(IAssistantRepository repository, ILogger<AssistantService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public string GetStatusCode(Errors errors)
        {
            var statusCode = "500";

            switch (errors.FaultCode)
            {
                case FailureCode.DatabaseError:
                    statusCode = "500";
                    break;
                case FailureCode.NotFound:
                    statusCode = "404";
                    break;
                default:
                    statusCode = "500";
                    break;
            }
            return statusCode;
        }

        public async Task<AssistantActionResult> CreateAssistantAsync(AiAssistantBlock request, Errors errors)
        {
            var validationError = AiAssistantValidation.AssistantValidate(request);
            if (validationError != null)
            {
                return new AssistantActionResult(false, "400", Guid.Empty, validationError);
            }

            var assistantEntity = new AiAssistant
            {
                Id = Guid.NewGuid(),
                AssistantName = request.AssistantName,
                ApiKey = request.ApiKey,
                Platform = request.Platform,
                Model = request.Model,
                Instruction = request.Instruction,
                source = request.Source,
                FallbackTextMessage = request.FallbackTextMessage,
                FallbackStory = request.FallbackStory,
                MaxToken = request.MaxToken,
                Temperature = request.Temperature,
                TopP = request.TopP,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                var (success, assistantId) = await _repository.CreateAssistant(assistantEntity, errors);

                if (!success)
                {
                    errors.Fill(FailureCode.DatabaseError, $"Failed to create assistant {assistantEntity.AssistantName}");
                    return new AssistantActionResult(false, "400", Guid.Empty, errors);
                }

                return new AssistantActionResult(true, "200", assistantId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while creating assistant {AssistantName}", request.AssistantName);
                errors.Fill(FailureCode.InternalServerError, $"Error creating assistant: {ex.Message}");
                return new AssistantActionResult(false, "500", Guid.Empty, errors);
            }
        }

        public async Task<AssistantActionResult> UpdateAssistantAsync(Guid assistantId, AiAssistantBlock request, Errors errors)
        {
            var validationError = AiAssistantValidation.AssistantValidate(request);
            if (validationError != null)
            {
                return new AssistantActionResult(false, "400", assistantId, errors);
            }

            var (success, assistant) = await _repository.GetAiAssistantById(assistantId, errors);
            if (!success || assistant == null)
            {
                return new AssistantActionResult(false, GetStatusCode(errors), assistantId, errors);
            }

            assistant.AssistantName = request.AssistantName;
            assistant.ApiKey = request.ApiKey;
            assistant.Platform = request.Platform;
            assistant.Model = request.Model;
            assistant.Instruction = request.Instruction;
            assistant.source = request.Source;
            assistant.FallbackTextMessage = request.FallbackTextMessage;
            assistant.FallbackStory = request.FallbackStory;
            assistant.MaxToken = request.MaxToken;
            assistant.Temperature = request.Temperature;
            assistant.TopP = request.TopP;

            if (request.TrainingFiles != null && request.TrainingFiles.Any())
            {
                assistant.TrainingFiles.Clear();
                assistant.TrainingFiles = request.TrainingFiles.Select(tf => new TrainingFile
                {
                    Id = Guid.NewGuid(),
                    FileName = tf.FileName,
                    FilePath = tf.FileUrl,
                    AssistantId = assistant.Id
                }).ToList();
            }

            var updated = await _repository.UpdateAssistant(assistant, errors);
            if (!updated)
            {
                return new AssistantActionResult(false, "500", assistantId, errors);
            }

            return new AssistantActionResult(true, "200", assistantId);
        }

        public async Task<AssistantResult> GetAiAssistantByIdAsync(Guid assistantId, Errors errors)
        {
            try
            {
                if (assistantId == Guid.Empty)
                {
                    errors.Fill(FailureCode.BadRequest, "Invalid assistant ID.");
                    return new AssistantResult(false, "400", null, errors);
                }

                var (success, assistant) = await _repository.GetAiAssistantById(assistantId, errors);

                if (!success || assistant == null)
                {
                    return new AssistantResult(false, GetStatusCode(errors), null, errors);
                }

                var protoDto = new AiAssistantBlock
                {
                    Id = assistant.Id.ToString(),
                    AssistantName = assistant.AssistantName,
                    ApiKey = assistant.ApiKey,
                    Platform = assistant.Platform,
                    Model = assistant.Model,
                    Instruction = assistant.Instruction,
                    Source = assistant.source,
                    FallbackTextMessage = assistant.FallbackTextMessage,
                    FallbackStory = assistant.FallbackStory,
                    MaxToken = assistant.MaxToken,
                    Temperature = assistant.Temperature,
                    TopP = assistant.TopP,
                    CreatedAt = assistant.CreatedAt.ToString(),
                };

                if (assistant.TrainingFiles != null)
                {
                    protoDto.TrainingFiles.AddRange(
                        assistant.TrainingFiles.Select(tf => new TrainingFileBlock
                        {
                            Id = tf.Id.ToString(),
                            FileName = tf.FileName,
                            FileUrl = tf.FilePath,
                            AssistantId = tf.AssistantId.ToString()
                        })
                    );
                }

                return new AssistantResult(true, "200", protoDto);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.InternalServerError, $"Unexpected error while fetching assistant: {ex.Message}");
                return new AssistantResult(false, "500", null, errors);
            }
        }

        public async Task<AssistantActionResult> UploadTrainingFilesAsync(Guid assistantId, IFormFileCollection files, Errors errors)
        {
            if (assistantId == Guid.Empty)
            {
                errors.Fill(FailureCode.BadRequest, "Invalid assistant ID.");
                return new AssistantActionResult(false, "400", assistantId, errors);
            }

            var (success, assistant) = await _repository.GetAiAssistantById(assistantId, errors);

            if (!success || assistant == null)
            {
                return new AssistantActionResult(false, GetStatusCode(errors), assistantId, errors);
            }

            if (files == null || files.Count == 0)
            {
                errors.Fill(FailureCode.BadRequest, "No files uploaded.");
                return new AssistantActionResult(false, "400", assistantId, errors);
            }

            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", assistantId.ToString());
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            var trainingFiles = new List<TrainingFile>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var filePath = Path.Combine(uploadPath, file.FileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    trainingFiles.Add(new TrainingFile
                    {
                        FileName = file.FileName,
                        FilePath = filePath
                    });
                }
            }

            var saved = await _repository.AddTrainingFiles(assistantId, trainingFiles, errors);
            if (!saved)
            {
                return new  AssistantActionResult(false, "500", assistantId, errors);
            }

            return new AssistantActionResult(true, "200", assistantId);
        }

        public async Task<AssistantWebSiteResult> AddWebsiteSourcesAsync(Guid assistantId, WebsiteDataBlock dto, Errors errors)
        {
            try
            {
                var validationError = AiAssistantValidation.WebSiteBlockValidate(dto);
                if (validationError != null)
                {
                    return new AssistantWebSiteResult(false, "400", Guid.Empty  , validationError);
                }

                var (found, assistant) = await _repository.GetAiAssistantById(assistantId, errors);
                if (!found || assistant == null)
                {
                    return new AssistantWebSiteResult(false, GetStatusCode(errors), Guid.Empty, errors);
                }

                var websiteEntity = new WebsiteData
                {
                    AssistantId = assistantId,
                    WebsiteType = dto.WebsiteType,
                    Url = dto.Url.Trim(),
                    AutoSync = dto.AutoSync,
                    MaxPages = dto.MaxPages == 0 ? null : dto.MaxPages,
                    MaxDepth = dto.MaxDepth == 0 ? null : dto.MaxDepth,
                    IncludeSubdomains = dto.IncludeSubdomains,
                    ExcludePatterns = dto.ExcludePatterns ?? string.Empty,
                    CssSelector = dto.CssSelector ?? string.Empty,
                    RespectRobots = dto.RespectRobots,
                    CreatedAt = DateTime.UtcNow
                };

                var (success, websiteId) = await _repository.AddWebsiteSourceAsync(websiteEntity, errors);
                if (!success || websiteId == Guid.Empty)
                {
                    errors.Fill(FailureCode.DatabaseError, "Failed to save website source.");
                    return new AssistantWebSiteResult(false, "500", Guid.Empty, errors);
                }

                return new AssistantWebSiteResult(true, "200", websiteId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding website source for Assistant ID '{AssistantId}'.", assistantId);
                errors.Fill(FailureCode.InternalServerError, ex.Message);
                return new AssistantWebSiteResult(false, "500", Guid.Empty, errors);
            }
        }
    }
}
