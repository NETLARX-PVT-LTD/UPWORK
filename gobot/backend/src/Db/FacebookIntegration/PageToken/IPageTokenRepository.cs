// ---------------------------------------------------------------------
// <copyright file="IPageTokenRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.FacebookIntegration.PageToken
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IPageTokenRepository
    {
        Task<bool> AddPageToken(PageToken pageToken, Errors errors);
        Task<(bool success, PageToken? pageToken)> GetPageTokenByPageId(string pageId, Errors errors);
        Task<(bool success, List<PageToken> pageTokens)> GetAllPageTokens(Errors errors);
    }
}
