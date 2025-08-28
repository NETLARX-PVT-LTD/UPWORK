using BotsifySchemaTest.Models;
using GoBootBackend.Models;
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
        public DbSet<TypingDelay> TypingDelay { get; set; }

        public DbSet<ConversationalForm> ConversationalForm { get; set; }

        public DbSet<JsonAPI> JsonAPI { get; set; }

        public DbSet<TextResponse> TextResponse { get; set; }

        public DbSet<LinkStory> LinkStory { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Stories>().ToTable("Stories");
            modelBuilder.Entity<UserInputPhrase>().ToTable("UserInputPhrase");
            modelBuilder.Entity<UserInputKeyword>().ToTable("UserInputKeyword");
            modelBuilder.Entity<UserInputTypeAnything>().ToTable("UserInputTypeAnything");
            modelBuilder.Entity<Connection>().ToTable("Connection");
            modelBuilder.Entity<JsonAPI>().ToTable("JsonAPI");
            modelBuilder.Entity<LinkStory>().ToTable("LinkStory");
            modelBuilder.Entity<ConversationalForm>().ToTable("CoversationalForm");
            modelBuilder.Entity<TextResponse>().ToTable("TextResponse");
            modelBuilder.Entity<TypingDelay>().ToTable("TypingDelay");
            modelBuilder.Entity<TextResponse>(entity =>
            {
                entity.OwnsMany(tr => tr.QuickReplies);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
