using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
{
    public class UserInputTypeAnything : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }

        public string? json { get; set; }
    }
}
