using BotsifySchemaTest.Db;
using BotsifySchemaTest.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel;
using System.Linq.Expressions;

namespace BotsifySchemaTest.Controllers
{
    public class StoryController : Controller
    {
        private readonly BotDbContext _context;

        public StoryController(BotDbContext context)
        {
            _context = context;
        }

        [HttpGet("{storyId}")]
        public async Task<IActionResult> GetStoryChain(int storyId)
        {
            var result = new List<object>();

            var connection = await _context.Connection
                .FirstOrDefaultAsync(c => c.StoryId == storyId);

            if (connection == null)
                return NotFound($"No connection found for StoryId {storyId}");

            string currentType = connection.FromComponentType;
            Guid currentId = connection.FromComponentId;

            while (!string.IsNullOrEmpty(currentType))
            {
                string? nextType = null;
                Guid? nextId = null;

                if (currentType == ComponentTypes.UserInputPhrase)
                {
                    var data = await _context.UserInputPhrase.FirstOrDefaultAsync(u => u.ID == currentId);
                    if (data == null) break;
                    result.Add(data);
                    nextType = data.ToComponentType;
                    nextId = data.ToComponentId;
                }
                else if (currentType == ComponentTypes.UserInputKeyword)
                {
                    var data = await _context.UserInputKeyword.FirstOrDefaultAsync(u => u.ID == currentId);
                    if (data == null) break;
                    result.Add(data);
                    nextType = data.ToComponentType;
                    nextId = data.ToComponentId;
                }
                else if (currentType == ComponentTypes.UserInputTypeAnything)
                {
                    var data = await _context.UserInputTypeAnything.FirstOrDefaultAsync(u => u.ID == currentId);
                    if (data == null) break;
                    result.Add(data);
                    nextType = data.ToComponentType;
                    nextId = data.ToComponentId;
                }

                if (string.IsNullOrEmpty(nextType) || nextId == null)
                    break;

                currentType = nextType;
                currentId = nextId.Value;
            }

            return View("GetStoryChain", result);
        }
    }

}
