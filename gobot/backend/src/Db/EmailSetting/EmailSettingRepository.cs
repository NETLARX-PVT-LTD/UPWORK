// ---------------------------------------------------------------------
// <copyright file="EmailSettingsRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Repository.EmailSetting
{
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Db;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Interface.EmailSetting;
    using Netlarx.Products.Gobot.Models.Email_Setting;
    using System;
    using System.Linq;
    using System.Threading.Tasks;

    public class EmailSettingsRepository : IEmailSettingsRepository
    {
        private readonly BotDbContext _context;

        public EmailSettingsRepository(BotDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddEmailSetting(EmailSetting setting, Errors errors)
        {
            try
            {
                _context.EmailSettings.Add(setting);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Database error occured {ex.Message}");
                return false;
            }
        }

        public async Task<(bool success, EmailSetting? emailSetting)> GetLatestEmailSetting(Errors errors)
        {
            try
            {
                var emailSetting = await _context.EmailSettings
                            .OrderByDescending(e => e.CreatedAt)
                            .FirstOrDefaultAsync();

                return (true, emailSetting);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Database error occured {ex.Message}");
                return (false, null);
            }
        }
    }
}