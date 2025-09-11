
using System;

namespace Netlarx.Products.Gobot.Models
{
    public class ImageSlideblock
    {
        /// <summary>
        /// Primary Key for the ImageSlide in the database.
        /// </summary>
        public Guid Id { get; set; }

        // Properties from the ImageSlide proto message
        public string Url { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        /// <summary>
        /// Foreign Key linking this slide to its parent Media component.
        /// </summary>
        public Guid MediaId { get; set; }
        public virtual Media Media { get; set; }
    }
}