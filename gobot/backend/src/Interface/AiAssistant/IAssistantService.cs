
namespace Netlarx.Products.Gobot.Interface.Assistant
{
    using Chatbot;
    using Microsoft.AspNetCore.Http;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.AIAssistant;
    using System;
    using System.Threading.Tasks;

    public interface IAssistantService
    {
        Task<AssistantActionResult> CreateAssistantAsync(AiAssistantBlock request, Errors errors);
        Task<AssistantActionResult> UpdateAssistantAsync(Guid assistantId, AiAssistantBlock request, Errors errors);
        Task<AssistantResult> GetAiAssistantByIdAsync(Guid assistantId, Errors errors);
        Task<AssistantActionResult> UploadTrainingFilesAsync(Guid assistantId, IFormFileCollection files, Errors errors);
        Task<AssistantWebSiteResult> AddWebsiteSourcesAsync(Guid assistantId, WebsiteDataBlock webSiteData, Errors errors);
    }
}
