using BotsifySchemaTest.Models;
using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
{
    public class TypingDelay : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }

        public double delaySeconds { get; set; }
    }
}
