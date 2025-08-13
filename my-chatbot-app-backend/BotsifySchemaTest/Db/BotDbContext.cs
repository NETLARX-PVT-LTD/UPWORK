using BotsifySchemaTest.Models;
using Microsoft.EntityFrameworkCore;

namespace BotsifySchemaTest.Db
{
    public class BotDbContext : DbContext
    {
        public BotDbContext(DbContextOptions<BotDbContext> options) : base(options) { }

        public DbSet<Stories> Stories { get; set; }
        public DbSet<UserInputPhrase> UserInputPhrase { get; set; }
        public DbSet<UserInputKeyword> UserInputKeyword { get; set; }
        public DbSet<UserInputTypeAnything> UserInputTypeAnything { get; set; }
        public DbSet<Connection> Connection { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Stories>().ToTable("Stories");
            modelBuilder.Entity<UserInputPhrase>().ToTable("UserInputPhrase");
            modelBuilder.Entity<UserInputKeyword>().ToTable("UserInputKeyword");
            modelBuilder.Entity<UserInputTypeAnything>().ToTable("UserInputTypeAnything");
            modelBuilder.Entity<Connection>().ToTable("Connection");

            base.OnModelCreating(modelBuilder);
        }
    }
}
