
namespace Netlarx.Products.Gobot.ModelDTO.AIAssistant
{
    using Chatbot;
    using Gobot.Errors;
    using Gobot.Result;
    using Netlarx.Products.Gobot.Models;

    public class AssistantResult : Result
    {
        public AssistantResult(bool success, string statusCode, AiAssistantBlock? assistant, Errors? error = null)
            : base(success, error, statusCode)
        {
            Assistant = assistant;
        }
        public AiAssistantBlock? Assistant { get; set; }
    }
}
