// ---------------------------------------------------------------------
// <copyright file="AiAssistantWebsiteRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlaxr.Products.Gobot.ModelDTO.AiAssistant
{
    public class AiAssistantWebsiteRequest
    {
            public string WebsiteType { get; set; }        
            public string AssistantId { get; set; }        
            public string Url { get; set; }                
            public bool AutoSync { get; set; }             
            public int MaxPages { get; set; }              
            public int MaxDepth { get; set; }              
            public bool IncludeSubdomains { get; set; }   
            public string ExcludePatterns { get; set; }    
            public string CssSelector { get; set; }       
            public bool RespectRobots { get; set; }   
    }
}

