// ---------------------------------------------------------------------
// <copyright file="IBotConnectionRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.FacebookIntegration.BotConnection
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using System.Threading.Tasks;

    public interface IBotConnectionRepository
    {
        Task<bool> AddBotConnection(BotConnection botConnection, Errors errors);
        Task<(bool success, BotConnection? botConnection)> GetBotConnectionByPageId(string pageId, Errors errors);
        Task<bool> UpdateBotConnection(BotConnection botConnection, Errors errors);
    }
}