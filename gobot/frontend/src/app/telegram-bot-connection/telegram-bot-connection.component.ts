// telegram-bot-connection.component.ts (Fixed with Service Integration)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TelegramBotService, TelegramBotConfig, TelegramBotInfo } from '../shared/services/telegram-bot.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
// Removed BrowserModule and AppRoutingModule. Standalone components import
// their direct dependencies. AppRoutingModule is for NgModule-based apps.

@Component({
  selector: 'app-telegram-bot-connection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './telegram-bot-connection.component.html',
  // Fixed the stylesheet reference to a valid file. A simple empty file is provided below.
  styleUrls: ['./telegram-bot-connection.component.scss']
})
export class TelegramBotConnectionComponent implements OnInit {
  telegramForm: FormGroup;
  isLoading = false;
  isTesting = false;
  successMessage = '';
  errorMessage = '';
  botInfo: TelegramBotInfo | null = null;
  webhookStatus = '';

  constructor(
    private fb: FormBuilder,
    private telegramBotService: TelegramBotService
  ) {
    this.telegramForm = this.fb.group({
      accessToken: ['', [
        Validators.required,
        Validators.pattern(/^\d+:[A-Za-z0-9_-]+$/),
        Validators.minLength(35)
      ]],
      botName: ['', [Validators.required, Validators.minLength(3)]],
      telegramNumber: ['', [
        Validators.required,
        Validators.pattern(/^\+?[1-9]\d{7,14}$/)
      ]],
      chatbotUrl: ['', [
        Validators.required,
        Validators.pattern(/^https:\/\/.+/)
      ]]
    });
  }

  ngOnInit(): void {
    this.loadExistingConfig();
  }

  loadExistingConfig(): void {
    // Try to load from localStorage first
    const savedConfig = localStorage.getItem('telegramBotConfig');
    if (savedConfig) {
      try {
        const config: TelegramBotConfig = JSON.parse(savedConfig);
        this.telegramForm.patchValue(config);
        // Call the validation without showing messages during initial load
        this.validateBotToken(config.accessToken, false);
      } catch (error) {
        console.error('Error parsing saved config:', error);
        localStorage.removeItem('telegramBotConfig');
      }
    }

    // Also try to load from backend
    this.telegramBotService.getBotConfiguration().subscribe({
      next: (config) => {
        this.telegramForm.patchValue(config);
        this.validateBotToken(config.accessToken, false);
      },
      error: (error) => {
        console.log('No existing configuration found in backend:', error.message);
      }
    });
  }

