import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface AdvancedSettings {
  preferredLanguage: string;
  openChatbotOnLoad: boolean;
  hideInputFromWebsite: boolean;
  moveChatbotToLeft: boolean;
  deleteUserChatPermanently: boolean;
  humanHelpForm: boolean;
  startChatbotOnWidgetClick: boolean;
  botActivationTime: number;
  leadCollectionForm: string;
  chatbotSize: number;
  mobileChatbotSize: number;
  hideChatbotOnMobile: boolean;
  hideChatbotPopupOnMobileLoad: boolean;
  csatEnabled: boolean;
  csatQuestions: string[]; 
  urlExclusions: string[];
  ipExclusions: string[];
}

@Component({
  selector: 'app-advanced-settings',
  standalone:true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './advanced-settings.component.html',
  styleUrls: ['./advanced-settings.component.scss']
})
export class AdvancedSettingsComponent implements OnInit {
  
  settings: AdvancedSettings = {
    preferredLanguage: 'English',
    openChatbotOnLoad: true,
    hideInputFromWebsite: true,
    moveChatbotToLeft: true,
    deleteUserChatPermanently: true,
    humanHelpForm: true,
    startChatbotOnWidgetClick: true,
    botActivationTime: 60,
    leadCollectionForm: 'Name and Email Form',
    chatbotSize: 100,
    mobileChatbotSize: 100,
    hideChatbotOnMobile: true,
    hideChatbotPopupOnMobileLoad: true,
    csatEnabled: false,
    csatQuestions: [''],
    urlExclusions: [],
    ipExclusions: []
  };

  languages = [
    'English',
    'Spanish', 
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Dutch',
    'Russian',
    'Chinese',
    'Japanese'
  ];

  leadCollectionForms = [
    'Name and Email Form',
    'Email Only Form',
    'Name Only Form',
    'Custom Form',
    'No Form'
  ];

  urlExclusionText = '';
  ipExclusionText = '';

  constructor() { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // Load settings from your service/API
    console.log('Loading settings...');
  }

// Corrected Component Method
onChatbotSizeChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  this.settings.chatbotSize = Number(target.value); // Use Number() for a clean conversion
}

// Corrected Component Method for mobile size
onMobileChatbotSizeChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  this.settings.mobileChatbotSize = Number(target.value);
}

  addCsatQuestion(): void {
  // Add a new, empty question to the array
  this.settings.csatQuestions.push('');
  console.log('New CSAT question field added.');
}

removeCsatQuestion(index: number): void {
  // Remove the question at the specified index
  this.settings.csatQuestions.splice(index, 1);
  console.log('CSAT question removed at index:', index);
}

  saveSettings(): void {
    // Parse URL and IP exclusions
    this.settings.urlExclusions = this.urlExclusionText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    this.settings.ipExclusions = this.ipExclusionText
      .split('\n')
      .map(ip => ip.trim())
      .filter(ip => ip.length > 0);

    console.log('Saving settings:', this.settings);
    // Call your service to save settings
    this.saveToService();
  }

  saveMobileSettings(): void {
    console.log('Saving mobile settings...');
    this.saveToService();
  }

  saveCsatSettings(): void {
    console.log('Saving CSAT settings...');
    this.saveToService();
  }

  saveExclusionSettings(): void {
    this.saveSettings();
  }

  private saveToService(): void {
    // Implement your service call here
    // this.settingsService.updateSettings(this.settings).subscribe(...);
  }

  uploadLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('Logo uploaded:', file.name);
      // Handle file upload logic
    }
  }
}