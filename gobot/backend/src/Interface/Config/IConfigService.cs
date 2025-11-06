// ---------------------------------------------------------------------
// <copyright file="IBotService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.Config
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.Config;
    using System;
    using System.Threading.Tasks;

    public interface IConfigService
    {
        Task<BotConfigResult> GetConfig(Guid botId, Errors errors);
    }
}
