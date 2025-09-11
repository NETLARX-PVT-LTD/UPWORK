// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db
{
    using Microsoft.EntityFrameworkCore;
    using System.Threading.Tasks;
    using System.Threading;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models;

    public class BotDbContext : DbContext, IBotDbContext
    {
        public BotDbContext(DbContextOptions<BotDbContext> options) : base(options) { }

        public DbSet<Bot> Bots { get; set; }
        public DbSet<Stories> Stories { get; set; }
        public DbSet<UserInputPhrase> UserInputPhrases { get; set; }
        public DbSet<UserInputKeyword> UserInputKeywords { get; set; }
        public DbSet<UserInputTypeAnything> UserInputTypeAnythings { get; set; }
        public DbSet<KeywordGroupp> KeywordGroups { get; set; }
        public DbSet<Keyword> Keywords { get; set; }
        public DbSet<PlainKeyword> PlainKeywords { get; set; }
        public DbSet<VariablePhrase> PhraseVariables { get; set; }
        public DbSet<VariableKeyword> KeywordVariables { get; set; }
        public DbSet<VariableAnything> AnythingVariables { get; set; }
        public DbSet<Variable> Variables { get; set; }

        public DbSet<Connection> Connection { get; set; }
        public DbSet<TypingDelay> TypingDelay { get; set; }
        public DbSet<ConversationalForm> ConversationalForm { get; set; }

        public DbSet<JsonAPI> JsonAPI { get; set; }

        public DbSet<TextResponse> TextResponse { get; set; }
        public DbSet<QuickReplyModel> QuickReplies { get; set; }

        public DbSet<LinkStory> LinkStory { get; set; }

        public DbSet<Media> Medias { get; set; }

        public DbSet<FormField> FormFields { get; set; }

        public DbSet<FormSubmission> FormSubmissions { get; set; }

        public DbSet<ApiHeader> ApiHeaders { get; set; }
        public DbSet<ImageSlideblock> ImageSlideblocks { get; set; }
        public DbSet<Buttonblock> Buttonblocks { get; set; }

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
            this.UserInputPhrases.AddRange(phrase);
        }

        public void addUserInputKeyword(UserInputKeyword keyword)
        {
            this.UserInputKeywords.AddRange(keyword);
        }

        public void addUserInputAnything(UserInputTypeAnything anything)
        {
            this.UserInputTypeAnythings.AddRange(anything);
        }

        public void addTypingDelay(TypingDelay delay)
        {
            this.TypingDelay.AddRange(delay);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Stories>().ToTable("Stories");
            modelBuilder.Entity<UserInputPhrase>().ToTable("UserInputPhrases");
            modelBuilder.Entity<UserInputKeyword>().ToTable("UserInputKeywords");
            modelBuilder.Entity<UserInputTypeAnything>().ToTable("UserInputTypeAnythings");
            modelBuilder.Entity<Connection>().ToTable("Connection");
            modelBuilder.Entity<JsonAPI>().ToTable("JsonAPI");
            modelBuilder.Entity<LinkStory>().ToTable("LinkStory");
            modelBuilder.Entity<ConversationalForm>().ToTable("CoversationalForm");
            //modelBuilder.Entity<TextResponse>().ToTable("TextResponse");
            modelBuilder.Entity<TypingDelay>().ToTable("TypingDelay");
            modelBuilder.Entity<TextResponse>().ToTable("TextResponse");
            modelBuilder.Entity<QuickReplyModel>().ToTable("QuickReply");
            // ✅ TextResponse configuration
            //modelBuilder.Entity<TextResponse>(entity =>
            //{
            //    entity.ToTable("TextResponse");

            //    // Primary key comes from BaseComponent (Guid ID)
            //    entity.HasKey(tr => tr.ID);

            //    // One-to-Many: TextResponse → QuickReplies
            //    entity.HasMany(tr => tr.QuickReplies)
            //          .WithOne(qr => qr.TextResponse)
            //          .HasForeignKey(qr => qr.TextResponseId)   // must match Guid
            //          .OnDelete(DeleteBehavior.Cascade);
            //});

            // ✅ QuickReply configuration
            //modelBuilder.Entity<QuickReply>(entity =>
            //{
            //    entity.ToTable("QuickReply");

            //    // Primary key from BaseComponent
            //    entity.HasKey(qr => qr.ID);

            //    // Foreign key is Guid, matches TextResponse.ID
            //    entity.HasOne(qr => qr.TextResponse)
            //          .WithMany(tr => tr.QuickReplies)
            //          .HasForeignKey(qr => qr.TextResponseId);
            //});
            base.OnModelCreating(modelBuilder);
        }
    }
}
