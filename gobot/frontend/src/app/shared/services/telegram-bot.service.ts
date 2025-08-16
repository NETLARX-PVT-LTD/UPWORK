// telegram-bot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

export interface TelegramApiResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
}

export interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  allowed_updates?: string[];
}

export interface TelegramBotConfig {
  accessToken: string;
  botName: string;
  telegramNumber: string;
  chatbotUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class TelegramBotService {
  private readonly TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

  constructor(private http: HttpClient) {}

  /**
   * Validate Telegram bot token by calling getMe API
   */
  validateBotToken(token: string): Observable<TelegramBotInfo> {
    const url = `${this.TELEGRAM_API_BASE}${token}/getMe`;
    
    return this.http.get<TelegramApiResponse<TelegramBotInfo>>(url)
      .pipe(
        map(response => {
          if (response.ok) {
            return response.result;
          } else {
            throw new Error(response.description || 'Invalid bot token');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Set webhook for the Telegram bot
   */
  setWebhook(token: string, webhookUrl: string, allowedUpdates?: string[]): Observable<boolean> {
    const url = `${this.TELEGRAM_API_BASE}${token}/setWebhook`;
    
    const payload: any = {
      url: webhookUrl
    };

    if (allowedUpdates && allowedUpdates.length > 0) {
      payload.allowed_updates = allowedUpdates;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<TelegramApiResponse<boolean>>(url, payload, { headers })
      .pipe(
        map(response => {
          if (response.ok) {
            return response.result;
          } else {
            throw new Error(response.description || 'Failed to set webhook');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get current webhook info
   */
  getWebhookInfo(token: string): Observable<WebhookInfo> {
    const url = `${this.TELEGRAM_API_BASE}${token}/getWebhookInfo`;
    
    return this.http.get<TelegramApiResponse<WebhookInfo>>(url)
      .pipe(
        map(response => {
          if (response.ok) {
            return response.result;
          } else {
            throw new Error(response.description || 'Failed to get webhook info');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete webhook (useful for cleanup)
   */
  deleteWebhook(token: string): Observable<boolean> {
    const url = `${this.TELEGRAM_API_BASE}${token}/deleteWebhook`;
    
    return this.http.post<TelegramApiResponse<boolean>>(url, {})
      .pipe(
        map(response => {
          if (response.ok) {
            return response.result;
          } else {
            throw new Error(response.description || 'Failed to delete webhook');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Save bot configuration to your backend
   */
  saveBotConfiguration(config: TelegramBotConfig): Observable<any> {
    // Replace with your actual backend API endpoint
    const url = '/api/telegram-bot/configure';
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(url, config, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get saved bot configuration from your backend
   */
  getBotConfiguration(): Observable<TelegramBotConfig> {
    // Replace with your actual backend API endpoint
    const url = '/api/telegram-bot/configuration';
    
    return this.http.get<TelegramBotConfig>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Test webhook connectivity
   */
  testWebhook(webhookUrl: string): Observable<boolean> {
    // This would typically ping your webhook endpoint to ensure it's reachable
    return this.http.get(`${webhookUrl}/health`)
      .pipe(
        map(() => true),
        catchError(() => {
          // If health check fails, return false instead of throwing error
          return [false];
        })
      );
  }

  /**
   * Send a test message through the bot
   */
  sendTestMessage(token: string, chatId: string | number, message: string): Observable<boolean> {
    const url = `${this.TELEGRAM_API_BASE}${token}/sendMessage`;
    
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<TelegramApiResponse<any>>(url, payload, { headers })
      .pipe(
        map(response => {
          if (response.ok) {
            return true;
          } else {
            throw new Error(response.description || 'Failed to send test message');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get bot updates (for testing purposes)
   */
  getUpdates(token: string, offset?: number, limit?: number): Observable<any[]> {
    let url = `${this.TELEGRAM_API_BASE}${token}/getUpdates`;
    
    const params: string[] = [];
    if (offset !== undefined) params.push(`offset=${offset}`);
    if (limit !== undefined) params.push(`limit=${limit}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<TelegramApiResponse<any[]>>(url)
      .pipe(
        map(response => {
          if (response.ok) {
            return response.result;
          } else {
            throw new Error(response.description || 'Failed to get updates');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Validate webhook URL format
   */
  isValidWebhookUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:' && parsedUrl.hostname !== 'localhost';
    } catch {
      return false;
    }
  }

  /**
   * Generate webhook URL based on base URL and bot token
   */
  generateWebhookUrl(baseUrl: string, token: string): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    return `${cleanBaseUrl}/webhook/telegram/${token}`;
  }

  private handleError(error: any): Observable<never> {
    console.error('TelegramBotService Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.status) {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized: Invalid bot token';
      } else if (error.status === 400) {
        errorMessage = 'Bad Request: ' + (error.error?.description || 'Invalid parameters');
      } else if (error.status === 404) {
        errorMessage = 'Bot not found: Invalid token or bot doesn\'t exist';
      } else {
        errorMessage = `Server Error (${error.status}): ${error.error?.description || error.message}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}