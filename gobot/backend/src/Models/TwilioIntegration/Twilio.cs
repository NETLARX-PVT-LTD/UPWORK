
namespace Netlarx.Products.Gobot.Models.TwilioIntegration
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class TwilioConfig
    {
        public int Id { get; set; }
        public string UserId { get; set; }        // Associate with logged-in user
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }     // ⚠ Sensitive → encrypt before saving
        public string SmsNumber { get; set; }
        public string SenderId { get; set; }
        public string WebhookUrl { get; set; }
        public string MessageHandlingType { get; set; }
        public string MessageHandlingMethod { get; set; }
    }


    public class MessageHandling
    {
        public string Type { get; set; }
        public string Method { get; set; }
    }

    public class TwilioConfigDto
    {
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }   // ⚠ Store securely, never return to frontend
        public string SmsNumber { get; set; }
        public string SenderId { get; set; }
        public string WebhookUrl { get; set; }

        public MessageHandlingConfig MessageHandling { get; set; }
    }

    public class MessageHandlingConfig
    {
        public string Type { get; set; }   // e.g., "webhook"
        public string Method { get; set; } // e.g., "POST"
    }
    public class TwilioTestRequest
    {
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }
    }
}
