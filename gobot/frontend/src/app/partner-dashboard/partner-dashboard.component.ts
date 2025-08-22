import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ColorOption {
  id: string;
  value: string;
  name: string;
}

@Component({
  selector: 'app-partner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './partner-dashboard.component.html',
  styleUrls: ['./partner-dashboard.component.scss']
})
export class PartnerDashboardComponent implements OnInit {
  userName = 'Vijai';
  currentPage = 'whitelabel'; // 'whitelabel' or 'email'
  currentStep = 1;
  selectedFileName = '';
  showColorPickerModal = false;
  customColor = '#000000';
  colorPickerType: 'primary' | 'secondary' = 'primary';
// ADD THESE NEW PROPERTIES FOR EMAIL SETTINGS
  isEmailLoading = false;
  showEmailPassword = false;
  // touchedEmailFields: { [key: string]: boolean } = {};
  // Email Settings specific properties
  isLoading = false;
  showPassword = false;
  touchedEmailFields: { [key: string]: boolean } = {};

  whitelabelForm: FormGroup;
  emailForm: FormGroup;

  primaryColors: ColorOption[] = [
    { id: '1', value: '#20B2AA', name: 'Light Sea Green' },
    { id: '2', value: '#FF6B6B', name: 'Coral' },
    { id: '3', value: '#4ECDC4', name: 'Medium Turquoise' },
    { id: '4', value: '#FF69B4', name: 'Hot Pink' },
    { id: '5', value: '#40E0D0', name: 'Turquoise' }
  ];

  secondaryColors: ColorOption[] = [
    { id: '1', value: '#20B2AA', name: 'Light Sea Green' },
    { id: '2', value: '#FF6B6B', name: 'Coral' },
    { id: '3', value: '#4169E1', name: 'Royal Blue' },
    { id: '4', value: '#FF1493', name: 'Deep Pink' },
    { id: '5', value: '#FF69B4', name: 'Hot Pink' }
  ];

  constructor(private fb: FormBuilder) {
    // Whitelabel Form
    this.whitelabelForm = this.fb.group({
      companyName: ['Botsify', Validators.required],
      maskUrl: ['app.botsify.com', Validators.required],
      logo: [''],
      primaryColor: ['#20B2AA'],
      secondaryColor: ['#FF1493'],
      enableCustomDomain: [false],
      enableSSL: [false],
      sslProvider: ['']
    });

    // ADD THIS EMAIL FORM INITIALIZATION
    this.emailForm = this.fb.group({
      senderName: ['', Validators.required],
      securityProtocol: ['TLS', Validators.required],
      smtpHost: ['', Validators.required],
      smtpPort: ['587', [Validators.required, Validators.pattern(/^\d+$/)]],
      smtpUsername: ['', Validators.required],
      smtpEmail: ['info@email.com', [Validators.required, Validators.email]],
      smtpPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Initialize forms or load existing data
    this.loadEmailSettings();
  }

  // Navigation Methods
  setCurrentPage(page: 'whitelabel' | 'email') {
    this.currentPage = page;
    if (page === 'whitelabel') {
      this.currentStep = 1; // Reset to first step when switching to whitelabel
    }
  }

  // Whitelabel Methods (existing)
  setCurrentStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.whitelabelForm.patchValue({ logo: file });
    }
  }

  selectColor(colorType: 'primaryColor' | 'secondaryColor', color: string) {
    this.whitelabelForm.patchValue({ [colorType]: color });
  }

  showColorPicker(type: 'primary' | 'secondary') {
    this.colorPickerType = type;
    this.showColorPickerModal = true;
  }

  closeColorPicker() {
    this.showColorPickerModal = false;
  }

  addCustomColor() {
    const colorArray = this.colorPickerType === 'primary' ? this.primaryColors : this.secondaryColors;
    const newColor: ColorOption = {
      id: Date.now().toString(),
      value: this.customColor,
      name: 'Custom Color'
    };
    
    colorArray.push(newColor);
    
    const colorType = this.colorPickerType === 'primary' ? 'primaryColor' : 'secondaryColor';
    this.selectColor(colorType, this.customColor);
    
    this.closeColorPicker();
  }

  // Whitelabel Form Submit
  onSubmit() {
    if (this.whitelabelForm.valid) {
      console.log('Whitelabel Form Data:', this.whitelabelForm.value);
      this.showSuccessMessage('Whitelabel settings saved successfully!');
      this.setCurrentStep(2);
    } else {
      console.log('Whitelabel form is invalid');
      this.whitelabelForm.markAllAsTouched();
    }
  }

  testDomain() {
    console.log('Testing domain...');
    this.showSuccessMessage('Domain test completed successfully!');
    this.setCurrentStep(3);
  }

