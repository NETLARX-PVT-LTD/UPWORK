// ---------------------------------------------------------------------
// <copyright file="FormsService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services.ConversationalForm
{
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Db.ConversationalForms;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Interface.ConversationalForms;
    using Netlarx.Products.Gobot.ModelDTO.Bots;
    using Netlarx.Products.Gobot.ModelDTO.ConversationalForms;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Validation;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class ConversationalFormsService : IConversationalFormsServcie
    {
        private readonly IConversationalFormsRepository _formRepoitory;
        private readonly ILogger<ConversationalFormsService> _logger;

        public ConversationalFormsService(IConversationalFormsRepository formRepoitory, ILogger<ConversationalFormsService> logger)
        {
            _formRepoitory = formRepoitory;
            _logger = logger;
        }

        public async Task<ConversationalFormsActionResult> CreateFormAsync(int botId, ConversationalFormRequest block, Errors errors)
        {
            var check = ConversationalFormValidation.ValidateConversationalForm(block, errors);
            if (!check)
            {
                return new ConversationalFormsActionResult(false, "400", null, errors);
            }

            var form = new ConversationalForm
            {
                ID = Guid.NewGuid(),
                BotId = botId,
                Type = "conversationalForm",
                FormName = block.FormName,
                WebhookUrl = block.WebhookUrl,
                SendEmailNotification = block.SendEmailNotification,
                NotificationEmail = block.NotificationEmail,
                ShowAsInlineForm = block.ShowAsInlineForm,
                RenderFormResponses = block.RenderFormResponses,
                AllowMultipleSubmission = block.AllowMultipleSubmission,
                MultipleSubmissionMessage = block.MultipleSubmissionMessage,
                AllowExitForm = block.AllowExitForm,
                ExitFormMessage = block.ExitFormMessage,
                SuccessResponseType = block.SuccessResponseType,
                //SuccessRedirectStoryId = block.SuccessRedirectStoryId,
                ValidateEmail = block.ValidateEmail,
                ValidatePhone = block.ValidatePhone,
                SpamProtection = block.SpamProtection,
                RequireCompletion = block.RequireCompletion,
                SuccessMessage = block.SuccessMessage,
                RedirectUrl = block.RedirectUrl
            };
            var fields = block.FormFields.Select(f => new FormField
            {
                Name = f.Name,
                Type = f.Type,
                Required = f.Required,
                PromptPhrase = f.PromptPhrase,
                Options = f.Options?.ToList(),
                OptionsText = f.OptionsText,
                ConversationalFormId = form.ID
            }).ToList();

            var (success, formId) = await _formRepoitory.AddFormAsync(form, fields, errors);
            if (!success)
            {
                return new ConversationalFormsActionResult(success, "500", null, errors);
            }

            return new ConversationalFormsActionResult(success, "200", formId);
        }

        public async Task<ConversationalFormsResult> GetFormByIdAsync(int botId, Guid formId, Errors errors)
        {
            if (botId < 0 || formId == Guid.Empty)
            {
                errors.Fill(FailureCode.InvalidInput, "Invalid Id");
                return new ConversationalFormsResult(false, "400", null, errors);
            }

            var (success, form) = await _formRepoitory.GetFormByIdAsync(botId, formId, errors);

            if (!success || form == null)
            {
                return new ConversationalFormsResult(false, "404", null, errors);
            }

            var formFields = form.FormFields.Select(f =>
            {
                var fieldDto = new FormFieldDto
                {
                    FormFieldId = f.FormFieldId,
                    Name = f.Name,
                    Type = f.Type,
                    Required = f.Required,
                    PromptPhrase = f.PromptPhrase,
                    OptionsText = f.OptionsText
                };

                if (f.Options != null)
                {
                    fieldDto.Options.AddRange(f.Options);
                }

                return fieldDto;
            }).ToList();

            var dto = new ConversationalFormBlockDto
            {
                Type = form.Type,
                FormId = form.ID.ToString(),
                BotId = form.BotId,
                FormName = form.FormName,
                WebhookUrl = form.WebhookUrl,
                SendEmailNotification = form.SendEmailNotification,
                NotificationEmail = form.NotificationEmail,
                ShowAsInlineForm = form.ShowAsInlineForm,
                RenderFormResponses = form.RenderFormResponses,
                AllowMultipleSubmission = form.AllowMultipleSubmission,
                MultipleSubmissionMessage = form.MultipleSubmissionMessage,
                AllowExitForm = form.AllowExitForm,
                ExitFormMessage = form.ExitFormMessage,
                SuccessResponseType = form.SuccessResponseType,
                ValidateEmail = form.ValidateEmail,
                ValidatePhone = form.ValidatePhone,
                SpamProtection = form.SpamProtection,
                RequireCompletion = form.RequireCompletion,
                SuccessMessage = form.SuccessMessage,
                RedirectUrl = form.RedirectUrl,
                ToComponentType = form.ToComponentType,
                ToComponentId = form.ToComponentId.ToString(),
                FormFields = formFields
            };

            return new ConversationalFormsResult(true, "200", new List<ConversationalFormBlockDto> { dto }, errors);
        }

        public async Task<ConversationalFormsActionResult> UpdateFormAsync(int botId, Guid formId, ConversationalFormRequest block, Errors errors)
        {
            var check = ConversationalFormValidation.ValidateConversationalForm(block, errors);
            if (!check)
            {
                return new ConversationalFormsActionResult(false, "400", null, errors);
            }

            var (success, form) = await _formRepoitory.GetFormByIdAsync(botId, formId, errors);

            if (!success || form == null)
            {
                return new ConversationalFormsActionResult(false, "404", null, errors);
            }

            var Updatedform = new ConversationalForm
            {
                Type = "conversationalForm",
                FormName = block.FormName,
                WebhookUrl = block.WebhookUrl,
                SendEmailNotification = block.SendEmailNotification,
                NotificationEmail = block.NotificationEmail,
                ShowAsInlineForm = block.ShowAsInlineForm,
                RenderFormResponses = block.RenderFormResponses,
                AllowMultipleSubmission = block.AllowMultipleSubmission,
                MultipleSubmissionMessage = block.MultipleSubmissionMessage,
                AllowExitForm = block.AllowExitForm,
                ExitFormMessage = block.ExitFormMessage,
                SuccessResponseType = block.SuccessResponseType,
                //SuccessRedirectStoryId = block.SuccessRedirectStoryId,
                ValidateEmail = block.ValidateEmail,
                ValidatePhone = block.ValidatePhone,
                SpamProtection = block.SpamProtection,
                RequireCompletion = block.RequireCompletion,
                SuccessMessage = block.SuccessMessage,
                RedirectUrl = block.RedirectUrl
            };

            var fields = block.FormFields.Select(f => new FormField
            {
                Name = f.Name,
                Type = f.Type,
                Required = f.Required,
                PromptPhrase = f.PromptPhrase,
                Options = f.Options?.ToList(),
                OptionsText = f.OptionsText,
                ConversationalFormId = form.ID
            }).ToList();

            var (successupdate, Id) = await _formRepoitory.UpdateFormAsync(form, fields, errors);
            if (!successupdate)
            {
                return new ConversationalFormsActionResult(successupdate, "500", null, errors);
            }

            return new ConversationalFormsActionResult(successupdate, "200", formId);
        }

        public async Task<ConversationalFormsResult> GetAllFormsAsync(int botId, Errors errors)
        {
            if (botId < 0)
            {
                errors.Fill(FailureCode.InvalidInput, "Invalid BotId");
                return new ConversationalFormsResult(false, "400", null, errors);
            }

            var (success, forms) = await _formRepoitory.GetAllFormsAsync(botId, errors);

            if (!success || forms == null || !forms.Any())
            {
                return new ConversationalFormsResult(false, "404", null, errors);
            }

            var dtoList = forms.Select(form =>
            {
                var fieldDtos = form.FormFields.Select(f =>
                {
                    var fieldDto = new FormFieldDto
                    {
                        FormFieldId = f.FormFieldId,
                        Name = f.Name,
                        Type = f.Type,
                        Required = f.Required,
                        PromptPhrase = f.PromptPhrase,
                        OptionsText = f.OptionsText
                    };

                    if (f.Options != null)
                    {
                        fieldDto.Options.AddRange(f.Options);
                    }

                    return fieldDto;
                }).ToList();

                var dto = new ConversationalFormBlockDto
                {
                    Type = "conversationalForm",
                    FormId = form.ID.ToString(),
                    BotId = form.BotId,
                    FormName = form.FormName,
                    WebhookUrl = form.WebhookUrl,
                    SendEmailNotification = form.SendEmailNotification,
                    NotificationEmail = form.NotificationEmail,
                    ShowAsInlineForm = form.ShowAsInlineForm,
                    RenderFormResponses = form.RenderFormResponses,
                    AllowMultipleSubmission = form.AllowMultipleSubmission,
                    MultipleSubmissionMessage = form.MultipleSubmissionMessage,
                    AllowExitForm = form.AllowExitForm,
                    ExitFormMessage = form.ExitFormMessage,
                    SuccessResponseType = form.SuccessResponseType,
                    ValidateEmail = form.ValidateEmail,
                    ValidatePhone = form.ValidatePhone,
                    SpamProtection = form.SpamProtection,
                    RequireCompletion = form.RequireCompletion,
                    SuccessMessage = form.SuccessMessage,
                    RedirectUrl = form.RedirectUrl,
                    ToComponentType = form.ToComponentType,
                    ToComponentId = form.ToComponentId.ToString(),
                    FormFields = fieldDtos
                };

                return dto;
            }).ToList();

            return new ConversationalFormsResult(true, "200", dtoList, errors);
        }

        public async Task<ConversationalFormsActionResult> DeleteFormAsync(int botId, Guid formId, Errors errors)
        {
            if (botId < 0 || formId == Guid.Empty)
            {
                errors.Fill(FailureCode.InvalidInput, "Invalid BotId");
                return new ConversationalFormsActionResult(false, "400", null, errors);
            }

            var success = await _formRepoitory.DeleteFormAsync(botId, formId, errors);
            if (!success)
            {
                return new ConversationalFormsActionResult(false, "500", null, errors);
            }

            return new ConversationalFormsActionResult(success, "204", formId, errors);
        }

        public async Task<ConversationalFormsActionResult> SubmitFormAsync(Guid formId, Errors errors)
        {
            if (formId == Guid.Empty)
            {
                errors.Fill(FailureCode.ValidationError, "Invalid form ID.");
                return new ConversationalFormsActionResult(false, "400", null, errors);
            }

            var (success, submissionId) = await _formRepoitory.SubmitFormAsync(formId, errors);
            if (!success)
            {
                return new ConversationalFormsActionResult(false, "500", null, errors);
            }

            return new ConversationalFormsActionResult(success, "200", submissionId);
        }

        public async Task<ConversationalFormsActionResult> SubmitFormResponseAsync(Guid formId, Dictionary<string, string> responses, Errors errors)
        {
            if (formId == Guid.Empty)
            {
                errors.Fill(FailureCode.ValidationError, "Invalid form ID.");
                return new ConversationalFormsActionResult(false, "400", null, errors);
            }

            if (responses == null || responses.Count == 0)
            {
                errors.Fill(FailureCode.ValidationError, "Responses cannot be empty.");
                return new ConversationalFormsActionResult(false, "400", null, errors);
            }

            var (success, responseId) = await _formRepoitory.SubmitFormResponseAsync(formId, responses, errors);
            if (!success)
            {
                return new ConversationalFormsActionResult(false, "500", null, errors);
            }

            return new ConversationalFormsActionResult(success, "200", responseId, errors);
        }
    }
}

