// ---------------------------------------------------------------------
// <copyright file="AiAssistant.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------


namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class AiAssistant
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string AssistantName { get; set; } = null!;

        [Required]
        public string ApiKey { get; set; } = null!;

        [Required]
        public string Plateform { get; set; } // OpenAPI, Gemini, openRouter

        public string Instruction { get; set; } = null!;

            // Model
        public string Model { get; set; } // GPT, Gemini, GPT Pro
            // Source
        public string source { get; set; } // my content 

            // Fallback
        public string FallbackTextMessage { get; set; }
        public int FallbackStory { get; set; }

            // Advanced tokens
        public int MaxToken { get; set; }
        public double Temperature { get; set; }
        public double TopP { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<TrainingFile> TrainingFiles { get; set; } = new List<TrainingFile>();
    }

}