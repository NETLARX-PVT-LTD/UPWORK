// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;

    public class Connection
    {
        public Guid ID { get; set; }

        public int StoryId { get; set; }

        public string FromComponentType { get; set; } = "";

        public Guid FromComponentId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
