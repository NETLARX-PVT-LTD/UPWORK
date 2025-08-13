// whatsapp-publisher.component.ts (Updated with service integration)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WhatsappService, WhatsAppConfig, ApiTestResult, PublishResult } from '../shared/services/whatsapp.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

interface ApiOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  isOfficial: boolean;
}

interface BotConfig {
  botId: string;
  botName: string;
  phoneNumber: string;
  apiType: string;
  isPublished: boolean;
  testMode: boolean;
}

@Component({
  selector: 'app-whatsapp-publisher',
  standalone:true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './whatsapp-publisher.component.html',
  styleUrls: ['./whatsapp-publisher.component.scss']
})
export class WhatsappPublisherComponent implements OnInit {
  publishForm: FormGroup;
  selectedApi: string = '';
  botConfig: BotConfig = {
    botId: '',
    botName: '',
    phoneNumber: '',
    apiType: '',
    isPublished: false,
    testMode: false
  };
  
  apiOptions: ApiOption[] = [
    {
      id: 'meta-cloud',
      name: 'Official Meta Cloud WhatsApp API',
      description: 'Use Meta\'s official WhatsApp Business API',
      icon: '📱',
      isOfficial: true
    },
    {
      id: 'd360',
      name: 'D360 API',
      description: 'Third-party WhatsApp API solution',
      icon: '🔄',
      isOfficial: false
    }
  ];

  testingInProgress = false;
  publishingInProgress = false;
  testResults: ApiTestResult | null = null;
  currentStep = 1;
  totalSteps = 4;

  // Demo testing details
  demoNumber = '+923313014733';
  demoInstructions = [
    'Before applying for WhatsApp Business account, you can test out your bot on WhatsApp',
    `To do that, you can message Hi to our official WhatsApp number ${this.demoNumber}`,
    'Upon messaging Hi, you will be asked to enter the ID of your Bot i.e: 131801. After entering the bot ID your test mode will start.',
    'You can now test out your bot. In case you want to exit testing mode, You can do that by typing Exit Test'
  ];

  constructor(
    private fb: FormBuilder,
    private whatsappService: WhatsappService
  ) {
    this.publishForm = this.fb.group({
      botName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      apiType: ['', Validators.required],
      webhookUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      accessToken: ['', Validators.required],
      verifyToken: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateBotId();
    this.setupFormValidators();
  }

  private setupFormValidators(): void {
    // Add custom phone number validator
    this.publishForm.get('phoneNumber')?.setValidators([
      Validators.required,
      (control) => {
        if (control.value && !this.whatsappService.isValidPhoneNumber(control.value)) {
          return { invalidPhoneNumber: true };
        }
        return null;
      }
    ]);

    // Format phone number on blur
    this.publishForm.get('phoneNumber')?.valueChanges.subscribe(value => {
      if (value) {
        const formatted = this.whatsappService.formatPhoneNumber(value);
        if (formatted !== value) {
          this.publishForm.patchValue({ phoneNumber: formatted }, { emitEvent: false });
        }
      }
    });
  }

  generateBotId(): void {
    this.botConfig.botId = this.whatsappService.generateBotId();
  }

  selectApi(apiId: string): void {
    this.selectedApi = apiId;
    this.publishForm.patchValue({ apiType: apiId });
    this.botConfig.apiType = apiId;
  }

  nextStep(): void {
    if (this.canProceedToNextStep()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.selectedApi;
      case 2:
        return this.publishForm.valid;
      case 3:
        return this.testResults?.success || false;
      default:
        return true;
    }
  }

  async testBot(): Promise<void> {
    if (this.publishForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.testingInProgress = true;
    this.testResults = null;
    
    try {
      const config: WhatsAppConfig = {
        botId: this.botConfig.botId,
        botName: this.publishForm.value.botName,
        phoneNumber: this.publishForm.value.phoneNumber,
        apiType: this.publishForm.value.apiType as 'meta-cloud' | 'd360',
        webhookUrl: this.publishForm.value.webhookUrl,
        accessToken: this.publishForm.value.accessToken,
        verifyToken: this.publishForm.value.verifyToken
      };

      this.testResults = await this.whatsappService.testWhatsAppConnection(config).toPromise() as ApiTestResult;
      
      if (this.testResults.success) {
        this.botConfig.testMode = true;
        
        // Also validate webhook if test was successful
        try {
          await this.whatsappService.validateWebhook(config.webhookUrl, config.verifyToken).toPromise();
        } catch (error) {
          console.warn('Webhook validation failed:', error);
          // Don't fail the entire test if webhook validation fails
        }
      }
      
    } catch (error: any) {
      console.error('Test error:', error);
      this.testResults = {
        success: false,
        message: error.message || 'Failed to connect to WhatsApp API',
        error: error
      };
    } finally {
      this.testingInProgress = false;
    }
  }

  async publishBot(): Promise<void> {
    if (this.publishForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.publishingInProgress = true;
    
    try {
      const config: WhatsAppConfig = {
        botId: this.botConfig.botId,
        botName: this.publishForm.value.botName,
        phoneNumber: this.publishForm.value.phoneNumber,
        apiType: this.publishForm.value.apiType as 'meta-cloud' | 'd360',
        webhookUrl: this.publishForm.value.webhookUrl,
        accessToken: this.publishForm.value.accessToken,
        verifyToken: this.publishForm.value.verifyToken
      };

      const result = await this.whatsappService.publishBot(config).toPromise() as PublishResult;
      
      if (result.success) {
        this.botConfig = {
          ...this.botConfig,
          botName: config.botName,
          phoneNumber: config.phoneNumber,
          isPublished: true
        };

        this.showSuccessMessage('Bot published successfully to WhatsApp!');
        
        // Optionally check bot status after publishing
        this.checkBotStatus();
      }
      
    } catch (error: any) {
      console.error('Publish error:', error);
      this.showErrorMessage(error.message || 'Failed to publish bot. Please try again.');
    } finally {
      this.publishingInProgress = false;
    }
  }

  private async checkBotStatus(): Promise<void> {
    try {
      const status = await this.whatsappService.getBotStatus(this.botConfig.botId).toPromise();
      console.log('Bot status:', status);
    } catch (error) {
      console.warn('Could not fetch bot status:', error);
    }
  }

  openWhatsAppTest(): void {
    const whatsappUrl = this.whatsappService.getDemoWhatsAppUrl(this.botConfig.botId, this.demoNumber);
    window.open(whatsappUrl, '_blank');
  }

  // Utility methods
  private showSuccessMessage(message: string): void {
    // You can replace this with your preferred notification system
    alert(message);
  }

  private showErrorMessage(message: string): void {
    // You can replace this with your preferred notification system
    alert(message);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.publishForm.controls).forEach(key => {
      const control = this.publishForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.publishForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.publishForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `Please enter a valid ${this.getFieldDisplayName(fieldName)}`;
      if (field.errors['invalidPhoneNumber']) return 'Please enter a valid phone number with country code';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'botName': 'Bot Name',
      'phoneNumber': 'Phone Number',
      'webhookUrl': 'Webhook URL',
      'accessToken': 'Access Token',
      'verifyToken': 'Verify Token',
      'apiType': 'API Type'
    };
    return displayNames[fieldName] || fieldName;
  }

  // Getters for template
  get isStep1Valid(): boolean {
    return !!this.selectedApi;
  }

  get isStep2Valid(): boolean {
    return this.publishForm.valid;
  }

  get isStep3Valid(): boolean {
    return this.testResults?.success || false;
  }

  get canPublish(): boolean {
    return this.isStep2Valid && this.isStep3Valid && !this.publishingInProgress;
  }
}