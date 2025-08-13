// src/app/publish-bot/publish-bot.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// This is a simplified version of the service provided in the original code.
// In a real application, you would import the real services.
interface ChatbotBlock { /* ... */ }
interface Connection { /* ... */ }
interface AvailableStory { /* ... */ }
class ChatbotSerializationService {
  constructor() {}
}

interface ChatbotConfig {
  id: string;
  name: string;
  story: string;
  theme: {
    primaryColor: string;
  };
  // Removed other theme properties for simplification based on new HTML
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large';
  greeting: string;
  placeholder: string;
  allowFullscreen: boolean;
  showBranding: boolean;
  backgroundStyle: 'gradient' | 'plain-primary' | 'plain-secondary';
}

interface LandingConfig {
  title: string;
  description: string;
  backgroundStyle: 'gradient' | 'plain-primary' | 'plain-secondary';
}

@Component({
  selector: 'app-publish-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publish-bot.component.html',
  styleUrls: ['./publish-bot.component.scss']
})
export class PublishBotComponent implements OnInit {
  // --- UI State Variables ---
  selectedBotId: string = 'bot3';
  showCodeModal: boolean = false;
  showEmailModal: boolean = false;
  showColorPickerPopup: boolean = false; // Controls the visibility of the custom color picker popup
  generatedCode: string = '';
  codeCopied: boolean = false;
  apiKeyCopied: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  temporaryColor: string = '#4f46e5'; // Holds the color selected in the popup before confirmation

  // --- Predefined Colors for the picker ---
  predefinedColors: string[] = [
    '#f53c3c', '#e74c3c', '#d35400', '#f39c12',
    '#f1c40f', '#2ecc71', '#1abc9c', '#3498db',
    '#2980b9', '#9b59b6', '#8e44ad', '#34495e'
  ];
  
  // --- Chatbot Configuration ---
  config: ChatbotConfig = {
    id: '',
    name: 'My Chatbot',
    story: 'hello',
    theme: {
      primaryColor: '#4f46e5',
    },
    position: 'bottom-right',
    size: 'medium',
    greeting: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    allowFullscreen: true,
    showBranding: false,
    backgroundStyle: 'gradient'
  };

  // --- Landing Page Configuration ---
  landingConfig: LandingConfig = {
    title: 'Chat with our AI Assistant',
    description: 'Get instant answers to your questions',
    backgroundStyle: 'gradient'
  };

  // --- API and URL Data ---
  developerEmail: string = '';
  emailMessage: string = '';
  apiKey: string = '';
  landingUrl: string = '';
  
  constructor(private router: Router) {}

  ngOnInit() {
    this.config.id = this.generateBotId();
    this.apiKey = this.generateApiKey();
    this.landingUrl = `${window.location.origin}/landing/${this.config.id}`;
    this.temporaryColor = this.config.theme.primaryColor;
  }

  /**
   * Toggles the main options, although the new HTML uses a direct click for the modals.
   * This is kept for potential future use or consistency.
   */
  selectMainOption(option: string) {
    if (option === 'email') {
      this.showEmailModal = true;
    }
  }

  /**
   * Toggles the visibility of the custom color picker popup.
   */
  toggleColorPickerPopup() {
    this.showColorPickerPopup = !this.showColorPickerPopup;
    if (this.showColorPickerPopup) {
      this.temporaryColor = this.config.theme.primaryColor;
    }
  }

  /**
   * Selects a color from the swatch grid.
   */
  selectSwatchColor(color: string) {
    this.temporaryColor = color;
  }
  
  /**
   * Confirms the color selection and closes the popup.
   */
  confirmColor() {
    this.config.theme.primaryColor = this.temporaryColor;
    this.toggleColorPickerPopup();
  }

  /**
   * Cancels the color selection and closes the popup.
   */
  cancelColor() {
    this.toggleColorPickerPopup();
  }

