using Chatbot;
using Netlarx.Products.Gobot.Errors;

namespace Gobot.Validations
{
    public static class BotValidation
    {
        public static Errors? Validate(BotBlock? block)
        {
            var errors = new Errors();

            if (block == null)
            {
                errors.Fill(FailureCode.InvalidInput, "Request body cannot be null or invalid.");
                return errors;
            }

            if (string.IsNullOrWhiteSpace(block.BotName))
            {
                errors.Fill(FailureCode.ValidationError, "Bot name is required.");
                return errors;
            }


            if (string.IsNullOrWhiteSpace(block.Position))
            {
                errors.Fill(FailureCode.ValidationError, "Position is required.");
                return errors;
            }

            if (string.IsNullOrWhiteSpace(block.Size))
            {
                errors.Fill(FailureCode.ValidationError, "Size is required.");
                return errors;
            }

            if (block.Theme != null && string.IsNullOrWhiteSpace(block.Theme.PrimaryColor))
            {
                errors.Fill(FailureCode.ValidationError, "Theme primary color is required.");
                return errors;
            }

            if (block.LandingConfig != null)
            {
                if (string.IsNullOrWhiteSpace(block.LandingConfig.Title))
                {
                    errors.Fill(FailureCode.ValidationError, "LandingConfig title is required.");
                    return errors;
                }

                if (string.IsNullOrWhiteSpace(block.LandingConfig.Description))
                {
                    errors.Fill(FailureCode.ValidationError, "LandingConfig description is required.");
                    return errors;
                }
            }

            return null;
        }
    }
}
