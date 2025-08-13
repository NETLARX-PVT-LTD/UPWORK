using BotsifySchemaTest.Db;
using BotsifySchemaTest.Hubs;
using BotsifySchemaTest.Models;
using BotsifySchemaTest.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BotsifySchemaTest.Controllers
{
    public class ComponentsController : Controller
    {
        private readonly BotDbContext _db;
        private readonly IHubContext<StoryHub> _hubContext;

        public ComponentsController(BotDbContext db, IHubContext<StoryHub> hubContext)
        {
            _db = db;
            _hubContext = hubContext;
        }

        [HttpGet]
        public IActionResult AddStory() => View();

        [HttpPost]
        public async Task<IActionResult> AddStory(Stories model)
        {
            if (!ModelState.IsValid) return View(model);

            model.CreatedDate = DateTime.UtcNow;
            _db.Stories.Add(model);
            await _db.SaveChangesAsync();

            TempData["Msg"] = "Story created";
            return RedirectToAction(nameof(AddStory));
        }

        [HttpGet]
        public IActionResult AddUserInputPhrase(int storyId)
        {
            ViewBag.Stories = new SelectList(_db.Stories, "ID", "Name", null);
            return View(new UserInputPhrase());
        }


        public IActionResult AddComponent<T>(int storyId, T model, string compType, Action<T> addToCollection) where T : BaseComponent
        {
            if (!ModelState.IsValid)
                return View(model);

            var session = StorySessionManager.GetStory(storyId);
            var componentId = Guid.NewGuid();

            if (session.Connections.Count == 0)
            {
                
                var connId = Guid.NewGuid();
                session.Connections.Add(new Connection
                {
                    ID = connId,
                    StoryId = storyId,
                    FromComponentType = compType,
                    FromComponentId = componentId,
                    CreatedDate = DateTime.UtcNow
                });

                session.Story.RootBlockConnectionId = connId;
            }
            else
            {
                // Link the last unlinked component to the new one
                var lastComponent = GetLastUnlinkedComponent(session);
                if (lastComponent != null)
                {
                    lastComponent.ToComponentType = compType;
                    lastComponent.ToComponentId = componentId;
                }

              
            }

            // Initialize model
            model.ID = componentId;
            model.CreatedDate = DateTime.UtcNow;
            model.ToComponentType = null;
            model.ToComponentId = null;

            // Add to the right collection
            addToCollection(model);

            // Notify UI
            _hubContext.Clients.Group($"story-{storyId}")
                .SendAsync("StoryUpdated", session);

            TempData["Msg"] = $"{compType} added in memory";
            return RedirectToAction("FinalJsonView");
        }

        private BaseComponent GetLastUnlinkedComponent(StorySessionData session)
        {
            return session.GetType()
                .GetProperties().Where(p => typeof(System.Collections.IEnumerable).IsAssignableFrom(p.PropertyType)
                            && p.PropertyType.IsGenericType
                            && typeof(BaseComponent).IsAssignableFrom(p.PropertyType.GetGenericArguments()[0]))
                .SelectMany(p => (IEnumerable<BaseComponent>)p.GetValue(session))
                .Where(c => c.ToComponentId == null)
                .LastOrDefault();
        }


        [HttpPost]
        public IActionResult AddUserInputPhrase(int storyId, UserInputPhrase model)
        {
            return AddComponent(storyId, model, ComponentTypes.UserInputPhrase,
                m => StorySessionManager.GetStory(storyId).Phrases.Add(m));
        }


        [HttpGet]
        public IActionResult AddUserInputKeyword()
        {
            ViewBag.Stories = new SelectList(_db.Stories, "ID", "Name", null);
            return View(new UserInputKeyword());
        }


        [HttpPost]
        public IActionResult AddUserInputKeyword(int storyId, UserInputKeyword model)
        {
            return AddComponent(storyId, model, ComponentTypes.UserInputKeyword,
                 g => StorySessionManager.GetStory(storyId).Keywords.Add(g));
        }

        [HttpGet]
        public IActionResult AddUserInputAnything()
        {
            ViewBag.Stories = new SelectList(_db.Stories, "ID", "Name", null);
            return View(new UserInputTypeAnything());
        }

        [HttpPost]
        public IActionResult AddUserInputAnything(int storyId,UserInputTypeAnything model)
        {
            return AddComponent(storyId, model, ComponentTypes.UserInputTypeAnything,
                  g => StorySessionManager.GetStory(storyId).Anythings.Add(g));
        }

        [HttpGet]
        public IActionResult FinalJsonView()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> AllStories()
        {
            var data = await _db.Stories.ToListAsync();
            return View(data);
        }

        [HttpPost]
        public async Task<IActionResult> SaveStoryToDb([FromBody] StorySessionData session)
        {
            if (session == null)
                return BadRequest("Invalid data");         

                if (session.Phrases != null)
                {
                   foreach (var phrase in session.Phrases)
                   {
                    
                    _db.UserInputPhrase.Add(phrase);
                   }
                }

            if (session.Keywords != null)
            {
                foreach (var keyword in session.Keywords)
                {
            
                    _db.UserInputKeyword.Add(keyword);
                }
            }

            if (session.Anythings != null)
            {
                foreach (var any in session.Anythings)
                {
              
                    _db.UserInputTypeAnything.Add(any);
                }
            }

            if (session.Connections != null)
            {
            
                foreach (var conn in session.Connections)
                {
                   
                    _db.Connection.Add(conn);
                }

            }
            if (session.Connections != null && session.Connections.Any())
            {
                var firstConnection = session.Connections.FirstOrDefault(); 

                if (firstConnection != null)
                {
                    var story = await _db.Stories.FirstOrDefaultAsync(s => s.ID == firstConnection.StoryId);
                    if (story != null)
                    {
                        story.RootBlockConnectionId = firstConnection.ID; 
                        _db.Stories.Update(story); 
                       
                    }
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Story saved to DB" });
        }

     

    }
}
