
namespace Netlarx.Products.Gobot.Db.DbLayer.AiAssistant.Assistant
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IAssistantRepository
    {
        Task<(bool success, Guid assistantId)> CreateAssistant(AiAssistant assistantEntity, Errors errors);

        Task<(bool success, AiAssistant? assistant)> GetAiAssistantById(Guid assistantId, Errors errors);

        Task<bool> UpdateAssistant(AiAssistant assistantEntity, Errors errors);

        Task<bool> AddTrainingFiles(Guid assistantId, List<TrainingFile> files, Errors errors);

        Task<(bool success, Guid websiteId)> AddWebsiteSourceAsync(WebsiteData entity, Errors errors);
    }
}
