import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // <-- Corrected path to use a path alias

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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
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

  private readonly apiUrl = `${environment.apiUrl}/Settings`; // <-- Use the environment variable

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.http.get<AdvancedSettings>(this.apiUrl).subscribe({
      next: (data) => {
        // Map the received data to your settings object
        this.settings = data;
        // Convert array data back to text for the textareas
        this.urlExclusionText = this.settings.urlExclusions.join('\n');
        this.ipExclusionText = this.settings.ipExclusions.join('\n');
        console.log('Settings loaded:', this.settings);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
      }
    });
  }

  onChatbotSizeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settings.chatbotSize = Number(target.value);
  }

  onMobileChatbotSizeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settings.mobileChatbotSize = Number(target.value);
  }

  addCsatQuestion(): void {
    this.settings.csatQuestions.push('');
    console.log('New CSAT question field added.');
  }

  removeCsatQuestion(index: number): void {
    this.settings.csatQuestions.splice(index, 1);
    console.log('CSAT question removed at index:', index);
  }

  // A single save method to be called by all "Save" buttons in the HTML
  saveSettings(): void {
    // Parse URL and IP exclusions from the textareas
    this.settings.urlExclusions = this.urlExclusionText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    this.settings.ipExclusions = this.ipExclusionText
      .split('\n')
      .map(ip => ip.trim())
      .filter(ip => ip.length > 0);
      
    // Filter out any empty strings from the CSAT questions array
    this.settings.csatQuestions = this.settings.csatQuestions.filter(q => q.length > 0);

    this.http.post(this.apiUrl, this.settings).subscribe({
      next: (response) => {
        console.log('Settings saved successfully!', response);
      },
      error: (error) => {
        console.error('Error saving settings:', error);
      }
    });
  }
  
  // These helper methods are no longer needed, as they now call the main saveSettings()
  saveMobileSettings(): void {
    this.saveSettings();
  }

  saveCsatSettings(): void {
    this.saveSettings();
  }

  saveExclusionSettings(): void {
    this.saveSettings();
  }

  uploadLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('Logo uploaded:', file.name);
      // Handle file upload logic
    }
  }
}
