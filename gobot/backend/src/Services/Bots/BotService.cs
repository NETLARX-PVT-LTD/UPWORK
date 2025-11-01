// ---------------------------------------------------------------------
// <copyright file="AiService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services.Bots
{
    using Gobot.Interface.Bots;
    using Gobot.ModelDTO.Bots;
    using Netlarx.Products.Gobot.Db.Bots.Bot;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Validations;
    using System;
    using System.Threading.Tasks;

    public class BotService : IBotService
    {
        private readonly IBotRepository _botRepository;

        public BotService(IBotRepository botRepository)
        {
            _botRepository = botRepository;
        }

        public async Task<BotDetail> GetBotByIdAsync(Guid botId, Errors errors)
        {
            if (botId == Guid.Empty)
            {
                errors.Fill(FailureCode.InvalidInput, "Bot ID cannot be empty.");
                return new BotDetail(false, "400", null, errors);
            }

            var (success, bot) = await _botRepository.GetBotById(botId, errors);
            if (!success || bot == null)
            {
                errors.Fill(FailureCode.NotFound, $"Bot with ID {botId} not found.");
                return new BotDetail(false, "404", null, errors);
            }

            var botblock = new BotBlockDto
            {
                BotId = bot.BotId.ToString(),
                BotName = bot.BotName,
                ApiKey = bot.ApiKey,
                // story_Id = bot.StoryId, 
                Position = bot.Position,
                Size = bot.Size,
                Greeting = bot.Greeting,
                Placeholder = bot.Placeholder,
                AllowFullscreen = bot.AllowFullscreen,
                ShowBranding = bot.ShowBranding,
                BackgroundStyle = bot.BackgroundStyle,
                PrimaryColor = bot.PrimaryColor,
                SecondaryColor = bot.SecondaryColor,
                ImageUrl = bot.ImageUrl,
                WelcomeMessage = bot.WelcomeMessage,
                FallbackMessage = bot.FallbackMessage,
                IsActive = bot.IsActive,
                Themes = bot.Theme != null ? new ThemeBlockDto
                {
                    Id = bot.Theme.Id.ToString(),
                    PrimaryColor = bot.Theme.PrimaryColor
                } : null,

                LandingConfigs = bot.LandingConfig != null ? new LandingConfigBlockDto
                {
                    Id = bot.LandingConfig.Id.ToString(),
                    Title = bot.LandingConfig.Title,
                    Description = bot.LandingConfig.Description,
                    BackgroundStyle = bot.LandingConfig.BackgroundStyle
                } : null,
            };

            return new BotDetail(true, "200", botblock);
        }

        public async Task<BotResult> CreateBotAsync(BotRequestDto block, Errors errors)
        {
            var check = UniversalValidation.Validate(block, errors);
            if (!check)
            {
                return new BotResult(false, "400", Guid.Empty, errors);
            }

            var botEntity = new Bot
            {
                BotName = block.BotName,
                ApiKey = string.IsNullOrEmpty(block.ApiKey) ? Guid.NewGuid().ToString("N") : block.ApiKey,   // Create a key using guid and "N' is used to remove '-' from guid
                Position = block.Position,
                Size = block.Size,
                Greeting = block.Greeting,
                Placeholder = block.Placeholder,
                FallbackMessage = block.FallbackMessage,
                AllowFullscreen = block.AllowFullscreen,
                ShowBranding = block.ShowBranding,
                BackgroundStyle = block.BackgroundStyle,
                IsActive = block.IsActive,
                PrimaryColor = block.PrimaryColor,
                SecondaryColor = block.SecondaryColor,
                ImageUrl = block.ImageUrl,
                WelcomeMessage = block.WelcomeMessage,

                Theme = block.Theme == null ? null : new Theme
                {
                    PrimaryColor = block.Theme.PrimaryColor
                },

                LandingConfig = block.LandingConfig == null ? null : new LandingConfig
                {
                    Title = block.LandingConfig.Title,
                    Description = block.LandingConfig.Description,
                    BackgroundStyle = block.LandingConfig.BackgroundStyle
                }
            };

            var (success, botId) = await _botRepository.CreateBot(botEntity, errors);
            if (!success || botId == Guid.Empty)
            {
                errors.Fill(FailureCode.DatabaseError, "Failed to create bot.");
                return new BotResult(false, "500", Guid.Empty, errors);
            }
            return new BotResult(true, "201", botId);
        }

        public async Task<BotResult> UpdateBotAsync(Guid botId, BotRequestDto botRequest, Errors errors)
        {
            var isValid = UniversalValidation.Validate(botRequest, errors);
            if (!isValid)
            {
                return new BotResult(false, "400", Guid.Empty, errors);
            }

            var (success, existingBot) = await _botRepository.GetBotById(botId, errors);
            if (!success || existingBot == null)
            {
                return new BotResult(false, "404", Guid.Empty, errors);
            }

            existingBot.BotName = botRequest.BotName ?? existingBot.BotName;
            existingBot.Position = botRequest.Position ?? existingBot.Position;
            existingBot.Size = botRequest.Size ?? existingBot.Size;
            existingBot.Greeting = botRequest.Greeting ?? existingBot.Greeting;
            existingBot.Placeholder = botRequest.Placeholder ?? existingBot.Placeholder;
            existingBot.AllowFullscreen = botRequest.AllowFullscreen;
            existingBot.ShowBranding = botRequest.ShowBranding;
            existingBot.BackgroundStyle = botRequest.BackgroundStyle ?? existingBot.BackgroundStyle;
            existingBot.ApiKey = botRequest.ApiKey ?? existingBot.ApiKey;
            existingBot.PrimaryColor = botRequest.PrimaryColor ?? existingBot.PrimaryColor;
            existingBot.SecondaryColor = botRequest.SecondaryColor ?? existingBot.SecondaryColor;
            existingBot.ImageUrl = botRequest.ImageUrl ?? existingBot.ImageUrl;
            existingBot.WelcomeMessage = botRequest.WelcomeMessage ?? existingBot.WelcomeMessage;
            existingBot.FallbackMessage = botRequest.FallbackMessage ?? existingBot.FallbackMessage;
            existingBot.IsActive = botRequest.IsActive;

            if (botRequest.Theme != null)
            {
                if (existingBot.Theme == null)
                {
                    existingBot.Theme = new Theme();
                }

                existingBot.Theme.PrimaryColor = botRequest.Theme.PrimaryColor ?? existingBot.Theme.PrimaryColor;
            }

            if (botRequest.LandingConfig != null)
            {
                if (existingBot.LandingConfig == null)
                {
                    existingBot.LandingConfig = new LandingConfig
                    {
                        Title = botRequest.LandingConfig.Title,
                        Description = botRequest.LandingConfig.Description,
                        BackgroundStyle = botRequest.LandingConfig.BackgroundStyle
                    };
                }
                else
                {
                    existingBot.LandingConfig.Title = botRequest.LandingConfig.Title ?? existingBot.LandingConfig.Title;
                    existingBot.LandingConfig.Description = botRequest.LandingConfig.Description ?? existingBot.LandingConfig.Description;
                    existingBot.LandingConfig.BackgroundStyle = botRequest.LandingConfig.BackgroundStyle ?? existingBot.LandingConfig.BackgroundStyle;
                }
            }

            var updateSuccess = await _botRepository.UpdateBot(existingBot, errors);
            if (!updateSuccess)
            {
                return new BotResult(false, "500", Guid.Empty, errors);
            }

            return new BotResult(true, "200", botId);
        }

        public async Task<BotResult> DeleteBotAsync(Guid botId, Errors errors)
        {
            if (botId == Guid.Empty)
            {
                errors.Fill(FailureCode.ValidationError, "Bot Id is Required");
                return new BotResult(false, "400", Guid.Empty, errors);
            }

            var (success, bot) = await _botRepository.GetBotById(botId, errors);
            if (!success || bot == null)
            {
                return new BotResult(false, "404", Guid.Empty, errors);
            }

            var deleteSuccess = await _botRepository.DeleteBot(bot, errors);
            if (!deleteSuccess)
            {
                return new BotResult(false, "500", Guid.Empty, errors);
            }

            return new BotResult(true, "200", botId);
        }

        //Landing
        public async Task<LandingPageResult> GetLandingPageAsync(Guid botId, Errors errors)
        {
            if (botId == Guid.Empty)
            {
                errors.Fill(FailureCode.InvalidInput, "BotId is required and cannot be empty.");
                return new LandingPageResult(false, "400", null, errors);
            }

            var (success, bot) = await _botRepository.GetLandingPage(botId, errors);
            if (!success || bot == null)
            {
                return new LandingPageResult(false, "404", null, errors);
            }

            var landingPageDto = new LandingPageDto
            {
                Title = bot.LandingConfig?.Title,
                Description = bot.LandingConfig?.Description,
                BackgroundStyle = bot.LandingConfig?.BackgroundStyle,
                BotConfig = new BotConfigDto
                {
                    Id = bot.BotId,
                    //story = bot.StoryId,
                    PrimaryColor = bot.Theme?.PrimaryColor,
                    Name = bot.BotName,
                    Greeting = bot.Greeting
                }
            };

            return new LandingPageResult(true, "200", landingPageDto);
        }
    }
}