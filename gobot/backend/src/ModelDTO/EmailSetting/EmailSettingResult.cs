// ---------------------------------------------------------------------
// <copyright file="EmailBotDetailRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.EmailSetting
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;

    public class EmailSettingResult:Result
    {
         public EmailSettingResult(bool success, string statusCode, EmailSettingDto? emailSettingDto, Errors? error = null)
             : base(success, error, statusCode)
         {
             EmailSettingDto = emailSettingDto;
         }

         public EmailSettingDto EmailSettingDto { get; set; }
    }
}