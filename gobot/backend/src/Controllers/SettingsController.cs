using GoBootBackend.Models;
using GoBootBackend.Models;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.Json;

namespace GoBootBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly string _settingsFilePath;

        public SettingsController()
        {
            // You can choose a different path to store the data
            _settingsFilePath = Path.Combine(Directory.GetCurrentDirectory(), "settings.json");
        }

        // GET: api/Settings
        [HttpGet]
        public IActionResult GetSettings()
        {                                                                                                                                     
            try
            {
                if (!System.IO.File.Exists(_settingsFilePath))
                {
                    // Return a default empty settings object if the file doesn't exist
                    return Ok(new AdvancedSettings());
                }

                var jsonString = System.IO.File.ReadAllText(_settingsFilePath);
                var settings = JsonSerializer.Deserialize<AdvancedSettings>(jsonString);
                return Ok(settings);
            }
            catch (Exception ex)
            {
                // In a real app, you would log this error.
                return StatusCode(500, "An error occurred while retrieving settings.");
            }
        }

        // POST: api/Settings
        [HttpPost]
        public IActionResult SaveSettings([FromBody] AdvancedSettings settings)
        {
            if (settings == null)
            {
                return BadRequest("Invalid settings data.");
            }

            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                var jsonString = JsonSerializer.Serialize(settings, options);

                // Save the settings to a file. For a real application, you would use a database.
                System.IO.File.WriteAllText(_settingsFilePath, jsonString);

                // Return a success response
                return Ok(new { message = "Settings saved successfully!" });
            }
            catch (Exception ex)
            {
                // In a real app, you would log this error.
                return StatusCode(500, "An error occurred while saving settings.");
            }
        }
    }
}