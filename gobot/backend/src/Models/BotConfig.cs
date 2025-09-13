// ---------------------------------------------------------------------
// <copyright file="BotConfig.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    public class BotConfig
    {
        public string BotId { get; set; }
        public string BotName { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }
        public string LogoUrl { get; set; }
        public string FaviconUrl { get; set; }
        public string WelcomeMessage { get; set; }
        public string InputPlaceholder { get; set; }
    }

    // Response DTO (matches your required payload)
    public class BotConfigResponse
    {
        public Branding Branding { get; set; }
        public string WelcomeMessage { get; set; }
        public string InputPlaceholder { get; set; }
    }

    public class Branding
    {
        public string BotName { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }
        public string ImageUrl { get; set; }
    }
}
