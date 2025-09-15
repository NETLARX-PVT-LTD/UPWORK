

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class BotPublishRequest
    {
        [Key]
        public Guid BotPublishRequestId { get; set; }
        public string BotId { get; set; }
        public string BotName { get; set; }
        public string ApiType { get; set; }
        public string PhoneNumber { get; set; }
        public string WebhookUrl { get; set; }
        public string VerifyToken { get; set; }
        public string AccessToken { get; set; }
        public string PhoneNumberId { get; set; }
        public string BusinessAccountId { get; set; }
        public int storyId { get; set; }
        public DateTime PublishedAt { get; set; }
        public bool isActive { get; set; }
    }
    public class BotPublishResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string BotId { get; set; }
        public DateTime PublishedAt { get; set; }
    }
}
