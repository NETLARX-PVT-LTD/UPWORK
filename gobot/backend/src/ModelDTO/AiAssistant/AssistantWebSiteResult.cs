
namespace Netlarx.Products.Gobot.ModelDTO.AIAssistant
{
    using Gobot.Errors;
    using Gobot.Result;
    using System;
    public class AssistantWebSiteResult : Result
    {
        public AssistantWebSiteResult(bool success, string statusCode, Guid websiteId, Errors? error = null)
            : base(success, error, statusCode)
        {
            WebsiteId = websiteId;
        }
        public Guid WebsiteId { get; set; }
    }
}
