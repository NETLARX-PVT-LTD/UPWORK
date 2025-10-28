
namespace Netlarx.Products.Gobot.Validation
{
    using Chatbot;
    using Gobot.Errors;
    using System;
    using System.Linq;
    public static class AiAssistantValidation
    {
        public static Errors? AssistantValidate(AiAssistantBlock request)
        {
            var errors = new Errors();

            if (request == null)
            {
                errors.Fill(FailureCode.ValidationError, "Request object cannot be null.");
                return errors;
            }

            if (string.IsNullOrWhiteSpace(request.AssistantName))
            {
                return new Errors(FailureCode.ValidationError, "Assistant Name is required.");
            }

            if (string.IsNullOrWhiteSpace(request.ApiKey))
            {
                return new Errors(FailureCode.ValidationError, "API Key is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Platform))
            {
                return new Errors(FailureCode.ValidationError, "Platform is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Model))
            {
                return new Errors(FailureCode.ValidationError, "Model is required.");
            }

            if (request.MaxToken < 100 || request.MaxToken > 2000)
            {
                return new Errors(FailureCode.ValidationError, "MaxToken must be between 100 and 2000.");
            }

            if (request.Temperature < 0 || request.Temperature > 0.7)
            {
                return new Errors(FailureCode.ValidationError, "Temperature must be between 0 and 0.7.");
            }

            if (request.TopP < 0 || request.TopP > 0.4)
            {
                return new Errors(FailureCode.ValidationError, "TopP must be between 0 and 0.4.");
            }

            return null;
        }
        public static Errors? WebSiteBlockValidate(WebsiteDataBlock dto)
        {
            var errors = new Errors();

            if (dto == null)
            {
                errors.Fill(FailureCode.BadRequest, "Website data cannot be null.");
                return errors;
            }

            if (string.IsNullOrWhiteSpace(dto.Url))
            {
                errors.Fill(FailureCode.BadRequest, "Website URL is required.");
                return errors;
            }

            if (!Uri.TryCreate(dto.Url, UriKind.Absolute, out _))
            {
                errors.Fill(FailureCode.BadRequest, "Invalid website URL format.");
                return errors;
            }

            if (string.IsNullOrWhiteSpace(dto.AssistantId))
            {
                errors.Fill(FailureCode.BadRequest, "Assistant ID is required.");
                return errors;
            }

            if (dto.MaxPages < 0)
            {
                errors.Fill(FailureCode.BadRequest, "MaxPages cannot be negative.");
                return errors;
            }

            if (dto.MaxDepth < 0)
            {
                errors.Fill(FailureCode.BadRequest, "MaxDepth cannot be negative.");
                return errors;
            }

            return  null;
        }
    }
}
