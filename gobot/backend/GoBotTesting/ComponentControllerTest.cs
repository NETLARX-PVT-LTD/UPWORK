// ---------------------------------------------------------------------
// <copyright file="ComponentControllerTest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.UnitTest
{
    using Chatbot;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using Moq;
    using Moq.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Controllers;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Services;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Xunit;

    public class ComponentControllerTest
    {
        private readonly ComponentsController _controller;
        private readonly Mock<IBotDbContext> _db; // Mocked DbContext
        private readonly Mock<StorySessionManager> storysessionmanager;
        TypingDelayBlock typingDelayBlock = new TypingDelayBlock();

        public ComponentControllerTest()
        {

            _db = new Mock<IBotDbContext>();


            // Mock logger
            var loggerMock = new Mock<ILogger<ComponentsController>>();
            storysessionmanager = new Mock<StorySessionManager>();

            _controller = new ComponentsController(_db.Object, loggerMock.Object, storysessionmanager.Object);
        }

        [Fact]
        public async Task AddStories()
        {
            // Arrange
            var story = new Stories { ID = 1, Name = "Test Story" };
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));

            // Act
            var result = await _controller.AddStory(story);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            var messageProp = okResult.Value.GetType().GetProperty("message");
            var storyIdProp = okResult.Value.GetType().GetProperty("storyId");

            var message = messageProp.GetValue(okResult.Value) as string;
            var storyId = (int)storyIdProp.GetValue(okResult.Value);

            Assert.Equal("Story created", message);
            Assert.True(storyId > 0); // Ensure story ID is assigned
        }

        [Fact]
        public async Task AllStories()
        {
            // Arrange
            var stories = new List<Stories> { new Stories {  ID = 1,Name = "Aishwary_Story" }, new Stories { ID = 2, Name = "Asjsjsjsjs" } };
            _db.Setup(x => x.Stories).ReturnsDbSet(stories);


            // Act
            var result = await _controller.AllStories();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<Stories>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public void AddUserInputPhrase()
        {
            // Arrange
            int storyId = 1;
            var story = new Stories { ID = storyId, Name = "Test Story" };
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));
            _db.Setup(x => x.SaveChanges()).Returns(1);

            //var model = new UserInputPhrase
            //{
            //     = "Hello, how are you?"   // example property
            //};
            UserInputBlock userInputBlock = new UserInputBlock();
            userInputBlock.CustomMessage = "Hey i am doing work on C#";
            userInputBlock.Type = "UserInput";
            userInputBlock.SubType = UserInputSubType.Phrase;

            // Act
            var result = _controller.AddUserInputPhrase(storyId, userInputBlock);

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
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));
            _db.Setup(x => x.SaveChanges()).Returns(1);

            //var model = new UserInputKeyword
            //{
            //    StoryId = storyId,
            //    json = "Hello, Namste"
            //};
            List<String> list = new List<string>();
            list.Add("Hii");
            list.Add("hello");
            UserInputBlock userInputBlock = new UserInputBlock();
            userInputBlock.Type = "UserInput";
            userInputBlock.SubType = UserInputSubType.Keyword;
            // Act

            var result = _controller.AddUserInputKeyword(storyId, userInputBlock);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

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
            int storyId = 2;
            var story = new Stories { ID = storyId, Name = "New Story" };
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));
            _db.Setup(x => x.SaveChanges()).Returns(1);

            //var model = new UserInputTypeAnything
            //{
            //    StoryId = storyId,
            //    json = "Hey i am doing work on C#"
            //};
            //List<String> list = new List<string>();
            //list.Add("Hii");
            //list.Add("hello");
            UserInputBlock userInputBlock = new UserInputBlock();
            userInputBlock.CustomMessage = "Hey i am doing work on C#";
            userInputBlock.Type = "UserInput";
            userInputBlock.SubType = UserInputSubType.Anythin;
            // Act
            var result = _controller.AddUserInputAnything(storyId, userInputBlock);

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
        public void addTypingDelay()
        {
            int storyId = 1;
            var story = new Stories { ID = storyId, Name = "New Story" };
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));
            _db.Setup(x => x.SaveChanges()).Returns(1);

            //var model = new TypingDelay
            //{
            //    StoryId = storyId,
            //    DelaySeconds = 2
            //};

            TypingDelayBlock block = new TypingDelayBlock();

            block.DelaySeconds = 1;
            block.Type = "typingDelay";

            // Act
            var result = _controller.AddTypingDelay(storyId, block);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");
            var storyIdProp = value.GetType().GetProperty("storyId");
            var sessionDataProp = value.GetType().GetProperty("sessionData");

            var message = messageProp.GetValue(value);
            var returnedStoryId = storyIdProp.GetValue(value);
            var sessionData = sessionDataProp.GetValue(value);

            Assert.Equal("typingDelay added in memory", message);
            Assert.Equal(storyId, returnedStoryId);
        }

        [Fact]
        public void addLinkStory()
        {
            int storyId = 1;
            var story = new Stories { ID = storyId, Name = "New Story" };
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));
            _db.Setup(x => x.SaveChanges()).Returns(1);

            //var model = new LinkStory
            //{
            //    StoryId = storyId,
            //    LinkStoryId = "4",
            //    LinkStoryName = "Ashutosh"
            //};

            LinkStoryBlock block = new LinkStoryBlock();

            block.LinkStoryName = "Ashutosh";
            block.Type = "linkStory";
            block.LinkStoryId = "123";
            // Act
            var result = _controller.AddLinkStory(storyId, block);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");
            var storyIdProp = value.GetType().GetProperty("storyId");
            var sessionDataProp = value.GetType().GetProperty("sessionData");

            var message = messageProp.GetValue(value);
            var returnedStoryId = storyIdProp.GetValue(value);
            var sessionData = sessionDataProp.GetValue(value);

            Assert.Equal("linkStory added in memory", message);
            Assert.Equal(storyId, returnedStoryId);
        }

        //[Fact]
        //public void addConversationalForm()
        //{
        //    int storyId = 1;
        //    var story = new Stories { ID = storyId, Name = "New Story" };
        //    _db.Setup(x => x.addStory(It.IsAny<Stories>()));
        //    _db.Setup(x => x.SaveChanges()).Returns(1);

        //    var model = new ConversationalForm
        //    {
        //        StoryId = storyId
        //    };

        //    //TypingDelayBlock block = new TypingDelayBlock();

        //    //block.DelaySeconds = 1;
        //    //block.Type = "typingDelay";

        //    // Act
        //    var result = _controller.AddConversationalForm(storyId, model);

        //    // Assert
        //    var okResult = Assert.IsType<OkObjectResult>(result);
        //    var value = okResult.Value;

        //    var messageProp = value.GetType().GetProperty("message");
        //    var storyIdProp = value.GetType().GetProperty("storyId");
        //    var sessionDataProp = value.GetType().GetProperty("sessionData");

        //    var message = messageProp.GetValue(value);
        //    var returnedStoryId = storyIdProp.GetValue(value);
        //    var sessionData = sessionDataProp.GetValue(value);

        //    Assert.Equal("conversationalForm added in memory", message);
        //    Assert.Equal(storyId, returnedStoryId);
        //}

        [Fact]
        public void addJsonAPI()
        {
            int storyId = 1;
            var story = new Stories { ID = storyId, Name = "New Story" };
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));
            _db.Setup(x => x.SaveChanges()).Returns(1);

            //var model = new JsonAPI
            //{
            //    StoryId = storyId,
            //    ApiEndpoint = "https://localhost:4200",
            //    RequestType = "Post",
            //    //ApiHeaders = new List<ApiHeader>()
            //};

            //JsonApiBlock block = new JsonApiBlock();
            var block = new JsonApiBlock
            {
                StoryId = storyId,
                Type = "jsonApi",
                ApiEndpoint = "https://localhost:4200",
                RequestType = "POST",
                ApiHeaders =
            {
                new ApiHeaderr { JsonId = 101, HeaderKey = "Authorization", HeaderValue = "Bearer token" },
                new ApiHeaderr { JsonId = 102, HeaderKey = "Content-Type", HeaderValue = "application/json" }
            }
            };


            // Act
            var result = _controller.AddJsonApi(storyId, block);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");
            var storyIdProp = value.GetType().GetProperty("storyId");
            var sessionDataProp = value.GetType().GetProperty("sessionData");

            var message = messageProp.GetValue(value);
            var returnedStoryId = storyIdProp.GetValue(value);
            var sessionData = sessionDataProp.GetValue(value);

            Assert.Equal("jsonAPI added in memory", message);
            Assert.Equal(storyId, returnedStoryId);
        }

        [Fact]
        public void addTextResponse()
        {
            int storyId = 1;
            var story = new Stories { ID = storyId, Name = "New Story" };
            _db.Setup(x => x.addStory(It.IsAny<Stories>()));
            _db.Setup(x => x.SaveChanges()).Returns(1);

            //var model = new TextResponse
            //{
            //    StoryId = storyId,
            //    Content = "Done"
            //};

            TextResponseBlock block = new TextResponseBlock();

            //block. = storyId;
            block.Type = "textResponse";
            block.Content = "Done";

            // Act
            var result = _controller.AddTextResponse(storyId, block);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            var messageProp = value.GetType().GetProperty("message");
            var storyIdProp = value.GetType().GetProperty("storyId");
            var sessionDataProp = value.GetType().GetProperty("sessionData");

            var message = messageProp.GetValue(value);
            var returnedStoryId = storyIdProp.GetValue(value);
            var sessionData = sessionDataProp.GetValue(value);

            Assert.Equal("textResponse added in memory", message);
            Assert.Equal(storyId, returnedStoryId);
        }

        [Fact]
        public async Task GetTypingDelay_WhenFound()
        {
            // Arrange
            int storyId = 1;
            var typingDelays = new List<TypingDelay>
            {
                new TypingDelay { ID = Guid.NewGuid(), StoryId = storyId, DelaySeconds = 1000 },
                new TypingDelay { ID = Guid.NewGuid(), StoryId = storyId, DelaySeconds = 2000 }
            };

            _db.Setup(x => x.allTypingDelay(storyId)).ReturnsAsync(typingDelays);

            // Act
            var result = await _controller.GetTypingDelay(storyId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TypingDelay>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        
    }
}