
namespace Netlarx.Products.Gobot.Models.TelegramIntegration
{
    using System;

    public class Telegram
    {
    }

    public class TelegramConfig
    {
        public Guid Id { get; set; } // Primary key
        public string AccessToken { get; set; }
        public string BotName { get; set; }
        public string TelegramNumber { get; set; }
        public string ChatbotUrl { get; set; }
    }

}
