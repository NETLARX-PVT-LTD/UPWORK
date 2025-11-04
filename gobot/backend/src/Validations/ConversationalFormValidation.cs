// ---------------------------------------------------------------------
// <copyright file="ConversationalFormValidation.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Validation
{
    using Chatbot;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.ConversationalForms;
    using System.Linq;

    public static class ConversationalFormValidation
    {
        public static bool ValidateConversationalForm(ConversationalFormRequest formDto, Errors errors)
        {
            if (formDto == null)
            {
                errors.Fill(FailureCode.InvalidInput, "Form data cannot be null.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(formDto.FormName))
            {
                errors.Fill(FailureCode.InvalidInput, "Form name is required.");
                return false;
            }

            if (formDto.FormFields == null || !formDto.FormFields.Any())
            {
                errors.Fill(FailureCode.InvalidInput, "Form must contain at least one field.");
                return false;
            }

            foreach (var field in formDto.FormFields)
            {
                if (string.IsNullOrWhiteSpace(field.Name))
                {
                    errors.Fill(FailureCode.InvalidInput, "Each form field must have a name.");
                    return false;
                }

                if (string.IsNullOrWhiteSpace(field.Type))
                {
                    errors.Fill(FailureCode.InvalidInput, $"Form field '{field.Name}' must have a type.");
                    return false;
                }

                if ((field.Type.ToLower() == "dropdown" || field.Type.ToLower() == "radio") &&
                    (field.Options == null || !field.Options.Any()))
                {
                    errors.Fill(FailureCode.InvalidInput, $"Form field '{field.Name}' requires options.");
                    return false;
                }
            }

            return true;
        }
    }
}
