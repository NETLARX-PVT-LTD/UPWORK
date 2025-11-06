// ---------------------------------------------------------------------
// <copyright file="IEmailSettingsService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.EmailSetting
{
    using Gobot.ModelDTO.EmailSetting;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;
    using System.Threading.Tasks;

    public interface IEmailSettingsService
    {
        Task<Result> SaveEmailSettingsAsync(EmailSettingDto request, Errors errors);
        Task<EmailSettingResult> GetLatestEmailSettingsAsync(Errors errors);
        Task<Result> TestSmtpConnectionAsync(EmailSettingDto request, Errors errors);
    }
}