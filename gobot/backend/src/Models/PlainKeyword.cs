namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class PlainKeyword
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Value { get; set; }

        public Guid UserInputKeywordId { get; set; }

        [ForeignKey(nameof(UserInputKeywordId))]
        public UserInputKeyword UserInputKeyword { get; set; }
    }
}
