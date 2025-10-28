
namespace Netlarx.Products.Gobot.Interface.Ai
{
    using Gobot.Errors;
    using Gobot.ModelDTO.AiAssistant;
    using System.Threading.Tasks;

    public interface IAiService
    {
        Task<AiGenerateReponseResult> GenerateTextAsync(GenerateRequest prompt,Errors errors);
    }
}
