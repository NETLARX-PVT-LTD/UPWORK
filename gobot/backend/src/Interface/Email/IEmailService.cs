// ---------------------------------------------------------------------
// <copyright file="IEmailService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.Email
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.Email;
    using Netlarx.Products.Gobot.Result;
    using System.Threading.Tasks;

    public interface IEmailService
    {
        Task<Result> SendBotDetailsAsync(EmailBotDetailRequest request, Errors errors);
    }
}
