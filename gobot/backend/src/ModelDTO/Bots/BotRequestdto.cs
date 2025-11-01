// ---------------------------------------------------------------------
// <copyright file="BotRequestDto.cs" company="Netlarx">
// Copyright (c) Netlarx Softwares Pvt Ltd. All rights reserved.
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    public class BotRequestDto
    {
        public string BotName { get; set; }
        public string ApiKey { get; set; }
        public ThemeRequestDto Theme { get; set; }
        public string Position { get; set; }
        public string Size { get; set; }
        public string Greeting { get; set; }
        public string Placeholder { get; set; }
        public bool AllowFullscreen { get; set; }
        public bool ShowBranding { get; set; }
        public string BackgroundStyle { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }
        public string ImageUrl { get; set; }
        public string WelcomeMessage { get; set; }
        public string FallbackMessage { get; set; }
        public bool IsActive { get; set; }
        public LandingConfigRequestDto LandingConfig { get; set; }
    }
    public class ThemeRequestDto
    {
        public string PrimaryColor { get; set; }
    }
    public class LandingConfigRequestDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string BackgroundStyle { get; set; }
    }
}
