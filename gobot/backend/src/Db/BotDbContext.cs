using BotsifySchemaTest.Models;
using GoBootBackend.Models;
using Microsoft.EntityFrameworkCore;
using GoBootBackend.Interface;
using System.Threading.Tasks;
using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BotsifySchemaTest.Db
{
    public class BotDbContext : DbContext, IBotDbContext
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

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }

        public int SaveChanges()
        {
            return base.SaveChanges();
        }

        public void addStory(Stories model)
        {
            this.Stories.Add(model);
        }

        public void EntryAll<T>(T entity, T existing) where T : class
        {
            if (entity == null || existing == null)
                throw new ArgumentNullException("Entity or Existing entity is null.");

            var entry = this.Entry(existing);
            entry.CurrentValues.SetValues(entity);
        }

        public async Task<List<TypingDelay>> allTypingDelay(int storyId)
        {
            return await this.TypingDelay
                .Where(td => td.StoryId == storyId)   // ✅ filter by FK
                .ToListAsync();
        }
        public void addConnection(Connection connection)
        {
            this.Connection.Add(connection);
        }

        public void addUserInputPhrase(UserInputPhrase phrase)
        {
            this.UserInputPhrase.AddRange(phrase);
        }

        public void addUserInputKeyword(UserInputKeyword keyword)
        {
            this.UserInputKeyword.AddRange(keyword);
        }

        public void addUserInputAnything(UserInputTypeAnything anything)
        {
            this.UserInputTypeAnything.AddRange(anything);
        }

        public void addTypingDelay(TypingDelay delay)
        {
            this.TypingDelay.AddRange(delay);
        }

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
