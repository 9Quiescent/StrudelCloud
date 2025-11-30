using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StrudelWebApp.Data;
using StrudelWebApp.Models;

namespace StrudelWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StrudelPresetController : ControllerBase
    {
        private readonly AppDbContext _db;

        public StrudelPresetController(AppDbContext db)
        {
            _db = db;
        }

        // POST: /api/StrudelPreset
        // I'll use this for the save button
        [HttpPost]
        public async Task<IActionResult> Save([FromBody] SavePresetDto dto) //react app should post data consisting of name, song, controls, raw and such in JSON form
        {
            if (!ModelState.IsValid) //so if we dont adhere to that structure with the passed in dto from the request body 
            {
                return BadRequest(ModelState);//return a bad request
            }

            var preset = new StrudelPreset //otherwise, create a new StrudelPreset object and map the appropriate properties to data from the dto
            {
                Name = dto.Name,
                RawCode = dto.Raw,
                ControlsJson = dto.ControlsJson,
                CreatedAt = DateTime.UtcNow
            };

            _db.StrudelPresets.Add(preset); // create an entry using that new object
            await _db.SaveChangesAsync(); // wait for everything to apply properly

            return Ok(); // Then say everything went wall
        }

        // GET: /api/StrudelPreset
        // Returns a list consisting of all of our currently existing presets, i'll use this for the load button
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.StrudelPresets //grab all of the entries from our StrudelPresets relation
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.CreatedAt
                })
                .ToListAsync();

            return Ok(list);
        }

        // GET: /api/StrudelPreset/search?q=default
        // Returns presets whose name contains the given search term
        [HttpGet("search")]
        public async Task<IActionResult> SearchByName([FromQuery] string q)
        {
            // if no term is provided, just fall back to the same list as GetAll
            if (string.IsNullOrWhiteSpace(q))
            {
                var all = await _db.StrudelPresets
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.CreatedAt
                    })
                    .ToListAsync();

                return Ok(all);
            }

            var term = q.Trim();
            var results = await _db.StrudelPresets
                .Where(p => p.Name.Contains(term)) 
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.CreatedAt
                })
                .ToListAsync();

            return Ok(results);
        }
    }

    // DTO for JSON body pased in from react app
    public class SavePresetDto
    {
        public string Name { get; set; } = string.Empty;
        public string Raw { get; set; } = string.Empty;
        public string ControlsJson { get; set; } = string.Empty;
    }
}
