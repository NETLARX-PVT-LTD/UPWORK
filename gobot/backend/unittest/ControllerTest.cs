using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Netlarx.Products.Gobot.Controllers;
using Netlarx.Products.Gobot.Db;
using Netlarx.Products.Gobot.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace gobotUnitTest
{
    public class UnitTest1
    {
        private readonly ComponentsController _controller;
        private readonly StoryController _stController;
        private readonly BotDbContext _db;

        public UnitTest1() {
             // Setup in-memory database
            var options = new DbContextOptionsBuilder<BotDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _db = new BotDbContext(options);

            // Mock logger
            var loggerMock = new Mock<ILogger<ComponentsController>>();
            var stloggerMock = new Mock<ILogger<StoryController>>();

            _controller = new ComponentsController(_db, loggerMock.Object);
            _stController = new StoryController(_db, stloggerMock.Object);
        }

        [Fact]
        public async Task AllStories()
        {
            // Arrange
            _db.Stories.Add(new Stories { Name = "Story1" });
            _db.Stories.Add(new Stories { Name = "Story2" });
            await _db.SaveChangesAsync();

            // Act
            var result = await _controller.AllStories();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var stories = Assert.IsType<List<Stories>>(okResult.Value);
            Assert.Equal(2, stories.Count);
        }

        [Fact]
        public async Task AddStories()
        {
            // Arrange
            var story = new Stories { Name = "Test Story" };

            // Act
            var result = await _controller.AddStory(story);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            // Use reflection to access 'message' and 'storyId'
            var messageProp = okResult.Value.GetType().GetProperty("message");
            var storyIdProp = okResult.Value.GetType().GetProperty("storyId");

            var message = messageProp.GetValue(okResult.Value) as string;
            var storyId = (int)storyIdProp.GetValue(okResult.Value);

            Assert.Equal("Story created", message);
            Assert.True(storyId > 0); // Ensure story ID is assigned
        }

        [Fact]
        public void AddUserInputPhrase()
        {
            // Arrange
            int storyId = 1;
            var story = new Stories { ID = storyId, Name = "Test Story" };
            _db.Stories.Add(story);
            _db.SaveChanges();

            var model = new UserInputPhrase
            {
                json = "Hello, how are you?"   // example property
            };

            // Act
            var result = _controller.AddUserInputPhrase(storyId, model);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");
            var storyIdProp = value.GetType().GetProperty("storyId");
            var sessionDataProp = value.GetType().GetProperty("sessionData");

            var message = messageProp.GetValue(value) as string;
            var returnedStoryId = (int)storyIdProp.GetValue(value);
            var sessionData = sessionDataProp.GetValue(value);

            Assert.Equal("UserInputPhrase added in memory", message);
            Assert.Equal(storyId, returnedStoryId);
        }

        [Fact]
        public void AddUserInputKeyword()
        {
            // Arrange
            int storyId = 2;
            var story = new Stories { ID = storyId, Name = "Aishwary_story" };
            _db.Stories.Add(story);
            _db.SaveChanges();

            var model = new UserInputKeyword
            {
                StoryId = storyId,
                json = "Hello, Namste"
            };
            // Act

            var result = _controller.AddUserInputKeyword(storyId, model);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value    = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");
            var storyIdProp = value.GetType().GetProperty("storyId");
            var sessionDataProp = value.GetType().GetProperty("sessionData");

            var message = messageProp.GetValue(value) as string;
            var returnedStoryId = (int)storyIdProp.GetValue(value);
            var sessionData = sessionDataProp.GetValue(value);

            Assert.Equal("UserInputKeyword added in memory", message);
            Assert.Equal(storyId, returnedStoryId);
        }

        [Fact]
        public void AddUserInputTypeAnything()
        {
            // Arrange
            int storyId = 1;
            var story = new Stories { ID = storyId, Name = "New Story" };
            _db.Stories.Add(story);
            _db.SaveChanges();
            var model = new UserInputTypeAnything
            {
                StoryId = storyId,
                json = "Hey i am doing work on C#"
            };
            // Act
            var result = _controller.AddUserInputAnything(storyId, model);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");
            var storyIdProp = value.GetType().GetProperty("storyId");
            var sessionDataProp = value.GetType().GetProperty("sessionData");

            var message = messageProp.GetValue(value);
            var returnedStoryId = storyIdProp.GetValue(value);
            var sessionData = sessionDataProp.GetValue(value);

            Assert.Equal("UserInputTypeAnything added in memory", message);
            Assert.Equal(storyId, returnedStoryId);
        }

        [Fact]
        public async Task SaveAllStory()
        {
            // Arrange
            var session = new StorySessionData
            {
                Phrases = new List<UserInputPhrase>
                {
                    new UserInputPhrase { StoryId = 1, json = "Hii, Problem in Testing"},
                    new UserInputPhrase { StoryId = 1, json = "Hello, i have problem in Deployement"}
                },

                Keywords = new List<UserInputKeyword>
                {
                    new UserInputKeyword { StoryId = 1, json = "Hii, Hello"},
                    new UserInputKeyword { StoryId = 1, json = "Namaste"}
                },

                Anythings = new List<UserInputTypeAnything>
                {
                    new UserInputTypeAnything { StoryId = 1, json="Problem in json"},
                    new UserInputTypeAnything { StoryId = 1, json="Deployement Problem"}
                },

                Connections = new List<Connection>
                {
                    new Connection { ID = Guid.NewGuid(), StoryId = 1 },
                    new Connection { ID = Guid.NewGuid(), StoryId = 1 }
                },

                Story = new Stories
                {
                    ID = 1,
                    Name = "Sample Story"
                }
            };

            // Act
            var result = await _controller.SaveStoryToDb(session);

            // Assert 
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");

            var message = messageProp.GetValue(value) as string;

            Assert.Equal("Story saved to DB", message);
        }
        
        [Fact]
        public async Task GetStoryById_ReturnsStorySchema()
        {
            // Arrange
            int storyId = 1;

            // Add a story
            var story = new Stories { ID = storyId, Name = "Test Story" };
            _db.Stories.Add(story);

            // Add a UserInputPhrase component
            var phrase = new UserInputPhrase
            {
                ID = Guid.NewGuid(),
                StoryId = storyId,
                json = "Hello world",
                ToComponentType = null,
                ToComponentId = null
            };
            _db.UserInputPhrase.Add(phrase);

            // Add a Connection pointing to the phrase
            var connection = new Connection
            {
                ID = Guid.NewGuid(),
                StoryId = storyId,
                FromComponentType = ComponentTypes.UserInputPhrase,
                FromComponentId = phrase.ID
            };
            _db.Connection.Add(connection);

            await _db.SaveChangesAsync();

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