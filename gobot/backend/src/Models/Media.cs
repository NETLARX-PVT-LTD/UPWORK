
using Chatbot;
using System;
using System.Collections.Generic;

namespace Netlarx.Products.Gobot.Models
{
    public class Media : BaseComponent
    {
        /// <summary>
        /// The Primary Key for the Media component in the database.
        /// </summary>
        //public Guid ID { get; set; }

        /// <summary>
        /// Foreign Key linking this component to a Story.
        /// </summary>
        public int StoryId { get; set; }

        // Properties from the MediaBlock proto message
        public string MediaId { get; set; }
        public MediaTypeblock MediaType { get; set; }
        public string SingleImageUrl { get; set; }
        public string VideoUrl { get; set; }
        public string AudioUrl { get; set; }
        public string FileUrl { get; set; }
        public string MediaName { get; set; }

        // Button properties that are directly on the MediaBlock
        public string ButtonTitle { get; set; }
        public string ButtonTextMessage { get; set; }
        public string ButtonType { get; set; }
        public string ButtonLinkedMediaId { get; set; }
        public string ButtonUrl { get; set; }
        // ... all other properties are correct ...

        /// <summary>
        /// This must be a collection of the DATABASE model, not the API model.
        /// </summary>
        public virtual ICollection<ImageSlideblock> Slides { get; set; } = new List<ImageSlideblock>();

        /// <summary>
        /// This must also be a collection of the DATABASE model.
        /// </summary>
        public virtual ICollection<Buttonblock> Buttons { get; set; } = new List<Buttonblock>();
    }
}