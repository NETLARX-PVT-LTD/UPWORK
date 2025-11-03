// ---------------------------------------------------------------------
// <copyright file="StoryBlockdto.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    using System;

    public class StoryBlockdto
    {
        public int StoryId { get; set; }
        public string Name { get; set; }
        public string RootBlockConnectionId { get; set; } 
        public DateTime CreatedDate { get; set; }
        public string BotId { get; set; }
    }
}
