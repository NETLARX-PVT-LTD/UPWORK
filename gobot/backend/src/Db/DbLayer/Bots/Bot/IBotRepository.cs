
namespace Netlarx.Products.Gobot.Db.DbLayer.Bots.Bot
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Threading.Tasks;

    public interface IBotRepository
    {
        //Bot
        Task<(bool success, Bot? bot)> GetBotById(Guid botId, Errors errors);
        Task<(bool success, Guid? botId)> CreateBot(Bot bot, Errors errors);
        Task<bool> UpdateBot(Bot bot, Errors errors);
        Task<bool> DeleteBot(Bot bot, Errors errors);

        //Landing
        Task<(bool success, Bot? bot)> GetLandingPage(Guid botId, Errors errors);

        

        
    }
}
