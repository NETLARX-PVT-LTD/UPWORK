// ---------------------------------------------------------------------
// <copyright file="AiService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Validation
{
    using Chatbot;
    using Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.AiAssistant;
    using Netlaxr.Products.Gobot.ModelDTO.AiAssistant;
    using System;
    public static class AiAssistantValidation
    {
        public static bool AssistantValidate(AiAssistantBlockRequest request,Errors errors)
        {
            if (request == null)
            {
                errors.Fill(FailureCode.ValidationError, "Request object cannot be null.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(request.AssistantName))
            {
                errors.Fill(FailureCode.ValidationError, "Assistant Name is required.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(request.ApiKey))
            {
                errors.Fill(FailureCode.ValidationError, "API Key is required.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(request.Platform))
            {
                errors.Fill(FailureCode.ValidationError, "Platform is required.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(request.Model))
            {
                errors.Fill(FailureCode.ValidationError, "Model is required.");
                return false;
            }

            if (request.MaxToken < 100 || request.MaxToken > 2000)
            {
                errors.Fill(FailureCode.ValidationError, "MaxToken must be between 100 and 2000.");
                return false;
            }

            if (request.Temperature < 0 || request.Temperature > 0.7)
            {
                errors.Fill(FailureCode.ValidationError, "Temperature must be between 0 and 0.7.");
                return false;
            }

            if (request.TopP < 0 || request.TopP > 0.4)
            {
                errors.Fill(FailureCode.ValidationError, "TopP must be between 0 and 0.4.");
                return false;
            }

            return true;
        }
        public static bool WebSiteBlockValidate(AiAssistantWebsiteRequest dto,Errors errors)
        {
            if (dto == null)
            {
                errors.Fill(FailureCode.BadRequest, "Website data cannot be null.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(dto.Url))
            {
                errors.Fill(FailureCode.BadRequest, "Website URL is required.");
                return false;
            }

            if (!Uri.TryCreate(dto.Url, UriKind.Absolute, out _))
            {
                errors.Fill(FailureCode.BadRequest, "Invalid website URL format.");
                return false;
            }

            if (string.IsNullOrWhiteSpace(dto.AssistantId))
            {
                errors.Fill(FailureCode.BadRequest, "Assistant ID is required.");
                return false;
            }

            if (dto.MaxPages < 0)
            {
                errors.Fill(FailureCode.BadRequest, "MaxPages cannot be negative.");
                return false;
            }

            if (dto.MaxDepth < 0)
            {
                errors.Fill(FailureCode.BadRequest, "MaxDepth cannot be negative.");
                return false;
            }

            return true;
        }
    }
}
