import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// No real API base URL needed for dummy mode
// const API_BASE_URL = 'http://localhost:4200/api'; // Commented out

export interface WhatsAppConfig {
  botId: string;
  botName: string;
  phoneNumber: string;
  apiType: 'meta-cloud' | 'd360';
  webhookUrl: string;
  accessToken: string;
  verifyToken: string;
}

export interface ApiTestResult {
  success: boolean;
  message: string;
  responseTime?: string;
  status?: string;
  error?: any;
}

export interface PublishResult {
  success: boolean;
  message: string;
  botId?: string;
  webhookUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  constructor(private http: HttpClient) { }

  /**
   * Test WhatsApp API connection based on the configured API type (dummy mode).
   * @param config The WhatsApp configuration object.
   * @returns An Observable of the test result.
   */
  testWhatsAppConnection(config: WhatsAppConfig): Observable<ApiTestResult> {
    const startTime = Date.now();
    // Simulate success for both API types
    return of(null).pipe(
      delay(1500), // Simulate network delay
      map(() => {
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
        return {
          success: true,
          message: `${config.apiType === 'meta-cloud' ? 'Meta Cloud' : 'D360'} API connection successful! (Dummy mode)`,
          responseTime,
          status: 'Connected'
        };
      }),
      catchError(error => this.handleApiError(error, config.apiType === 'meta-cloud' ? 'Meta Cloud' : 'D360'))
    );
  }

  /**
   * Publishes the bot configuration (dummy mode).
   * @param config The WhatsApp configuration object.
   * @returns An Observable of the publish result.
   */
  publishBot(config: WhatsAppConfig): Observable<PublishResult> {
    return of(null).pipe(
      delay(2000), // Simulate publish delay
      map(() => ({
        success: true,
        message: 'Bot published successfully! (Dummy mode)',
        botId: config.botId,
        webhookUrl: config.webhookUrl
      })),
      catchError(error => {
        console.error('Publish error:', error);
        return throwError(() => ({
          success: false,
          message: 'Failed to publish bot. Please check your configuration. (Dummy mode)',
          error: error.message || error
        }));
      })
    );
  }

  /**
   * Gets the status of a specific bot (dummy mode).
   * @param botId The ID of the bot.
   * @returns An Observable of the bot's status.
   */
  getBotStatus(botId: string): Observable<any> {
    return of({ status: 'Active', details: 'Bot is running (Dummy mode)' }).pipe(
      delay(1000),
      catchError(error => {
        console.error('Status check error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates the webhook URL for a bot (dummy mode).
   * @param botId The ID of the bot.
   * @param webhookUrl The new webhook URL.
   * @param verifyToken The new verify token.
   * @returns An Observable of the update result.
   */
  updateWebhook(botId: string, webhookUrl: string, verifyToken: string): Observable<any> {
    return of({ success: true, message: 'Webhook updated (Dummy mode)' }).pipe(
      delay(1000),
      catchError(error => {
        console.error('Webhook update error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Validates the webhook URL (dummy mode).
   * @param webhookUrl The URL of the webhook.
   * @param verifyToken The verify token.
   * @returns An Observable of a boolean indicating if the validation was successful.
   */
  validateWebhook(webhookUrl: string, verifyToken: string): Observable<boolean> {
    return of(true).pipe(
      delay(800),
      catchError(() => throwError(() => new Error('Webhook validation failed (Dummy mode).')))
    );
  }

  /**
   * Get WhatsApp Business Account info (dummy mode).
   * @param accessToken The access token for the business account.
   * @returns An Observable of the business account information.
   */
  getBusinessAccountInfo(accessToken: string): Observable<any> {
    return of({ name: 'Dummy Account', id: '123456' }).pipe(
      delay(1000),
      catchError(error => {
        console.error('Business account info error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generates a random 6-digit number as a bot ID.
   * @returns A 6-digit string.
   */
  generateBotId(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Formats a phone number to include a leading '+'.
   * @param phoneNumber The phone number string.
   * @returns The formatted phone number string.
   */
  formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    return formatted;
  }

  /**
   * Validates a phone number using a regular expression.
   * @param phoneNumber The phone number string.
   * @returns A boolean indicating if the phone number is valid.
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Generates a "click-to-chat" WhatsApp URL for testing.
   * @param botId The ID of the bot to include in the message.
   * @param demoNumber The demo number to send the message to.
   * @returns A WhatsApp URL string.
   */
  getDemoWhatsAppUrl(botId: string, demoNumber: string = '+923313014733'): string {
    const message = `Hi, I want to test bot ID: ${botId}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${demoNumber.replace('+', '')}?text=${encodedMessage}`;
  }

  private handleApiError(error: any, apiType: string): Observable<ApiTestResult> {
    console.error(`${apiType} API test error:`, error);
    let errorMessage = `Failed to connect to ${apiType} API. (Dummy mode)`;
    
    if (error.status === 401) {
      errorMessage = `Invalid access token for ${apiType}.`;
    } else if (error.status === 400) {
      errorMessage = `Invalid phone number or configuration for ${apiType}.`;
    } else if (error.status === 500) {
      errorMessage = `Server error while connecting to ${apiType}.`;
    }
    
    return throwError(() => ({
      success: false,
      message: errorMessage,
      error: error.message || error
    }));
  }
}