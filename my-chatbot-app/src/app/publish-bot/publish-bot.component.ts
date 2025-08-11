// src/app/publish-bot/publish-bot.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ChatbotConfig {
  id: string;
  name: string;
  story: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    borderRadius: string;
  };
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
  selectedBotId: string = 'bot3';
  showColorPicker: boolean = false;
  showCodeModal: boolean = false;
  showEmailModal: boolean = false;
  generatedCode: string = '';
  codeCopied: boolean = false;
  developerEmail: string = '';
  emailMessage: string = '';
  apiKey: string = '';
  landingUrl: string = '';

  config: ChatbotConfig = {
    id: '',
    name: 'My Chatbot',
    story: 'hello',
    theme: {
      primaryColor: '#4f46e5',
      secondaryColor: '#f3f4f6',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px'
    },
    position: 'bottom-right',
    size: 'medium',
    greeting: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    allowFullscreen: true,
    showBranding: false,
    backgroundStyle: 'gradient'
  };

  landingConfig: LandingConfig = {
    title: 'Chat with our AI Assistant',
    description: 'Get instant answers to your questions',
    backgroundStyle: 'gradient'
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.config.id = this.generateBotId();
    this.apiKey = this.generateApiKey();
    this.landingUrl = `${window.location.origin}/landing/${this.config.id}`;
  }

  selectMainOption(option: string) {
    if (option === 'embed') {
      // Do nothing, just visual feedback
    } else if (option === 'email') {
      this.showEmailModal = true;
    }
  }

  generateInlineCode() {
    this.generatedCode = `<!-- Chatbot Widget -->
<div id="chatbot-widget-${this.config.id}"></div>
<script>
  window.ChatbotConfig = {
    id: "${this.config.id}",
    story: "${this.config.story}",
    primaryColor: "${this.config.theme.primaryColor}",
    position: "${this.config.position}",
    size: "${this.config.size}"
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

  saveLandingConfig() {
    // Save the landing configuration
    const botData = {
      id: this.config.id,
      config: this.config,
      landingConfig: this.landingConfig,
      createdAt: new Date().toISOString()
    };
    
    // In a real app, this would be sent to your backend
    console.log('Saving landing config:', botData);
    
    // Show success feedback
    alert('Landing page configuration saved successfully!');
  }

  copyApiKey() {
    navigator.clipboard.writeText(this.apiKey).then(() => {
      // Show visual feedback
      console.log('API key copied!');
    });
  }

  copyCode() {
    navigator.clipboard.writeText(this.generatedCode).then(() => {
      this.codeCopied = true;
      setTimeout(() => this.codeCopied = false, 2000);
    });
  }

  closeModal() {
    this.showCodeModal = false;
    this.codeCopied = false;
  }

  closeEmailModal() {
    this.showEmailModal = false;
    this.developerEmail = '';
    this.emailMessage = '';
  }

  sendEmail() {
    if (!this.developerEmail) {
      alert('Please enter a valid email address.');
      return;
    }

    // In a real app, this would send an email via your backend
    const emailData = {
      to: this.developerEmail,
      subject: 'Chatbot Integration Details',
      botId: this.config.id,
      apiKey: this.apiKey,
      landingUrl: this.landingUrl,
      message: this.emailMessage,
      embedCode: this.generateEmailEmbedCode()
    };

    console.log('Sending email:', emailData);
    alert('Integration details sent successfully!');
    this.closeEmailModal();
  }

  private generateEmailEmbedCode(): string {
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

  private generateBotId(): string {
    return 'bot_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  private generateApiKey(): string {
    return 'YlCYYnkXPYpZKVgpux48Rn4lBr5vQZCCZJ9blXsN';
  }
}