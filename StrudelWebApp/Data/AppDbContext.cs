using Microsoft.EntityFrameworkCore;
using StrudelWebApp.Models;

namespace StrudelWebApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<StrudelPreset> StrudelPresets { get; set; }
    }
}
