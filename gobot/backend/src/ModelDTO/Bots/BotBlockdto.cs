// ---------------------------------------------------------------------
// <copyright file="BotBlockDto.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    public class BotBlockDto
    {
        public string BotId { get; set; }
        public string BotName { get; set; }
        public string ApiKey { get; set; }

        //  public int StoryId { get; set; }
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
        public bool IsActive { get; set; }
        public string WelcomeMessage { get; set; }
        public string FallbackMessage { get; set; }
        public ThemeBlockDto Themes { get; set; }
        public LandingConfigBlockDto LandingConfigs { get; set; }
    }

    public class ThemeBlockDto
    {
        public string Id { get; set; }
        public string PrimaryColor { get; set; }
    }

    public class LandingConfigBlockDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string BackgroundStyle { get; set; }
    }

}
