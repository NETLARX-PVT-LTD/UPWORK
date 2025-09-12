// ---------------------------------------------------------------------
// <copyright file="TrainingFile.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class TrainingFile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string FileName { get; set; } = null!;

        [Required]
        public string FilePath { get; set; } = null!; // Server path to the file

        [Required]
        public Guid AssistantId { get; set; }

        [ForeignKey("AssistantId")]
        public AiAssistant Assistant { get; set; } = null!;
    }
}
