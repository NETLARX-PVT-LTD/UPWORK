// ---------------------------------------------------------------------
// <copyright file="ConfigService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services.Config
{
    using Netlarx.Products.Gobot.Db.Bots.Bot;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Interface.Config;
    using Netlarx.Products.Gobot.ModelDTO.Config;
    using System;
    using System.Threading.Tasks;

    public class ConfigService : IConfigService
    {
        private readonly IBotRepository _botRepository;

        public ConfigService(IBotRepository botRepository)
        {
            _botRepository = botRepository;
        }

        public async Task<BotConfigResult> GetConfig(Guid botId, Errors errors)
        {
            if (botId == Guid.Empty)
            {
                errors.Fill(FailureCode.BadRequest, "Invalid botId");
                return new BotConfigResult(false, "400", null, errors);
            }

            var (success, bot) = await _botRepository.GetBotById(botId, errors);
            if (!success || bot == null)
            {
                return new BotConfigResult(false, "404", null, errors);
            }

            var response = new BotConfigdto
            {
                Branding = new BrandingResult
                {
                    BotName = bot.BotName,
                    PrimaryColor = bot.PrimaryColor,
                    SecondaryColor = bot.SecondaryColor,
                    ImageUrl = bot.ImageUrl
                },
                WelcomeMessage = bot.WelcomeMessage,
                InputPlaceholder = bot.Placeholder
            };

            return new BotConfigResult(true, "200", response);
        }
    }
}