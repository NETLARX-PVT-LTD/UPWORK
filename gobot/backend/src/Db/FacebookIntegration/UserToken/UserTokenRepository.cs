// ---------------------------------------------------------------------
// <copyright file="UserTokenRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Db.FacebookIntegration.UserToken
{
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Db.FacebookIntegration.UserToken;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using System;
    using System.Threading.Tasks;

    public class UserTokenRepository: IUserTokenRepository
    {
        private readonly BotDbContext _context;
        public UserTokenRepository(BotDbContext context )
        {
            _context = context;
        }

        public async Task<bool> AddUserToken(UserToken userToken, Errors errors)
        {
            try
            {
                await _context.UserTokens.AddAsync(userToken);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occurred while adding the user token. {ex.Message}");
                return false;
            }
        }

        public async Task<(bool success, UserToken? userToken)> GetUserTokenById(Guid id, Errors errors)
        {
            try
            {
                var userToken = await _context.UserTokens.FirstOrDefaultAsync(u => u.Id == id);
                if (userToken == null)
                {
                    errors.Fill(FailureCode.NotFound, $"User token with ID '{id}' not found.");
                    return (false, null);
                }

                return (true, userToken);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.DatabaseError, $"Error occurred while retrieving the user token. {ex.Message}");
                return (false, null);
            }
        }
    }
}