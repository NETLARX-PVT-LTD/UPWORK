// src/app/chatbot-widget/chatbot-widget.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
}

interface ChatSession {
  id: string;
  messages: Message[];
  botConfig: any;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
   templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.scss']
})
export class ChatbotWidgetComponent implements OnInit, OnDestroy {
  isLandingPage: boolean = false;
  isMinimized: boolean = true;
  isSending: boolean = false;
  currentMessage: string = '';
  messages: Message[] = [];
  unreadCount: number = 0;

  // Configuration
  botName: string = 'Assistant';
  welcomeMessage: string = 'Hi! How can I help you today?';
  inputPlaceholder: string = 'Type your message...';
  primaryColor: string = '#4f46e5';
  showBranding: boolean = false;
  backgroundStyle: string = 'gradient';
  landingTitle: string = 'Chat with our AI Assistant';
  landingDescription: string = 'Get instant answers to your questions';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Check if this is a landing page
    this.isLandingPage = this.route.snapshot.url[0]?.path === 'landing';
    
    if (this.isLandingPage) {
      this.isMinimized = false;
      // Load landing page configuration
      this.loadLandingConfig();
    } else {
      // Load widget configuration from URL params or default
      this.loadWidgetConfig();
    }

    // Auto-open widget after a delay if it's the first visit
    if (!this.isLandingPage && this.isFirstVisit()) {
      setTimeout(() => {
        this.isMinimized = false;
      }, 2000);
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  loadWidgetConfig() {
    // Get configuration from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const botId = urlParams.get('id');
    
    if (botId) {
      const savedConfig = localStorage.getItem(`chatbot_${botId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        this.applyConfig(config);
      }
    }
  }

  loadLandingConfig() {
    const botId = this.route.snapshot.paramMap.get('id');
    if (botId) {
      const savedConfig = localStorage.getItem(`chatbot_${botId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        this.applyConfig(config);
        if (config.landingConfig) {
          this.landingTitle = config.landingConfig.title;
          this.landingDescription = config.landingConfig.description;
          this.backgroundStyle = config.landingConfig.backgroundStyle;
        }
      }
    }
  }

  applyConfig(config: any) {
    if (config.config) {
      this.botName = config.config.name || this.botName;
      this.welcomeMessage = config.config.greeting || this.welcomeMessage;
      this.inputPlaceholder = config.config.placeholder || this.inputPlaceholder;
      this.primaryColor = config.config.theme?.primaryColor || this.primaryColor;
      this.showBranding = config.config.showBranding ?? this.showBranding;
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    if (!this.isMinimized) {
      this.unreadCount = 0;
    }
  }

  async sendMessage() {
    if (!this.currentMessage.trim() || this.isSending) return;

    const userMessage: Message = {
      id: this.generateMessageId(),
      text: this.currentMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const messageToSend = this.currentMessage;
    this.currentMessage = '';
    this.isSending = true;

    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '',
      isUser: false,
      timestamp: new Date(),
      typing: true
    };
    this.messages.push(typingMessage);
    setTimeout(() => this.scrollToBottom(), 100);

    try {
      // Simulate API call
      const response = await this.callChatAPI(messageToSend);
      
      // Remove typing indicator
      this.messages = this.messages.filter(m => m.id !== 'typing');
      
      // Add bot response
      const botMessage: Message = {
        id: this.generateMessageId(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      this.messages.push(botMessage);
      
      // Update unread count if minimized
      if (this.isMinimized && !this.isLandingPage) {
        this.unreadCount++;
      }
      
    } catch (error) {
      // Remove typing indicator and show error
      this.messages = this.messages.filter(m => m.id !== 'typing');
      
      const errorMessage: Message = {
        id: this.generateMessageId(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      
      this.messages.push(errorMessage);
    } finally {
      this.isSending = false;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  private async callChatAPI(message: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple response logic (replace with actual API call)
    const responses = [
      "Thanks for your message! How can I assist you further?",
      "That's interesting! Let me help you with that.",
      "I understand. What would you like to know more about?",
      "Great question! Here's what I think...",
      "I'm here to help! Could you provide more details?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private scrollToBottom() {
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private isFirstVisit(): boolean {
    const visited = localStorage.getItem('chatbot_visited');
    if (!visited) {
      localStorage.setItem('chatbot_visited', 'true');
      return true;
    }
    return false;
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}