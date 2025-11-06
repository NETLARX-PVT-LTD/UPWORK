// ---------------------------------------------------------------------
// <copyright file="FormsService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services.EmailSetting
{
    using MailKit.Net.Smtp;
    using MailKit.Security;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Helper;
    using Netlarx.Products.Gobot.Interface.EmailSetting;
    using Netlarx.Products.Gobot.ModelDTO.EmailSetting;
    using Netlarx.Products.Gobot.Models.Email_Setting;
    using Netlarx.Products.Gobot.Result;
    using Netlarx.Products.Gobot.Validations;
    using System;
    using System.Threading.Tasks;

    public class EmailSettingsService : IEmailSettingsService
    {
        private readonly IEmailSettingsRepository _repository;

        public EmailSettingsService(IEmailSettingsRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result> SaveEmailSettingsAsync(EmailSettingDto request, Errors errors)
        {
            var check = UniversalValidation.Validate(request, errors);
            if (!check)
            {
                return new Result(false, errors, "400");
            }

            var encryptedPassword = EncryptionHelper.Encrypt(request.SmtpPassword);

            var settings = new EmailSetting
            {
                Id = Guid.NewGuid(),
                SenderName = request.SenderName,
                SecurityProtocol = request.SecurityProtocol,
                SmtpHost = request.SmtpHost,
                SmtpPort = request.SmtpPort,
                SmtpUsername = request.SmtpUsername,
                SmtpEmail = request.SmtpEmail,
                SmtpPassword = encryptedPassword
            };

            var success = await _repository.AddEmailSetting(settings, errors);
            if (!success)
            {
                return new Result(false, errors, "400");
            }

            return new Result(true, null, "200");
        }

        public async Task<EmailSettingResult> GetLatestEmailSettingsAsync(Errors errors)
        {
            var (success, emailSetting) = await _repository.GetLatestEmailSetting(errors);
            if (!success || emailSetting == null)
            {
                return new EmailSettingResult(success, "500", null, errors);
            }

            var dto = new EmailSettingDto
            {
                SenderName = emailSetting.SenderName,
                SecurityProtocol = emailSetting.SecurityProtocol,
                SmtpHost = emailSetting.SmtpHost,
                SmtpPort = emailSetting.SmtpPort,
                SmtpUsername = emailSetting.SmtpUsername,
                SmtpEmail = emailSetting.SmtpEmail,
                SmtpPassword = "********"
            };

            return new EmailSettingResult(success, "200", dto);
        }

        public async Task<Result> TestSmtpConnectionAsync(EmailSettingDto request, Errors errors)
        {
            var isValid = UniversalValidation.Validate(request, errors);
            if (!isValid)
            {
                return new Result(false, errors, "400");
            }

            try
            {
                var client = new SmtpClient();

                if (!int.TryParse(request.SmtpPort, out var port))
                {
                    errors.Fill(FailureCode.InvalidInput, "Invalid SMTP port number.");
                    return new Result(false, errors, "400");
                }

                var socketOption = request.SecurityProtocol?.ToUpper() switch
                {
                    "SSL" => SecureSocketOptions.SslOnConnect,
                    "TLS" => SecureSocketOptions.StartTls,
                    _ => SecureSocketOptions.Auto
                };

                await client.ConnectAsync(request.SmtpHost, port, socketOption);
                await client.AuthenticateAsync(request.SmtpUsername, request.SmtpPassword);
                await client.DisconnectAsync(true);

                return new Result(true, errors, "200");
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.InternalServerError, $"SMTP connection failed: {ex.Message}");
                return new Result(false, errors, "500");
            }
        }
    }
}