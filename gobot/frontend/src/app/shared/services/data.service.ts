// data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ClearDataResponse {
  success: boolean;
  message: string;
  deletedRecords?: {
    messages: number;
    userInteractions: number;
    analytics: number;
  };
  timestamp: string;
}

export interface ClearDataRequest {
  confirmationToken: string;
  deleteUntilDate: string;
  resetAnalytics: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  /**
   * Clear all chatbot data including messages and analytics
   */
  clearAllData(request: ClearDataRequest): Observable<ClearDataResponse> {
    return this.http.post<ClearDataResponse>(`${this.apiUrl}/data/clear`, request)
      .pipe(
        map(response => ({
          ...response,
          timestamp: new Date().toISOString()
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Get data statistics before deletion
   */
  getDataStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/data/statistics`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verify if data deletion is allowed
   */
  verifyDeletionPermission(): Observable<{ allowed: boolean; reason?: string }> {
    return this.http.get<{ allowed: boolean; reason?: string }>(`${this.apiUrl}/data/verify-deletion`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Generate confirmation token for secure deletion
   */
  generateConfirmationToken(): Observable<{ token: string; expiresAt: string }> {
    return this.http.post<{ token: string; expiresAt: string }>(`${this.apiUrl}/data/generate-token`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission to delete data.';
          break;
        case 404:
          errorMessage = 'Service not found. Please try again later.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait before trying again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('DataService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}