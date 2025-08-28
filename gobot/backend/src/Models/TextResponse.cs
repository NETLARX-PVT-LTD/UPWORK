using BotsifySchemaTest.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
{
    public class QuickReply : BaseComponent
    {
        [Key]
        public int TestReponseId { get; set; }
        public string Title { get; set; }
        public string Value { get; set; }
    }

    public class TextResponse : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }
        public string Type { get; set; } // "textResponse"
        public string Content { get; set; }
        public List<string> AlternateResponses { get; set; }
        public List<QuickReply> QuickReplies { get; set; }
    }
}
