// ---------------------------------------------------------------------
// <copyright file="ConversationalFormsRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------
namespace Netlarx.Products.Gobot.Db.ConversationalForms
{
    using Gobot.Models;
    using Gobot.Errors;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using System.Linq;
    using Microsoft.EntityFrameworkCore;

    public class ConversationalFormsRepository : IConversationalFormsRepository
    {
        private readonly BotDbContext _context;

        public ConversationalFormsRepository(BotDbContext context)
        {
            _context = context;
        }

        public async Task<(bool success, List<ConversationalForm>? forms)> GetAllFormsAsync(int botId, Errors errors)
        {
            try
            {
                var forms = await _context.ConversationalForm
                    .Where(f => f.BotId == botId)
                    .Include(f => f.FormFields)
                    .ToListAsync();

                return (true, forms);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error fetching forms: {ex.Message}");
                return (false, null);
            }
        }

        public async Task<(bool success, ConversationalForm? form)> GetFormByIdAsync(int botId, Guid formId, Errors errors)
        {
            try
            {
                var form = await _context.ConversationalForm
                    .Include(f => f.FormFields)
                    .FirstOrDefaultAsync(f => f.BotId == botId && f.ID == formId);

                if (form == null)
                {
                    errors.Fill(FailureCode.NotFound, $"Form with ID {formId} not found.");
                    return (false, null);
                }

                return (true, form);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error fetching form: {ex.Message}");
                return (false, null);
            }
        }

        public async Task<(bool success, Guid? formId)> AddFormAsync(ConversationalForm form, List<FormField> fields, Errors errors)
        {
            try
            {
                await _context.ConversationalForm.AddAsync(form);
                await _context.FormFields.AddRangeAsync(fields);
                await _context.SaveChangesAsync();
                return (true, form.ID);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error creating form: {ex.Message}");
                return (false, null);
            }
        }

        public async Task<(bool success, Guid? formId)> UpdateFormAsync(ConversationalForm form, List<FormField> fields, Errors errors)
        {
            try
            {
                var existingFields = await _context.FormFields
                    .Where(f => f.ConversationalFormId == form.ID)
                    .ToListAsync();

                if (existingFields.Any())
                {
                    _context.FormFields.RemoveRange(existingFields);
                }

                _context.ConversationalForm.Update(form);
                await _context.FormFields.AddRangeAsync(fields);

                await _context.SaveChangesAsync();
                return (true, form.ID);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error updating form: {ex.Message}");
                return (false, null);
            }
        }

        public async Task<bool> DeleteFormAsync(int botId, Guid formId, Errors errors)
        {
            try
            {
                var form = await _context.ConversationalForm
                    .Include(f => f.FormFields)
                    .FirstOrDefaultAsync(f => f.ID == formId && f.BotId == botId);

                if (form == null)
                {
                    errors.Fill(FailureCode.NotFound, "Form not found.");
                    return false;
                }

                _context.FormFields.RemoveRange(form.FormFields);
                _context.ConversationalForm.Remove(form);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error deleting form: {ex.Message}");
                return false;
            }
        }

        public async Task<(bool success, Guid? submissionId)> SubmitFormAsync(Guid formId, Errors errors)
        {
            try
            {
                var form = await _context.ConversationalForm.FindAsync(formId);
                if (form == null)
                {
                    errors.Fill(FailureCode.NotFound, $"Form with Id '{formId}' not found.");
                    return (false, null);
                }

                var submission = new FormSubmission
                {
                    SubmissionId = Guid.NewGuid(),
                    ConversationalFormId = formId,
                    SubmittedAt = DateTime.UtcNow
                };

                _context.FormSubmissions.Add(submission);
                await _context.SaveChangesAsync();

                return (true, submission.SubmissionId);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error submitting form: {ex.Message}");
                return (false, null);
            }
        }

        public async Task<(bool success, Guid? responseId)> SubmitFormResponseAsync(Guid formId, Dictionary<string, string> responses, Errors errors)
        {
            try
            {
                var form = await _context.ConversationalForm
                    .Include(f => f.FormFields)
                    .FirstOrDefaultAsync(f => f.ID == formId);

                if (form == null)
                {
                    errors.Fill(FailureCode.NotFound, $"Form with Id '{formId}' not found.");
                    return (false, null);
                }

                var formResponse = new FormResponse
                {
                    Id = Guid.NewGuid(),
                    FormId = formId,
                    SubmittedAt = DateTime.UtcNow
                };

                _context.FormResponses.Add(formResponse);

                foreach (var r in responses)
                {
                    if (!form.FormFields.Any(f => f.Name.Equals(r.Key, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    var fieldResponse = new FormFieldResponse
                    {
                        Id = Guid.NewGuid(),
                        FormResponseId = formResponse.Id,
                        FieldName = r.Key,
                        Value = r.Value
                    };
                    _context.FormFieldResponses.Add(fieldResponse);
                }

                await _context.SaveChangesAsync();
                return (true, formResponse.Id);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error submitting form response: {ex.Message}");
                return (false, null);
            }
        }
    }
}
