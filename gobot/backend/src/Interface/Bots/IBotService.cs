
namespace Netlarx.Products.Gobot.Interface.Bots
{
    using Chatbot;
    using Gobot.ModelDTO.Bots;
    using Netlarx.Products.Gobot.Errors;
    using System;
    using System.Threading.Tasks;

    public interface IBotService
    {
        // Bot
        Task<BotResult> GetBotByIdAsync(Guid botId, Errors errors);
        Task<BotActionResult> CreateBotAsync(BotBlock block, Errors errors);
        Task<BotActionResult> UpdateBotAsync(Guid botId,BotBlock block, Errors errors);
        Task<BotActionResult> DeleteBotAsync(Guid botId, Errors errors);

        //Landing
        Task<LandingPageResult> GetLandingPageAsync(Guid botId, Errors errors);


    }
}