  /**
   * Generates the embed code snippet based on the current configuration.
   * This is what a user will paste into their website's HTML.
   */
  generateInlineCode() {
    this.generatedCode = `<!-- Chatbot Widget -->
<div id="chatbot-widget-${this.config.id}"></div>
<script>
  window.ChatbotConfig = {
    id: "${this.config.id}",
    story: "${this.config.story}",
    primaryColor: "${this.config.theme.primaryColor}",
    backgroundStyle: "${this.landingConfig.backgroundStyle}"
  };
  
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/assets/chatbot-embed.js';
    script.async = true;
    document.head.appendChild(script);
    
    script.onload = function() {
      window.ChatbotWidget.init({
        containerId: 'chatbot-widget-${this.config.id}',
        widgetUrl: '${window.location.origin}/chatbot-widget?id=${this.config.id}',
        config: window.ChatbotConfig
      });
    };
  })();
</script>`;
    this.showCodeModal = true;
  }

  /**
   * Simulates saving the landing page configuration to a backend.
   * In a real app, this would be an HTTP POST request.
   */
  saveLandingConfig() {
    const botData = {
      id: this.config.id,
      config: this.config,
      landingConfig: this.landingConfig,
      apiKey: this.apiKey, // Including API key in save data
      createdAt: new Date().toISOString()
    };
    
    // Simulating API call
    console.log('Saving landing config:', botData);
    this.showToastMessage('Landing page configuration saved successfully!', 'success');
  }

  /**
   * Copies the API key to the clipboard and shows a toast notification.
   */
  copyApiKey() {
    navigator.clipboard.writeText(this.apiKey).then(() => {
      this.apiKeyCopied = true;
      this.showToastMessage('API Key copied to clipboard!', 'success');
      setTimeout(() => this.apiKeyCopied = false, 2000);
    });
  }

  /**
   * Copies the embed code to the clipboard and shows a toast notification.
   */
  copyCode() {
    navigator.clipboard.writeText(this.generatedCode).then(() => {
      this.codeCopied = true;
      this.showToastMessage('Embed code copied to clipboard!', 'success');
      setTimeout(() => this.codeCopied = false, 2000);
    });
  }

  /**
   * Closes the code generation modal.
   */
  closeModal() {
    this.showCodeModal = false;
    this.codeCopied = false;
  }

  /**
   * Closes the email modal.
   */
  closeEmailModal() {
    this.showEmailModal = false;
    this.developerEmail = '';
    this.emailMessage = '';
  }

  /**
   * Simulates sending an email with the chatbot details to a developer.
   * In a real app, this would be an API call to an email service on the backend.
   */
  sendEmail() {
    if (!this.developerEmail || !this.isValidEmail(this.developerEmail)) {
      this.showToastMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Simulating API call
    const emailData = {
      to: this.developerEmail,
      subject: `Chatbot Integration Details for ${this.config.name}`,
      botId: this.config.id,
      apiKey: this.apiKey,
      landingUrl: this.landingUrl,
      message: this.emailMessage,
      embedCode: this.generatedEmailEmbedCode()
    };

    console.log('Sending email:', emailData);
    this.showToastMessage('Integration details sent successfully!', 'success');
    this.closeEmailModal();
  }

  /**
   * Generates a simplified embed code for the email message.
   */
  private generatedEmailEmbedCode(): string {
    return `<!-- Chatbot Widget -->
<div id="chatbot-widget-${this.config.id}"></div>
<script>
  window.ChatbotConfig = {
    id: "${this.config.id}",
    story: "${this.config.story}",
    primaryColor: "${this.config.theme.primaryColor}"
  };
  
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/assets/chatbot-embed.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;
  }

  /**
   * Generates a more robust unique ID for the bot.
   */
  private generateBotId(): string {
    return `bot_${(Math.random().toString(36).substring(2, 9))}-${Date.now().toString(36)}`;
  }

  /**
   * Generates a mock API key. In a real app, this would come from a backend.
   */
  private generateApiKey(): string {
    return 'YlCYYnkXPYpZKVgpux48Rn4lBr5vQZCCZJ9blXsN';
  }

  /**
   * Shows a toast notification with a message and type.
   */
  private showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  /**
   * Simple email validation helper.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}