  getHelp() {
    console.log('Opening help documentation...');
    this.showInfoMessage('Help documentation will be available soon.');
  }

  resetSettings() {
    console.log('Resetting whitelabel settings...');
    
    this.whitelabelForm.patchValue({
      companyName: 'Botsify',
      maskUrl: 'app.botsify.com',
      logo: '',
      primaryColor: '#20B2AA',
      secondaryColor: '#FF1493',
      enableCustomDomain: false,
      enableSSL: false,
      sslProvider: ''
    });
    
    this.selectedFileName = '';
    this.setCurrentStep(1);
    this.showSuccessMessage('Settings have been reset to default values.');
  }

  installSSL() {
    console.log('Installing SSL certificate...');
    this.showSuccessMessage('SSL certificate installation initiated. You will receive an email confirmation shortly.');
  }

  playVideo() {
    console.log('Playing tutorial video...');
    this.showInfoMessage('Tutorial video will open in a new window.');
  }

  // Email Settings Methods
  loadEmailSettings() {
    // Simulate loading existing email settings
    const existingSettings = {
      senderName: '',
      securityProtocol: 'TLS',
      smtpHost: '',
      smtpPort: '587',
      smtpUsername: '',
      smtpEmail: 'info@email.com',
      smtpPassword: ''
    };

    this.emailForm.patchValue(existingSettings);
  }

  onEmailSubmit() {
    if (this.emailForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Email settings saved:', this.emailForm.value);
        this.showSuccessMessage('Email settings saved successfully!');
        this.isLoading = false;
      }, 2000);
    } else {
      this.emailForm.markAllAsTouched();
      this.showErrorMessage('Please fill in all required fields correctly.');
    }
  }

  testEmailConnection() {
    if (this.emailForm.valid) {
      this.isLoading = true;
      
      // Simulate SMTP connection test
      setTimeout(() => {
        const isSuccess = Math.random() > 0.3; // 70% success rate for demo
        
        if (isSuccess) {
          this.showSuccessMessage('SMTP connection test successful!');
        } else {
          this.showErrorMessage('SMTP connection failed. Please check your settings.');
        }
        
        this.isLoading = false;
      }, 3000);
    } else {
      this.showErrorMessage('Please fill in all required fields before testing.');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  resetEmailForm() {
    this.emailForm.reset({
      senderName: '',
      securityProtocol: 'TLS',
      smtpHost: '',
      smtpPort: '587',
      smtpUsername: '',
      smtpEmail: '',
      smtpPassword: ''
    });
    
    this.touchedEmailFields = {};
    this.showInfoMessage('Email settings have been reset.');
  }

  // Email Validation Methods
  isEmailFieldInvalid(fieldName: string): boolean {
    const field = this.emailForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.touchedEmailFields[fieldName]));
  }

  getEmailFieldError(fieldName: string): string {
    const field = this.emailForm.get(fieldName);
    
    if (field?.errors?.['required']) {
      return `${this.getEmailFieldLabel(fieldName)} is required`;
    }
    
    if (field?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    
    if (field?.errors?.['pattern'] && fieldName === 'smtpPort') {
      return 'Port must be a valid number';
    }
    
    return '';
  }

  private getEmailFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      senderName: 'Sender Name',
      securityProtocol: 'Security Protocol',
      smtpHost: 'SMTP Host',
      smtpPort: 'SMTP Port',
      smtpUsername: 'SMTP Username',
      smtpEmail: 'SMTP Email',
      smtpPassword: 'SMTP Password'
    };
    
    return labels[fieldName] || fieldName;
  }

  onEmailFieldBlur(fieldName: string) {
    this.touchedEmailFields[fieldName] = true;
  }

  // Utility methods for showing messages
  private showSuccessMessage(message: string) {
    alert(`✅ ${message}`);
  }

  private showInfoMessage(message: string) {
    alert(`ℹ️ ${message}`);
  }

  private showErrorMessage(message: string) {
    alert(`❌ ${message}`);
  }

  // Utility methods for Whitelabel
  getCurrentStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Configure Basic Settings';
      case 2:
        return 'Domain Configuration';
      case 3:
        return 'SSL Setup';
      default:
        return 'Whitelabel Settings';
    }
  }

  isStepCompleted(step: number): boolean {
    switch (step) {
      case 1:
        return this.whitelabelForm.valid;
      case 2:
        return this.currentStep > 2;
      case 3:
        return false;
      default:
        return false;
    }
  }

  getMaskUrl(): string {
    return this.whitelabelForm.get('maskUrl')?.value || 'app.xyz.com';
  }

  getCompanyName(): string {
    return this.whitelabelForm.get('companyName')?.value || 'Your Company';
  }
}