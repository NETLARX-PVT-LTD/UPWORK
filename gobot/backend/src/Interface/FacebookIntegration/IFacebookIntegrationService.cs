// ---------------------------------------------------------------------
// <copyright file="IFacebookIntegrationService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.FacebookIntegration
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.FacebookIntegration;
    using Netlarx.Products.Gobot.Result;
    using System.Threading.Tasks;

    public interface IFacebookIntegrationService
    {
        Task<SyncPagesResult> SyncPages(TokenRequest request, Errors errors);
        Task<Result> ConnectBot(ConnectBotRequest request, Errors errors);
        Task<Result> DisconnectBot(DisconnectBotRequest request, Errors errors);
        Task<BotStatusResult> GetBotStatus(string pageId, Errors errors);
    }
}