// ---------------------------------------------------------------------
// <copyright file="BotConfig.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------



namespace Netlarx.Products.Gobot.Models
{
    using System.ComponentModel.DataAnnotations;

    public class BotConfig
    {
        [Key]
        public string BotConfigId { get; set; }
        public string BotId { get; set; }
        public string BotName { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }
        public string ImageURL { get; set; }
        public string WelcomeMessage { get; set; }
        public string InputPlaceholder { get; set; }
        public string FallbackMessage { get; set; }
        public bool IsActive { get; set; }
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
