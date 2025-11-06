// ---------------------------------------------------------------------
// <copyright file="EmailBotDetailRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.EmailSetting   
{
    public class EmailSettingDto
    {
        public string SenderName { get; set; }
        public string SecurityProtocol { get; set; }
        public string SmtpHost { get; set; }
        public string SmtpPort { get; set; }
        public string SmtpUsername { get; set; }
        public string SmtpEmail { get; set; }
        public string SmtpPassword { get; set; }
    }
}