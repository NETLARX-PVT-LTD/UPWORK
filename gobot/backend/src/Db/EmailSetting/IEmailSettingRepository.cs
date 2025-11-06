// ---------------------------------------------------------------------
// <copyright file="IEmailSettingsRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.EmailSetting
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models.Email_Setting;
    using System.Threading.Tasks;

    public interface IEmailSettingsRepository
    {
        Task<(bool success, EmailSetting? emailSetting)> GetLatestEmailSetting(Errors errors);
        Task<bool>AddEmailSetting(EmailSetting setting, Errors errors);
    }
}