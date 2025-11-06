// ---------------------------------------------------------------------
// <copyright file="ConfigController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Gobot.Controllers.Email
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Helper;
    using Netlarx.Products.Gobot.Interface.Email;
    using Netlarx.Products.Gobot.ModelDTO.Email;
    using Netlarx.Products.Gobot.Result;
    using Microsoft.AspNetCore.Mvc;
    using System.Threading.Tasks;

    [Route("api/email")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        //  POST /api/email/send-bot-details
        [HttpPost("SendBotDetails")]
        public async Task<Result> SendBotDetailsAsync([FromBody] EmailBotDetailRequest request)
        {
            var errors = new Errors();
            var result = await _emailService.SendBotDetailsAsync(request, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }
    }
}
