// stripe-integration.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface StripeConfig {
  apiKey: string;
  secretKey: string;
  isActive: boolean;
}

@Component({
  selector: 'app-stripe-integration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
templateUrl: './stripe-integration.component.html',
  styleUrl: './stripe-integration.component.scss'
})
export class StripeIntegrationComponent implements OnInit {
  stripeForm: FormGroup;
  isLoading = false;
  isActivated = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.stripeForm = this.fb.group({
      apiKey: ['', [Validators.required]],
      secretKey: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Load existing configuration if available
    this.loadExistingConfig();
  }

  loadExistingConfig() {
    // Simulate loading existing configuration
    // In a real app, you'd call your API here
    const savedConfig = this.getStoredConfig();
    if (savedConfig.apiKey && savedConfig.secretKey) {
      this.stripeForm.patchValue({
        apiKey: savedConfig.apiKey,
        secretKey: savedConfig.secretKey
      });
      this.isActivated = true;
    }
  }

  onSubmit() {
    if (this.stripeForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      // Simulate API call
      setTimeout(() => {
        try {
          const formValue = this.stripeForm.value;
          
          // Validate API keys format (basic validation)
          if (!this.validateStripeKeys(formValue)) {
            throw new Error('Invalid Stripe API keys format');
          }

          // Save configuration
          this.saveConfig(formValue);
          
          this.successMessage = 'Stripe integration settings saved successfully!';
          this.isActivated = true;
          this.isLoading = false;
        } catch (error) {
          this.errorMessage = error instanceof Error ? error.message : 'Failed to save settings. Please try again.';
          this.isLoading = false;
        }
      }, 1500);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  removeSettings() {
    if (confirm('Are you sure you want to remove Stripe integration settings?')) {
      this.isLoading = true;
      this.clearMessages();

      // Simulate API call
      setTimeout(() => {
        this.stripeForm.reset();
        this.clearStoredConfig();
        this.successMessage = 'Stripe integration settings removed successfully!';
        this.isActivated = false;
        this.isLoading = false;
      }, 1000);
    }
  }

  toggleBotDropdown() {
    // Implement bot selection dropdown logic
    console.log('Bot dropdown toggled');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.stripeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.stripeForm.controls).forEach(key => {
      this.stripeForm.get(key)?.markAsTouched();
    });
  }

  private validateStripeKeys(config: StripeConfig): boolean {
    // Basic validation for Stripe key formats
    const apiKeyPattern = /^pk_test_|^pk_live_/;
    const secretKeyPattern = /^sk_test_|^sk_live_/;
    
    return apiKeyPattern.test(config.apiKey) && secretKeyPattern.test(config.secretKey);
  }

  private saveConfig(config: StripeConfig) {
    // In a real application, you would call your backend API
    // For this example, we'll use localStorage (Note: In production, never store sensitive data in localStorage)
    const configToStore = {
      apiKey: config.apiKey,
      secretKey: config.secretKey,
      isActive: true,
      lastUpdated: new Date().toISOString()
    };
    
    // In production, this should be an API call to your secure backend
    localStorage.setItem('stripe_config', JSON.stringify(configToStore));
  }

  private getStoredConfig(): Partial<StripeConfig> {
    try {
      const stored = localStorage.getItem('stripe_config');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private clearStoredConfig() {
    localStorage.removeItem('stripe_config');
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}