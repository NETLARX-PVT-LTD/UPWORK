// ---------------------------------------------------------------------
// <copyright file="IConversationalFormsServcie.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.ConversationalForms
{
    using Chatbot;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.ConversationalForms;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IConversationalFormsServcie
    {
        Task<ConversationalFormsResult> GetAllFormsAsync(int botId, Errors errors);
        Task<ConversationalFormsResult> GetFormByIdAsync(int botId, Guid formId, Errors errors);
        Task<ConversationalFormsActionResult> CreateFormAsync(int botId, ConversationalFormRequest formDto, Errors errors);
        Task<ConversationalFormsActionResult> UpdateFormAsync(int botId, Guid formId, ConversationalFormRequest formDto, Errors errors);
        Task<ConversationalFormsActionResult> DeleteFormAsync(int botId, Guid formId, Errors errors);
        Task<ConversationalFormsActionResult> SubmitFormAsync(Guid formId, Errors errors);
        Task<ConversationalFormsActionResult> SubmitFormResponseAsync(Guid formId, Dictionary<string, string> responses, Errors errors);
    }
}
