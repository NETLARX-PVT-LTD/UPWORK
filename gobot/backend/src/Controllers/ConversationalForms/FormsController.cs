// ---------------------------------------------------------------------
// <copyright file="FormsController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
namespace Netlarx.Products.Gobot.Controllers.ConversationalForms
{
    using Chatbot;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microsoft.SqlServer.Server;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Pipelines;
    using Netlarx.Products.Gobot.Services;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    [Route("api/bots/{botId}/[controller]")]
    [ApiController]
    public class FormsController : ControllerBase
    {
        private readonly IBotDbContext _db;
        private readonly ILogger<FormsController> _logger;

        public FormsController(IBotDbContext db, ILogger<FormsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [MiddlewareFilter(typeof(ProtoPipeline))]
        [Consumes("application/x-protobuf")]
        [HttpPost]
        public async Task<IActionResult> CreateForm(int botId)
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not ConversationalFormBlock block)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (block == null) return BadRequest("Form data is required");

            var Form = new Models.ConversationalForm
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

            _db.ConversationalForm.Add(Form);

            foreach(var f in block.FormFields)
            {
                var formfield = new Models.FormField
                {
                    Name = f.Name,
                    Type = f.Type,
                    Required = f.Required,
                    PromptPhrase = f.PromptPhrase,
                    Options = f.Options?.ToList(),
                    OptionsText = f.OptionsText,
                    ConversationalFormId = Form.ID
                };

                _db.FormFields.Add(formfield);
            }

            await _db.SaveChangesAsync();

            return Ok(Form);
        }

        // ✅ GET /forms/{formId} (Get form details)
        [HttpGet("{formId:guid}")]
        public async Task<IActionResult> GetForm(Guid formId, int botId)
        {
            var form = await _db.ConversationalForm
            .Include(f => f.FormFields)
            .FirstOrDefaultAsync(f => f.ID == formId && f.BotId == botId);

            if (form == null) return NotFound("Form not found");

            var block = new ConversationalFormBlock
            {
                Type = form.Type,
                FormId = form.ID.ToString(),
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

                // ✅ Correct casing (PascalCase)
                FormFields = { form.FormFields.Select(f => new FormFieldd
                        {
                            FormFieldId = f.FormFieldId,
                            Name = f.Name,
                            Type = f.Type,
                            Required = f.Required,
                            PromptPhrase = f.PromptPhrase,
                            Options = { f.Options ?? new List<string>() },
                            OptionsText = f.OptionsText
                        }) }
            };

            return Ok(block);
        }

        // ✅ PUT /forms/{formId} (Update form)
        [MiddlewareFilter(typeof(ProtoPipeline))]
        [Consumes("application/x-protobuf")]
        [HttpPut("{formId:guid}")]
        public async Task<IActionResult> UpdateForm(Guid formId, int botId)
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not ConversationalFormBlock block)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            var form = await _db.ConversationalForm
                .FirstOrDefaultAsync(f => f.ID == formId && f.BotId == botId);

            if (form == null) return NotFound("Form not found");

            var formFields = await _db.FormFields
                                    .Where(f => f.ConversationalFormId == formId)
                                    .ToListAsync();

            // ✅ update form main properties
            form.FormName = block.FormName;
            form.WebhookUrl = block.WebhookUrl;
            form.SendEmailNotification = block.SendEmailNotification;
            form.NotificationEmail = block.NotificationEmail;
            form.ShowAsInlineForm = block.ShowAsInlineForm;
            form.RenderFormResponses = block.RenderFormResponses;
            form.AllowMultipleSubmission = block.AllowMultipleSubmission;
            form.MultipleSubmissionMessage = block.MultipleSubmissionMessage;
            form.AllowExitForm = block.AllowExitForm;
            form.ExitFormMessage = block.ExitFormMessage;
            form.SuccessResponseType = block.SuccessResponseType;
            form.ValidateEmail = block.ValidateEmail;
            form.ValidatePhone = block.ValidatePhone;
            form.SpamProtection = block.SpamProtection;
            form.RequireCompletion = block.RequireCompletion;
            form.SuccessMessage = block.SuccessMessage;
            form.RedirectUrl = block.RedirectUrl;

            // ✅ clear old fields before adding new ones
            if (formFields != null && formFields.Any())
            {
                _db.FormFields.RemoveRange(formFields);
            }

            // ✅ add new fields from request
            foreach (var f in block.FormFields)
            {
                var formfield = new Models.FormField
                {
                    Name = f.Name,
                    Type = f.Type,
                    Required = f.Required,
                    PromptPhrase = f.PromptPhrase,
                    Options = f.Options?.ToList(),
                    OptionsText = f.OptionsText,
                    ConversationalFormId = form.ID
                };

                _db.FormFields.Add(formfield);
            }

            await _db.SaveChangesAsync();

            formFields = await _db.FormFields
                                   .Where(f => f.ConversationalFormId == formId)
                                   .ToListAsync();

            // ✅ return updated block DTO
            var updatedBlock = new ConversationalFormBlock
            {
                Type = form.Type,
                FormId = form.ID.ToString(),
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
                // ✅ Correct casing (PascalCase)
                FormFields = { formFields.Select(f => new FormFieldd
                        {
                            FormFieldId = f.FormFieldId,
                            Name = f.Name,
                            Type = f.Type,
                            Required = f.Required,
                            PromptPhrase = f.PromptPhrase,
                            Options = { f.Options ?? new List<string>() },
                            OptionsText = f.OptionsText
                        }) }
            };

            return Ok(updatedBlock);
        }

        // ✅ GET /forms (List all forms with fields)
        [HttpGet]
        public async Task<IActionResult> GetAllForms(int botId)
        {
            var forms = await _db.ConversationalForm
                                .Where(f => f.BotId == botId)
                                .Include(f => f.FormFields)
                                .ToListAsync();

            if (forms == null || !forms.Any())
                return NotFound("No forms found");

            return Ok(forms);
        }

        // ✅ DELETE /forms/{formId} (Delete form)
        [HttpDelete("{formId:guid}")]
        public async Task<IActionResult> DeleteForm(Guid formId, int botId) 
        {
            var form = await _db.ConversationalForm
            .Include(f => f.FormFields)
            .FirstOrDefaultAsync(f => f.ID == formId && f.BotId == botId);

            if (form == null) return NotFound();

            _db.FormFields.RemoveRange(form.FormFields);
            _db.ConversationalForm.Remove(form);

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ✅ POST /forms/{formId}/submit (Handle submissions)
        [HttpPost("{formId:guid}/submit")]
        public async Task<IActionResult> SubmitForm(Guid formId)
        {
            var form = await _db.ConversationalForm.FindAsync(formId);
            if (form == null) return NotFound();

            var newSubmission = new FormSubmission
            {
                SubmissionId = Guid.NewGuid(),
                ConversationalFormId = formId,
                SubmittedAt = DateTime.UtcNow
            };

            _db.FormSubmissions.Add(newSubmission);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Form submitted successfully", submission = newSubmission });
        }
    }
}
