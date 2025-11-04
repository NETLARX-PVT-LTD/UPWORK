// ---------------------------------------------------------------------
// <copyright file="ConversationalFormRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

using System.Collections.Generic;

namespace Netlarx.Products.Gobot.ModelDTO.ConversationalForms
{
    public class ConversationalFormRequest
    {
        public string Type { get; set; } = "conversationalForm";  // always "conversationalForm"
        public string FormName { get; set; }
        public string WebhookUrl { get; set; }
        public bool SendEmailNotification { get; set; }
        public string NotificationEmail { get; set; }
        public bool ShowAsInlineForm { get; set; }
        public bool RenderFormResponses { get; set; }
        public bool AllowMultipleSubmission { get; set; }
        public string MultipleSubmissionMessage { get; set; }
        public bool AllowExitForm { get; set; }
        public string ExitFormMessage { get; set; }
        public string SuccessResponseType { get; set; } // "textMessage" | "story"
        public bool ValidateEmail { get; set; }
        public bool ValidatePhone { get; set; }
        public bool SpamProtection { get; set; }
        public bool RequireCompletion { get; set; }
        public string SuccessMessage { get; set; }
        public string RedirectUrl { get; set; }
        public string ToComponentType { get; set; }
        public string ToComponentId { get; set; }
        public int BotId { get; set; }
        public List<FormFieldRequest> FormFields { get; set; } = new List<FormFieldRequest>();
    }
    public class FormFieldRequest
    {
        public int FormFieldId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public bool Required { get; set; }
        public string PromptPhrase { get; set; }
        public List<string> Options { get; set; } = new List<string>();
        public string OptionsText { get; set; }
    }
}
