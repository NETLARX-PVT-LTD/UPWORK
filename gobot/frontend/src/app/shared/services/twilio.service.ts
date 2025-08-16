// twilio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  smsNumber: string;
  senderId?: string;
  webhookUrl: string;
  messageHandling: {
    type: 'webhook' | 'twiml' | 'function' | 'studio' | 'proxy';
    method: 'GET' | 'POST';
  };
  primaryHandlerFails: {
    type: 'webhook' | 'twiml' | 'function' | 'studio' | 'proxy';
    method: 'GET' | 'POST';
  };
}

export interface TwilioConnectionStatus {
  isConnected: boolean;
  lastTested?: Date;
  error?: string;
}

export interface SmsMessage {
  from: string;
  to: string;
  body: string;
  sid?: string;
  status?: string;
  dateCreated?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TwilioService {
  private readonly baseUrl = '/api/twilio'; // Adjust based on your backend
  private connectionStatusSubject = new BehaviorSubject<TwilioConnectionStatus>({ isConnected: false });
  
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkConnectionStatus();
  }

  /**
   * Save Twilio configuration
   */
  saveConfiguration(config: TwilioConfig): Observable<any> {
    return this.http.post(`${this.baseUrl}/configure`, config, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.updateConnectionStatus(true)),
      catchError(error => {
        this.updateConnectionStatus(false, error.message);
        throw error;
      })
    );
  }

  /**
   * Get current Twilio configuration
   */
  getConfiguration(): Observable<TwilioConfig> {
    return this.http.get<TwilioConfig>(`${this.baseUrl}/config`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Test Twilio connection
   */
  testConnection(accountSid: string, authToken: string): Observable<any> {
    const testData = { accountSid, authToken };
    return this.http.post(`${this.baseUrl}/test-connection`, testData, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.updateConnectionStatus(true)),
      catchError(error => {
        this.updateConnectionStatus(false, error.message);
        throw error;
      })
    );
  }

  /**
   * Send SMS message
   */
  sendMessage(message: SmsMessage): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, message, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get SMS message history
   */
  getMessageHistory(limit: number = 50): Observable<SmsMessage[]> {
    return this.http.get<SmsMessage[]>(`${this.baseUrl}/messages?limit=${limit}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Validate phone numbers
   */
  validatePhoneNumbers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/validate-numbers`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get Twilio account info
   */
  getAccountInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/account-info`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get available phone numbers
   */
  getPhoneNumbers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/phone-numbers`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Update webhook configuration for a phone number
   */
  updateWebhookConfig(phoneNumber: string, webhookUrl: string, method: string = 'POST'): Observable<any> {
    const config = { phoneNumber, webhookUrl, method };
    return this.http.put(`${this.baseUrl}/webhook-config`, config, {
      headers: this.getHeaders()
    });
  }

  /**
   * Delete Twilio configuration
   */
  deleteConfiguration(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/config`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.updateConnectionStatus(false))
    );
  }

  private checkConnectionStatus(): void {
    this.http.get(`${this.baseUrl}/status`).subscribe({
      next: (status: any) => {
        this.updateConnectionStatus(status.isConnected, status.error);
      },
      error: () => {
        this.updateConnectionStatus(false, 'Unable to check connection status');
      }
    });
  }

  private updateConnectionStatus(isConnected: boolean, error?: string): void {
    this.connectionStatusSubject.next({
      isConnected,
      lastTested: new Date(),
      error
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // Add authorization headers if needed
      // 'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }
}