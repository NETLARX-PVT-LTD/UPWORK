// ---------------------------------------------------------------------
// <copyright file="IUserTokenRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.FacebookIntegration.UserToken
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using System;
    using System.Threading.Tasks;

    public interface IUserTokenRepository
    {
        Task<bool> AddUserToken(UserToken userToken,Errors errors);
        Task<(bool success, UserToken? userToken)> GetUserTokenById(Guid id, Errors errors);
    }
}
