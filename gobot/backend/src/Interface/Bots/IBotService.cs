// ---------------------------------------------------------------------
// <copyright file="IBotService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.Bots
{
    using Gobot.ModelDTO.Bots;
    using Netlarx.Products.Gobot.Errors;
    using System;
    using System.Threading.Tasks;

    public interface IBotService
    {
        // Bot
        Task<BotDetail> GetBotByIdAsync(Guid botId, Errors errors);
        Task<BotResult> CreateBotAsync(BotRequestDto block, Errors errors);
        Task<BotResult> UpdateBotAsync(Guid botId, BotRequestDto block, Errors errors);
        Task<BotResult> DeleteBotAsync(Guid botId, Errors errors);

        //Landing
        Task<LandingPageResult> GetLandingPageAsync(Guid botId, Errors errors);
    }
}