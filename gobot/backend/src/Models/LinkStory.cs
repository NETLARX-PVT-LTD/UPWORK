using BotsifySchemaTest.Models;
using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
{
    public class LinkStory : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }
        public string Type { get; set; } // "linkStory"
        public string LinkStoryId { get; set; }
        public string LinkStoryName { get; set; }
    }
}
