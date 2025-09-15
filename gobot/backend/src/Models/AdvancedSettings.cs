// ---------------------------------------------------------------------
// <copyright file="AdvancedSettings.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

using System.Collections.Generic;

namespace Netlarx.Products.Gobot.Models
{
    public class AdvancedSettings
    {
        public string PreferredLanguage { get; set; }
        public bool OpenChatbotOnLoad { get; set; }
        public bool HideInputFromWebsite { get; set; }
        public bool MoveChatbotToLeft { get; set; }
        public bool DeleteUserChatPermanently { get; set; }
        public bool HumanHelpForm { get; set; }
        public bool StartChatbotOnWidgetClick { get; set; }
        public int BotActivationTime { get; set; }
        public string LeadCollectionForm { get; set; }
        public int ChatbotSize { get; set; }
        public int MobileChatbotSize { get; set; }
        public bool HideChatbotOnMobile { get; set; }
        public bool HideChatbotPopupOnMobileLoad { get; set; }
        public bool CsatEnabled { get; set; }
        public List<string> CsatQuestions { get; set; }
        public List<string> UrlExclusions { get; set; }
        public List<string> IpExclusions { get; set; }
    }
}
