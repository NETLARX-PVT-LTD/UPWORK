// src/app/whatsapp-publisher/whatsapp-publisher.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { firstValueFrom } from 'rxjs';
import { WhatsappService, BotStatus, WhatsAppConfig } from '../shared/services/whatsapp.service';
import { BotsifyChatComponent } from './botsify-chat/botsify-chat.component';

// Define an enum for currentStep values
enum Step {
  ChooseApi = 1,
  ConfigureBot = 2,
  TestBot = 3,
  Publish = 4
}

interface ApiTestResult {
  success: boolean;
  message: string;
  responseTime?: string;
  status?: string;
  error?: any;
  details?: {
    accountId: string;
    accountName: string;
    phoneNumber: string;
    apiVersion: string;
    features: string[];
  };
}

interface WebhookValidationResult {
  success: boolean;
  message: string;
}

interface ApiOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  isOfficial: boolean;
  features: string[];
  pricing?: string;
}

interface PublishResult {
  success: boolean;
  message: string;
  botId?: string;
  publishedAt?: Date;
  whatsappTestUrl?: string;
}

@Component({
  selector: 'app-whatsapp-publisher',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatTabsModule,
    MatBadgeModule,
    MatProgressBarModule,
    BotsifyChatComponent
  ],
  templateUrl: './whatsapp-publisher.component.html',
  styleUrls: ['./whatsapp-publisher.component.scss']
})
export class WhatsappPublisherComponent implements OnInit, OnDestroy {
  currentStep: Step = Step.ChooseApi;
  selectedApi: string = '';
  botId: string = '123456';
  testingInProgress: boolean = false;
  publishingInProgress: boolean = false;
  webhookValidating: boolean = false;
  isPublished: boolean = false;
  testResults: ApiTestResult | null = null;
  webhookResults: WebhookValidationResult | null = null;
  whatsappWindow: Window | null = null;
  botStatus: BotStatus | null = null;
  showChat: boolean = false;
  showHelp: boolean = false;
  publishResult: PublishResult | null = null;

  readonly Step = Step;

  apiOptions: ApiOption[] = [
    { id: 'meta-cloud', name: 'Official Meta Cloud WhatsApp API', description: 'Meta\'s official cloud-based WhatsApp Business API', icon: '📱', isOfficial: true, features: ['Official Meta support', 'High message throughput'] },
    { id: 'd360', name: 'D360 WhatsApp Business API', description: 'Third-party WhatsApp Business API solution', icon: '🔄', isOfficial: false, features: ['Competitive pricing', 'Easy integration'] }
  ];

  publishForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private whatsappService: WhatsappService
  ) {
    this.publishForm = this.fb.group({
      botName: ['Demo Customer Support Bot', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['+923313014733', [Validators.required, this.phoneNumberValidator]],
      webhookUrl: ['https://demo-webhook.your-domain.com/whatsapp', [Validators.required, this.httpsValidator]],
      verifyToken: ['demo_verify_token_67890', [Validators.required]],
      accessToken: ['demo_access_token_12345', [Validators.required]],
      phoneNumberId: [''],
      businessAccountId: [''],
      apiType: ['']
    });
  }

  ngOnInit(): void {
    this.generateBotId();
    this.whatsappService.botStatus$.subscribe((status: BotStatus | null) => {
      if (status) {
        this.botStatus = status;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.whatsappWindow && !this.whatsappWindow.closed) {
      this.whatsappWindow.close();
    }
  }

  toggleHelp(): void {
    this.showHelp = !this.showHelp;
  }

  generateBotId(): void {
    this.botId = this.whatsappService.generateBotId();
  }

  copyBotId(): void {
    const el = document.createElement('textarea');
    el.value = this.botId;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.showNotification('Bot ID copied to clipboard', 'success');
  }

  copyWebhookUrl(): void {
    const webhookUrl = this.publishForm.get('webhookUrl')?.value;
    const el = document.createElement('textarea');
    el.value = webhookUrl;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.showNotification('Webhook URL copied to clipboard', 'success');
  }

  selectApi(apiId: string): void {
    this.selectedApi = apiId;
    this.publishForm.get('apiType')?.setValue(apiId);
    this.webhookResults = null;
    this.testResults = null;
    this.showNotification(`Selected ${apiId === 'meta-cloud' ? 'Meta Cloud API' : 'D360 API'}`, 'info');
  }

  async validateWebhook(): Promise<void> {
    if (this.webhookValidating) return;
    const webhookUrl = this.publishForm.get('webhookUrl')?.value;
    const verifyToken = this.publishForm.get('verifyToken')?.value;

    if (!webhookUrl || !verifyToken) {
      this.showNotification('Please enter both webhook URL and verify token', 'error');
      return;
    }

    this.webhookValidating = true;
    try {
      this.webhookResults = await firstValueFrom(this.whatsappService.validateWebhook(webhookUrl, verifyToken));
      this.showNotification('Webhook validation successful!', 'success');
    } catch (error: any) {
      this.webhookResults = { success: false, message: error.message };
      this.showNotification(error.message, 'error');
    } finally {
      this.webhookValidating = false;
    }
  }

  async testBot(): Promise<void> {
    if (this.testingInProgress) return;
    if (this.publishForm.invalid) {
      this.showNotification('Please fill all required form fields', 'error');
      return;
    }

    this.testingInProgress = true;
    try {
      const config = this.publishForm.value as WhatsAppConfig;
      config.botId = this.botId;
      this.testResults = await firstValueFrom(this.whatsappService.testWhatsAppConnection(config));
      this.showNotification('API connection test successful!', 'success');
    } catch (error: any) {
      this.testResults = { success: false, message: error.message };
      this.showNotification(error.message, 'error');
    } finally {
      this.testingInProgress = false;
    }
  }

  async sendTestMessage(): Promise<void> {
    if (!this.testResults?.success) {
      this.showNotification('Please run API test first', 'error');
      return;
    }
    this.showNotification('Sending Test Message...', 'info');
    try {
      const config = this.publishForm.value as WhatsAppConfig;
      config.botId = this.botId;
      await firstValueFrom(this.whatsappService.sendTestMessage(config, '923313014733', 'Test message'));
      this.showNotification('Test message sent successfully!', 'success');
    } catch (error: any) {
      this.showNotification(error.message, 'error');
    }
  }

  async publishBot(): Promise<void> {
    if (!this.canPublish()) {
      this.showNotification('Please complete all required steps before publishing', 'error');
      return;
    }

    if (this.publishingInProgress) return;

    this.publishingInProgress = true;
    try {
      const config = this.publishForm.value as WhatsAppConfig;
      config.botId = this.botId;
      this.publishResult = await firstValueFrom(this.whatsappService.publishBot(config));
      this.isPublished = this.publishResult.success;
      this.showNotification(this.publishResult.message, this.publishResult.success ? 'success' : 'error');
      if (this.isPublished && this.publishResult.whatsappTestUrl) {
        this.whatsappWindow = this.whatsappService.openWhatsAppWebForTesting(this.botId);
      }
    } catch (error: any) {
      this.publishResult = { success: false, message: error.message };
      this.showNotification(error.message, 'error');
    } finally {
      this.publishingInProgress = false;
    }
  }

  async unpublishBot(): Promise<void> {
    if (confirm('Are you sure you want to unpublish this bot?')) {
      this.showNotification('Unpublishing Bot...', 'info');
      try {
        await firstValueFrom(this.whatsappService.unpublishBot(this.botId));
        this.isPublished = false;
        this.publishResult = null;
        this.showNotification('Bot unpublished successfully', 'info');
      } catch (error: any) {
        this.showNotification(error.message, 'error');
      }
    }
  }

  nextStep(): void {
    if (this.canProceedToNextStep()) {
      this.currentStep = (this.currentStep + 1) as Step;
    }
  }

  previousStep(): void {
    if (this.currentStep > Step.ChooseApi) {
      this.currentStep = (this.currentStep - 1) as Step;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case Step.ChooseApi:
        return !!this.selectedApi;
      case Step.ConfigureBot:
        return this.publishForm.valid && this.webhookResults?.success === true;
      case Step.TestBot:
        return this.testResults?.success === true;
      case Step.Publish:
        return true;
      default:
        return true;
    }
  }

  canPublish(): boolean {
    return this.publishForm.valid && this.webhookResults?.success === true && this.testResults?.success === true;
  }

  openWhatsAppTest(): void {
    this.showNotification('Opening WhatsApp Web for testing...', 'info');
    const whatsappWindow = this.whatsappService.openWhatsAppWebForTesting(this.botId);
    if (whatsappWindow) {
      this.whatsappWindow = whatsappWindow;
      this.showNotification('WhatsApp Web opened! Please login to start testing your bot.', 'success');
    } else {
      this.showNotification('Failed to open WhatsApp Web. Please check popup blockers.', 'error');
    }
  }

  openDirectWhatsApp(): void {
    const message = `Hi, I want to test bot ID: ${this.botId}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/923313014733?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  openWebhookGuide(): void {
    window.open('https://developers.facebook.com/docs/whatsapp/webhooks', '_blank', 'noopener,noreferrer');
  }

  refreshBotStatus(): void {
    this.whatsappService.getBotStatus(this.botId).subscribe({
      next: (status: BotStatus) => {
        this.botStatus = status;
        this.showNotification(`Bot status: ${status.status}`, 'info');
      },
      error: (error: any) => {
        this.showNotification('Failed to refresh bot status', 'error');
      }
    });
  }

  exportConfiguration(): void {
    const config = this.whatsappService.exportBotConfiguration(this.botId);
    if (config) {
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bot-config-${this.botId}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.showNotification('Configuration exported successfully', 'success');
    } else {
      this.showNotification('Failed to export configuration', 'error');
    }
  }

  importConfiguration(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          this.publishForm.patchValue(config.botConfiguration);
          this.botId = config.botConfiguration.botId;
          this.showNotification('Configuration imported successfully', 'success');
        } catch (error) {
          this.showNotification('Failed to import configuration', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  private httpsValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;
    if (!control.value.startsWith('https://')) {
      return { httpsRequired: true };
    }
    return null;
  }

  private phoneNumberValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`${type}-snackbar`],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  get isMetaCloudSelected(): boolean {
    return this.selectedApi === 'meta-cloud';
  }

  get isD360Selected(): boolean {
    return this.selectedApi === 'd360';
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
  }

  onChatClose(): void {
    this.showChat = false;
  }
}