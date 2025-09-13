// ---------------------------------------------------------------------
// <copyright file="FormFieldResponse.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class FormFieldResponse
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid FormResponseId { get; set; }
        [ForeignKey(nameof(FormResponseId))]
        public FormResponse FormResponse { get; set; }

        [Required]
        public string FieldName { get; set; }

        public string Value { get; set; }
    }
}
