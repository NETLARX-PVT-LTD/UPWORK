import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';

interface GeneralSettings {
  turnChatbotOff: boolean;
  emailTranscripts: string[];
  botInactiveWebhook: string;
  messageWebhook: string;
  autoTranslation: boolean;
  apiKey: string;
}

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
 templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  selectedBot = 'Bot 3';
  newEmail = '';
  emailList: string[] = [];
  apiKey = 'YICYYnkXPYpZKVgpux49Rn4t8r5vQZCCZJ96L';

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      turnChatbotOff: [false],
      botInactiveWebhook: [''],
      messageWebhook: [''],
      autoTranslation: [false]
    });
  }

  ngOnInit() {
    // Load saved settings if available
    this.loadSettings();
  }

  addEmail() {
    if (this.newEmail && this.isValidEmail(this.newEmail) && !this.emailList.includes(this.newEmail)) {
      this.emailList.push(this.newEmail);
      this.newEmail = '';
    }
  }

  removeEmail(index: number) {
    this.emailList.splice(index, 1);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get maskedApiKey(): string {
    if (this.apiKey.length <= 10) return this.apiKey;
    return this.apiKey.substring(0, 10) + '...';
  }

  copyApiKey() {
    navigator.clipboard.writeText(this.apiKey).then(() => {
      // You can add a toast notification here
      alert('API Key copied to clipboard!');
    });
  }

  onSave() {
    if (this.settingsForm.valid) {
      const formData = this.settingsForm.value;
      const settingsData: GeneralSettings = {
        ...formData,
        emailTranscripts: this.emailList,
        apiKey: this.apiKey
      };
      
      // Save to localStorage or send to your API
      localStorage.setItem('generalSettings', JSON.stringify(settingsData));
      
      console.log('Settings saved:', settingsData);
      alert('Settings saved successfully!');
    }
  }

  private loadSettings() {
    const savedSettings = localStorage.getItem('generalSettings');
    if (savedSettings) {
      const settings: GeneralSettings = JSON.parse(savedSettings);
      this.settingsForm.patchValue({
        turnChatbotOff: settings.turnChatbotOff,
        botInactiveWebhook: settings.botInactiveWebhook,
        messageWebhook: settings.messageWebhook,
        autoTranslation: settings.autoTranslation
      });
      this.emailList = settings.emailTranscripts || [];
      this.apiKey = settings.apiKey || this.apiKey;
    }
  }
}