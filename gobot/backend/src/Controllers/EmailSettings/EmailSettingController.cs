// ---------------------------------------------------------------------
// <copyright file="EmailSettingController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.EmailSettings
{
    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Helper;
    using Netlarx.Products.Gobot.Interface.EmailSetting;
    using Netlarx.Products.Gobot.ModelDTO.EmailSetting;
    using Netlarx.Products.Gobot.Result;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/partner/email")]
    public class EmailSettingController : ControllerBase
    {
        private readonly IEmailSettingsService _emailSettingService;

        public EmailSettingController(IEmailSettingsService emailSettingService)
        {
            _emailSettingService = emailSettingService;
        }

        [HttpPost("SaveEmailSettings")]
        public async Task<Result> SaveEmailSettingsAsync([FromBody] EmailSettingDto request)
        {
            var errors = new Errors();
            var result = await _emailSettingService.SaveEmailSettingsAsync(request, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        [HttpGet("GetEmailSettings")]
        public async Task<EmailSettingResult> GetEmailSettingsAsync()
        {
            var errors = new Errors();
            var result = await _emailSettingService.GetLatestEmailSettingsAsync(errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        [HttpPost("TestEmailConnection")]
        public async Task<Result> TestEmailConnectionAsync([FromBody] EmailSettingDto request)
        {
            var errors = new Errors();
            var result = await _emailSettingService.TestSmtpConnectionAsync(request, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }
    }
}