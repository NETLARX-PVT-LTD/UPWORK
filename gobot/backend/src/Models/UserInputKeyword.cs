using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
{
    public class UserInputKeyword : BaseComponent
    {


        [Required]
        public int StoryId { get; set; }

        public string? json { get; set; }

        
    }
}