  onSubmit(): void {
    if (this.telegramForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      const formData: TelegramBotConfig = this.telegramForm.value;

      // First validate the bot token using a modern RxJS pattern to avoid .toPromise()
      this.telegramBotService.validateBotToken(formData.accessToken).subscribe({
        next: (botInfo) => {
          if (botInfo) {
            this.botInfo = botInfo;
            // Update bot name with actual bot username if available
            if (this.botInfo.username) {
              formData.botName = this.botInfo.username;
              this.telegramForm.patchValue({ botName: this.botInfo.username });
            }
            this.saveBotConfiguration(formData);
          } else {
            // Handle case where validation succeeds but no bot info is returned
            this.errorMessage = 'Invalid Telegram bot token. Please check your Access Token.';
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Error validating bot token: ' + error.message;
          this.isLoading = false;
        },
        complete: () => {
          // This block is optional, but useful for cleanup
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  private validateBotToken(token: string, showMessages: boolean = true): void {
    this.telegramBotService.validateBotToken(token).subscribe({
      next: (botInfo) => {
        this.botInfo = botInfo;
        if (showMessages && this.botInfo) {
          this.successMessage = `✅ Bot validated successfully! Bot name: @${this.botInfo.username || this.botInfo.first_name}`;
        }
      },
      error: (error) => {
        this.botInfo = null;
        if (showMessages) {
          this.errorMessage = 'Invalid bot token: ' + error.message;
        }
      }
    });
  }

  private saveBotConfiguration(config: TelegramBotConfig): void {
    // Save to backend
    this.telegramBotService.saveBotConfiguration(config).subscribe({
      next: (response) => {
        // Save locally for future reference
        localStorage.setItem('telegramBotConfig', JSON.stringify(config));
        
        // Set up webhook
        this.setupWebhook(config.accessToken, config.chatbotUrl);
      },
      error: (error) => {
        // If backend fails, still try to set up webhook and save locally
        console.warn('Backend save failed, proceeding with webhook setup:', error.message);
        localStorage.setItem('telegramBotConfig', JSON.stringify(config));
        this.setupWebhook(config.accessToken, config.chatbotUrl);
      }
    });
  }

  private setupWebhook(token: string, webhookUrl: string): void {
    const fullWebhookUrl = this.telegramBotService.generateWebhookUrl(webhookUrl, token);
    
    this.telegramBotService.setWebhook(token, fullWebhookUrl, ['message', 'callback_query']).subscribe({
      next: (success) => {
        if (success) {
          this.successMessage = `🎉 Telegram bot connected successfully! 
            Your chatbot is now responding to Telegram clients.
            Webhook URL: ${fullWebhookUrl}`;
          this.webhookStatus = 'Active';
          
          // Get webhook info for confirmation
          this.getWebhookInfo(token);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Bot validated but webhook setup failed: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  private getWebhookInfo(token: string): void {
    this.telegramBotService.getWebhookInfo(token).subscribe({
      next: (info) => {
        console.log('Webhook info:', info);
        if (info.url) {
          this.webhookStatus = `Active (${info.pending_update_count} pending updates)`;
        }
      },
      error: (error) => {
        console.error('Failed to get webhook info:', error);
      }
    });
  }

  testConnection(): void {
    const token = this.telegramForm.get('accessToken')?.value;
    if (token) {
      this.isTesting = true;
      this.clearMessages();
      
      this.telegramBotService.validateBotToken(token).subscribe({
        next: (botInfo) => {
          this.isTesting = false;
          this.botInfo = botInfo;
          if (botInfo) {
            this.successMessage = `✅ Bot validated successfully! Bot name: @${this.botInfo.username || this.botInfo.first_name}`;
            // Auto-fill bot name if available
            this.telegramForm.patchValue({ 
              botName: this.botInfo.username || this.botInfo.first_name 
            });
          }
        },
        error: (error) => {
          this.isTesting = false;
          this.errorMessage = 'Invalid bot token: ' + error.message;
        }
      });
    }
  }

  testWebhook(): void {
    const webhookUrl = this.telegramForm.get('chatbotUrl')?.value;
    if (webhookUrl) {
      this.isLoading = true;
      this.clearMessages();
      
      this.telegramBotService.testWebhook(webhookUrl).subscribe({
        next: (isReachable) => {
          if (isReachable) {
            this.successMessage = '✅ Webhook URL is reachable!';
          } else {
            this.errorMessage = '❌ Webhook URL is not reachable. Please check your server.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Webhook test failed: ' + error.message;
          this.isLoading = false;
        }
      });
    }
  }

  deleteWebhook(): void {
    const token = this.telegramForm.get('accessToken')?.value;
    if (token && confirm('Are you sure you want to delete the webhook? This will stop your bot from receiving messages.')) {
      this.isLoading = true;
      this.clearMessages();
      
      this.telegramBotService.deleteWebhook(token).subscribe({
        next: (success) => {
          if (success) {
            this.successMessage = '✅ Webhook deleted successfully!';
            this.webhookStatus = 'Inactive';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete webhook: ' + error.message;
          this.isLoading = false;
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.telegramForm.controls).forEach(key => {
      const control = this.telegramForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.telegramForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'accessToken') {
          return 'Invalid token format. Should be like: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
        }
        if (fieldName === 'telegramNumber') {
          return 'Please enter a valid phone number (e.g., +1234567890)';
        }
        if (fieldName === 'chatbotUrl') {
          return 'Please enter a valid HTTPS URL (e.g., https://your-domain.com)';
        }
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      accessToken: 'Access Token',
      botName: 'Bot Name',
      telegramNumber: 'Telegram Number',
      chatbotUrl: 'Telegram Chatbot URL'
    };
    return displayNames[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.telegramForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  clearForm(): void {
    this.telegramForm.reset();
    this.botInfo = null;
    this.webhookStatus = '';
    this.clearMessages();
    localStorage.removeItem('telegramBotConfig');
  }

  // Helper method to format bot info display
  getBotDisplayName(): string {
    if (this.botInfo) {
      return `@${this.botInfo.username || this.botInfo.first_name} (ID: ${this.botInfo.id})`;
    }
    return '';
  }

  // Check if webhook URL is valid format
  isWebhookUrlValid(): boolean {
    const url = this.telegramForm.get('chatbotUrl')?.value;
    return url && this.telegramBotService.isValidWebhookUrl(url);
  }

   /**
   * Returns the display URL for the webhook, possibly truncated or formatted.
   */
  getWebhookDisplayUrl(): string {
    // Implement the logic to get the display URL here
    // For example:
    return this.telegramForm.get('chatbotUrl')?.value || 'Not set';
  }

  /**
   * Formats a message for display, e.g., converts newlines to <br>.
   * @param message The message to format.
   */
  formatMessage(message: string): string {
    // Implement the logic to format the message here
    // For example, replacing newlines with HTML breaks:
    return message.replace(/\n/g, '<br>');
  }
}
