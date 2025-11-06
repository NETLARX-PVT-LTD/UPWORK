// ---------------------------------------------------------------------
// <copyright file="BotConfigResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Config
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;

    public class BotConfigResult : Result
    {
        public BotConfigResult(bool success, string statusCode, BotConfigdto? botConfig, Errors? error = null)
            : base(success, error, statusCode)
        {
            BotConfig = botConfig;
        }

        public BotConfigdto BotConfig { get; set; }
    }
    public class BotConfigdto
    {
        public BrandingResult Branding { get; set; }
        public string WelcomeMessage { get; set; }
        public string InputPlaceholder { get; set; }
    }

    public class BrandingResult
    {
        public string BotName { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }
        public string ImageUrl { get; set; }
    }
}
