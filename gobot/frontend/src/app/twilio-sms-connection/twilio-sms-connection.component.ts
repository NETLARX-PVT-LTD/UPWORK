// twilio-sms-connection.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface TwilioConfig {
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

@Component({
  selector: 'app-twilio-sms-connection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './twilio-sms-connection.component.html',
  styleUrls: ['./twilio-sms-connection.component.scss']
})
export class TwilioSmsConnectionComponent implements OnInit {
  twilioForm: FormGroup;
  isLoading = false;
  showAdvanced = false;
  
  // Configuration options
  messageHandlingTypes = [
    { value: 'webhook', label: 'Webhooks' },
    { value: 'twiml', label: 'TwiML Bins' },
    { value: 'function', label: 'Functions' },
    { value: 'studio', label: 'Studio' },
    { value: 'proxy', label: 'Proxy' }
  ];

  httpMethods = [
    { value: 'GET', label: 'HTTP GET' },
    { value: 'POST', label: 'HTTP POST' }
  ];

  // Default webhook URL (you can make this configurable)
  defaultWebhookUrl = 'http://localhost:4200/twilio/receive/sms';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.twilioForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadSavedConfig();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      accountSid: ['', [Validators.required]],
      authToken: ['', [Validators.required]],
      smsNumber: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{1,14}$/)]],
      senderId: [''],
      webhookUrl: [this.defaultWebhookUrl, [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      messageHandlingType: ['webhook', Validators.required],
      messageHandlingMethod: ['POST', Validators.required],
      primaryHandlerFailsType: ['webhook'],
      primaryHandlerFailsMethod: ['POST']
    });
  }

  onSubmit(): void {
    if (this.twilioForm.valid) {
      this.isLoading = true;
      const config: TwilioConfig = this.formatConfigData();
      
      this.saveTwilioConfig(config).subscribe({
        next: (response) => {
          console.log('Twilio configuration saved successfully:', response);
          this.isLoading = false;
          // Show success message
          alert('Twilio SMS connection configured successfully!');
        },
        error: (error) => {
          console.error('Error saving Twilio configuration:', error);
          this.isLoading = false;
          // Show error message
          alert('Failed to save configuration. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private formatConfigData(): TwilioConfig {
    const formValue = this.twilioForm.value;
    return {
      accountSid: formValue.accountSid,
      authToken: formValue.authToken,
      smsNumber: formValue.smsNumber,
      senderId: formValue.senderId,
      webhookUrl: formValue.webhookUrl,
      messageHandling: {
        type: formValue.messageHandlingType,
        method: formValue.messageHandlingMethod
      },
      primaryHandlerFails: {
        type: formValue.primaryHandlerFailsType,
        method: formValue.primaryHandlerFailsMethod
      }
    };
  }

  private saveTwilioConfig(config: TwilioConfig) {
    // Replace with your actual API endpoint
    return this.http.post('/api/twilio/configure', config);
  }

  private loadSavedConfig(): void {
    // Load existing configuration if available
    this.http.get<TwilioConfig>('/api/twilio/config').subscribe({
      next: (config) => {
        this.twilioForm.patchValue({
          accountSid: config.accountSid,
          authToken: config.authToken,
          smsNumber: config.smsNumber,
          senderId: config.senderId,
          webhookUrl: config.webhookUrl,
          messageHandlingType: config.messageHandling.type,
          messageHandlingMethod: config.messageHandling.method,
          primaryHandlerFailsType: config.primaryHandlerFails.type,
          primaryHandlerFailsMethod: config.primaryHandlerFails.method
        });
      },
      error: (error) => {
        console.log('No existing configuration found or error loading config:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.twilioForm.controls).forEach(key => {
      this.twilioForm.get(key)?.markAsTouched();
    });
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  testConnection(): void {
    if (this.twilioForm.get('accountSid')?.valid && 
        this.twilioForm.get('authToken')?.valid) {
      this.isLoading = true;
      
      const testData = {
        accountSid: this.twilioForm.get('accountSid')?.value,
        authToken: this.twilioForm.get('authToken')?.value
      };

      this.http.post('/api/twilio/test-connection', testData).subscribe({
        next: (response) => {
          console.log('Connection test successful:', response);
          alert('Connection test successful!');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Connection test failed:', error);
          alert('Connection test failed. Please check your credentials.');
          this.isLoading = false;
        }
      });
    } else {
      alert('Please enter valid Account SID and Auth Token first.');
    }
  }

  copyWebhookUrl(): void {
    navigator.clipboard.writeText(this.twilioForm.get('webhookUrl')?.value).then(() => {
      alert('Webhook URL copied to clipboard!');
    });
  }

  // Getter methods for form validation
  get accountSid() { return this.twilioForm.get('accountSid'); }
  get authToken() { return this.twilioForm.get('authToken'); }
  get smsNumber() { return this.twilioForm.get('smsNumber'); }
  get webhookUrl() { return this.twilioForm.get('webhookUrl'); }
}