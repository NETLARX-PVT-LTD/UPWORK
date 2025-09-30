namespace Netlarx.Product.Gobot.Controllers.TelegramIntegration
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Interface;
    using Newtonsoft.Json.Linq;
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;

    [ApiController]
    [Route("/api/[controller]")]
    public class TelegramWebhookController : ControllerBase
    {
        private readonly IBotDbContext _context;
        private readonly HttpClient _httpClient;

        public TelegramWebhookController(IBotDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
        }

        /// <summary>
        /// Telegram Webhook - receives all incoming messages
        /// </summary>
        [HttpPost("{configId:guid}")]
        public async Task<IActionResult> ReceiveUpdate(Guid configId, [FromBody] JObject update)
        {
            // Log full payload for debugging
            Console.WriteLine("📩 Incoming Telegram Update: " + update.ToString());

            // Extract message text & chat ID
            var message = update["message"];
            if (message == null) return Ok(); // No message (could be callback, edited msg, etc.)

            string text = message["text"]?.ToString();
            long chatId = message["chat"]?["id"]?.ToObject<long>() ?? 0;

            if (chatId == 0) return Ok();

            // Load Bot Config by configId
            var config = await _context.TelegramConfigs.FirstOrDefaultAsync(c => c.Id == configId);
            if (config == null)
            {
                Console.WriteLine($"⚠️ Bot config not found for Id: {configId}");
                return Ok(); // Or return NotFound() if you prefer
            }

            string botToken = config.AccessToken;

            // Example bot logic: simple echo
            string reply = $"You said: {text}";

            await SendMessage(botToken, chatId, reply);

            return Ok(); // Always respond with 200 OK
        }

        /// <summary>
        /// Send message back to Telegram user
        /// </summary>
        private async Task SendMessage(string botToken, long chatId, string text)
        {
            var payload = new
            {
                chat_id = chatId,
                text = text
            };

            var content = new StringContent(
                Newtonsoft.Json.JsonConvert.SerializeObject(payload),
                Encoding.UTF8,
                "application/json"
            );

            string url = $"https://api.telegram.org/bot{botToken}/sendMessage";
            await _httpClient.PostAsync(url, content);
        }
    }
}
