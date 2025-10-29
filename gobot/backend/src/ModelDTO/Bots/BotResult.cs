
namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    using Chatbot;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;
    using System;

    public class BotResult:Result
    {
        public BotResult(bool success, string statusCode, BotBlock? bot, Errors? error = null)
            : base(success, error, statusCode)
        {
            Bot = bot;
        }
        public BotBlock? Bot { get; set; }
    }
}
