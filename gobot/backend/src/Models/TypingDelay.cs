using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BotsifySchemaTest.Models
{
    public class TypingDelay : BaseComponent
    {
        [Required]
        //[ForeignKey("StoryId")]
        //public Stories? Story { get; set; }
        public int StoryId { get; set; }

        public double DelaySeconds { get; set; }

        // Navigation property (important for EF relationships)
    }
}
