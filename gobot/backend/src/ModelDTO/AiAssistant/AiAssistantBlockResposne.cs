// ---------------------------------------------------------------------
// <copyright file="AiAssistantBlockResposne.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.AiAssistant
{
    using System.Collections.Generic;

    public class AiAssistantBlockResposne
    {
        public string Id { get; set; }                   
        public string AssistantName { get; set; }         
        public string ApiKey { get; set; }           
        public string Platform { get; set; }             
        public string Instruction { get; set; }
        public string Model { get; set; }                
        public string Source { get; set; }                
        public string FallbackTextMessage { get; set; }  
        public int FallbackStory { get; set; }            
        public int MaxToken { get; set; }                
        public double Temperature { get; set; }         
        public double TopP { get; set; }                  
        public string CreatedAt { get; set; }          
        public List<TrainingFileBlock> TrainingFiles { get; set; } = new List<TrainingFileBlock>();
    }

    public class TrainingFileBlock
    {
        public string Id { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string AssistantId { get; set; }
    }
}
