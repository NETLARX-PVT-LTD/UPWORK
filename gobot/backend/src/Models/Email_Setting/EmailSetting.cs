namespace Netlarx.Products.Gobot.Models.Email_Setting
{
    using System;

    public class EmailSetting
    {
        public Guid Id { get; set; }
        public string SenderName { get; set; }
        public string SecurityProtocol { get; set; }
        public string SmtpHost { get; set; }
        public string SmtpPort { get; set; }
        public string SmtpUsername { get; set; }
        public string SmtpEmail { get; set; }
        public string SmtpPassword { get; set; } // Will store encrypted
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
