// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

using System.Collections.Generic;

namespace Netlarx.Products.Gobot.Models
{
    public class FormField
    {
        public int FormFieldId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public bool Required { get; set; }
        public string PromptPhrase { get; set; }
        public List<string> Options { get; set; }
        public string OptionsText { get; set; }

        public Validation Rules { get; set; }

        public class Validation
        {
            public int validationId { get; set; }
            public int MinLength { get; set; }
            public int MaxLength { get; set; }
            public string Pattern { get; set; }
            public double Min { get; set; }
            public double Max { get; set; }
        }
    }

    public class ConversationalForm : BaseComponent
    {
        public int StoryId { get; set; }
        public string Type { get; set; } // e.g. "conversationalForm"
        public string FormId { get; set; }
        public string FormName { get; set; }
        public string WebhookUrl { get; set; }
        public bool SendEmailNotification { get; set; }
        public string NotificationEmail { get; set; }
        public List<FormField> FormFields { get; set; }
        public bool ShowAsInlineForm { get; set; }
        public bool RenderFormResponses { get; set; }
        public bool AllowMultipleSubmission { get; set; }
        public string MultipleSubmissionMessage { get; set; }
        public bool AllowExitForm { get; set; }
        public string ExitFormMessage { get; set; }
        public string SuccessResponseType { get; set; } // "textMessage" | "story"
        public string SuccessRedirectStoryId { get; set; }
        public bool ValidateEmail { get; set; }
        public bool ValidatePhone { get; set; }
        public bool SpamProtection { get; set; }
        public bool RequireCompletion { get; set; }
        public string SuccessMessage { get; set; }
        public string RedirectUrl { get; set; }
    }
}
