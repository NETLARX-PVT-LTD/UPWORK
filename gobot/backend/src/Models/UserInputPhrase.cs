using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
{
    public class UserInputPhrase : BaseComponent
    {
      
        [Required]
        public int StoryId { get; set; }

        public string? json { get; set; }

    }
}
