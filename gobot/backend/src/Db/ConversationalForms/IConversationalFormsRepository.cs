// ---------------------------------------------------------------------
// <copyright file="IConversationalFormsRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.ConversationalForms
{
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Errors;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IConversationalFormsRepository
    {
        Task<(bool success, List<ConversationalForm>? forms)> GetAllFormsAsync(int botId, Errors errors);
        Task<(bool success, ConversationalForm? form)> GetFormByIdAsync(int botId, Guid formId, Errors errors);
        Task<(bool success, Guid? formId)> AddFormAsync(ConversationalForm form, List<FormField> fields, Errors errors);
        Task<(bool success, Guid? formId)> UpdateFormAsync(ConversationalForm form, List<FormField> fields, Errors errors);
        Task<bool> DeleteFormAsync(int botId, Guid formId, Errors errors);
        Task<(bool success, Guid? submissionId)> SubmitFormAsync(Guid formId, Errors errors);
        Task<(bool success, Guid? responseId)> SubmitFormResponseAsync(Guid formId, Dictionary<string, string> responses, Errors errors);
    }
}