// ---------------------------------------------------------------------
// <copyright file="FormFieldResponse.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class FormResponse
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid FormId { get; set; }
        [ForeignKey(nameof(FormId))]
        public ConversationalForm Form { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Store raw response or structured field responses
        public ICollection<FormFieldResponse> FieldResponses { get; set; } = new List<FormFieldResponse>();
    }
}
