// ---------------------------------------------------------------------
// <copyright file="FormsController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
namespace Netlarx.Products.Gobot.Controllers.ConversationalForms
{
    using Gobot.Interface.ConversationalForms;
    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Helper;
    using Netlarx.Products.Gobot.ModelDTO.ConversationalForms;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    [Route("api/bots/{botId}/[controller]")]
    [ApiController]
    public class FormsController : ControllerBase
    {
        private readonly IConversationalFormsServcie _conversationalFormsServcie;
        public FormsController(IConversationalFormsServcie conversationalFormsServcie)
        {
            _conversationalFormsServcie = conversationalFormsServcie;
        }

        [HttpPost("CreateFormByBotId")]
        public async Task<ConversationalFormsActionResult> CreateFormByBotIdAsync(int botId, [FromBody] ConversationalFormRequest request)
        {
            var errors = new Errors();
            var result = await _conversationalFormsServcie.CreateFormAsync(botId, request, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        //  GET /forms/{formId} (Get form details)
        [HttpGet("GetFormById/{formId:guid}")]
        public async Task<ConversationalFormsResult> GetFormByIdAsync(Guid formId, int botId)
        {
            var errors = new Errors();
            var result = await _conversationalFormsServcie.GetFormByIdAsync(botId, formId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        //  PUT /forms/{formId} (Update form)
        [HttpPut("{formId:guid}")]
        public async Task<ConversationalFormsActionResult> UpdateForm(Guid formId, int botId, [FromBody] ConversationalFormRequest request)
        {
            var errors = new Errors();
            var result = await _conversationalFormsServcie.UpdateFormAsync(botId, formId, request, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        //  GET /forms (List all forms with fields)
        [HttpGet("GetAllForms")]
        public async Task<ConversationalFormsResult> GetAllForms(int botId)
        {
            var errors = new Errors();
            var result = await _conversationalFormsServcie.GetAllFormsAsync(botId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        // DELETE /forms/{formId} (Delete form)
        [HttpDelete("{formId:guid}")]
        public async Task<ConversationalFormsActionResult> DeleteForm(Guid formId, int botId)
        {
            var errors = new Errors();
            var result = await _conversationalFormsServcie.DeleteFormAsync(botId, formId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        //  POST /forms/{formId}/submit (Handle submissions)
        [HttpPost("{formId:guid}/submit")]
        public async Task<ConversationalFormsActionResult> SubmitForm(Guid formId)
        {
            var errors = new Errors();
            var result = await _conversationalFormsServcie.SubmitFormAsync(formId, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }

        [HttpPost("{formId:guid}/responses")]
        public async Task<ConversationalFormsActionResult> SubmitFormResponse(Guid formId, [FromBody] Dictionary<string, string> responses)
        {
            var errors = new Errors();
            var result = await _conversationalFormsServcie.SubmitFormResponseAsync(formId, responses, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }
    }
}