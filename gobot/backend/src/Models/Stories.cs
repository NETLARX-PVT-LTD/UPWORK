using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BotsifySchemaTest.Models
{
    public class Stories
    {
        public int ID { get; set; }

        [Required]
        public string? Name { get; set; }

        public Guid RootBlockConnectionId { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation property for related TypingDelays
        public ICollection<TypingDelay> TypingDelays { get; set; } = new List<TypingDelay>();
    }
}
