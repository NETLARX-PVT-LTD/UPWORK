// ---------------------------------------------------------------------
// <copyright file="FormSubmission.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    public class FormSubmission
    {
        [Key]
        public Guid SubmissionId { get; set; }
        public Guid ConversationalFormId { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
