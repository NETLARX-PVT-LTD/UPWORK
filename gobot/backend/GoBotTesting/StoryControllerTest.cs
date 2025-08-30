using BotsifySchemaTest.Controllers;
using BotsifySchemaTest.Db;
using BotsifySchemaTest.Models;
using GoBootBackend.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoBotTesting
{
    public class StudentControllerTest
    {
        private readonly StoryController _stController;
        private readonly Mock<IBotDbContext> _db;
        public StudentControllerTest()
        {
            // 1. Mock DbContext
            _db = new Mock<IBotDbContext>();


            var loggerMock = new Mock<ILogger<ComponentsController>>();
            var stloggerMock = new Mock<ILogger<StoryController>>();

            _stController = new StoryController(_db.Object, stloggerMock.Object);
        }

        [Fact]
        public async Task GetStoryById_ReturnsStorySchema()
        {
            // Arrange
            int storyId = 1;
            Guid rootblockId = Guid.NewGuid();

            // Add a story
            var story = new Stories { 
                ID = storyId, 
                Name = "Test Story",
                RootBlockConnectionId = rootblockId
            };
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));
            _db.Setup(x => x.Stories).ReturnsDbSet(new List<Stories> { story });

            // Add a UserInputPhrase component
            var phrase = new UserInputPhrase
            {
                ID = Guid.NewGuid(),
                StoryId = storyId,
                json = "Hello world",
                ToComponentType = null,
                ToComponentId = null
            };
            _db.Setup(x => x.UserInputPhrase).ReturnsDbSet(new List<UserInputPhrase> { phrase });

            // Add a Connection pointing to the phrase
            var connection = new Connection
            {
                ID = rootblockId,
                StoryId = storyId,
                FromComponentType = ComponentTypes.UserInputPhrase,
                FromComponentId = phrase.ID
            };
            _db.Setup(x => x.Connection).ReturnsDbSet(new List<Connection> { connection });

            _db.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

            // Act
            var result = await _stController.GetAllStorySchemaById(storyId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");
            var storyIdProp = value.GetType().GetProperty("storyId");
            var componentProp = value.GetType().GetProperty("components");

            var message = messageProp.GetValue(value) as string;
            var returnedStoryId = (int)storyIdProp.GetValue(value);
            var components = componentProp.GetValue(value) as List<object>;

            Assert.Equal("Story schema fetched successfully", message);
            Assert.Equal(storyId, returnedStoryId);
            Assert.Single(components); // we added one phrase
        }

    }
}
