// Updated chatbot-widget.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
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

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.scss']
})
export class ChatbotWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  isLandingPage: boolean = false;
  isMinimized: boolean = true; // Start minimized for widget mode
  isSending: boolean = false;
  currentMessage: string = '';
  messages: Message[] = [];
  unreadCount: number = 0;
  private shouldScrollToBottom: boolean = false;

  // Configuration with defaults
  botName: string = 'Assistant';
  welcomeMessage: string = 'Hi! How can I help you today?';
  inputPlaceholder: string = 'Type your message...';
  primaryColor: string = '#4f46e5';
  showBranding: boolean = false;
  backgroundStyle: string = 'gradient';
  landingTitle: string = 'Chat with our AI Assistant';
  landingDescription: string = 'Get instant answers to your questions';
  position: string = 'bottom-right';
  size: string = 'medium';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Check if this is a landing page
    this.isLandingPage = this.route.snapshot.url[0]?.path === 'landing';
    
    if (this.isLandingPage) {
      this.isMinimized = false; // Always open on landing page
      this.loadLandingConfig();
    } else {
      this.isMinimized = true; // Start minimized for widget
      this.loadWidgetConfig();
    }

    // Listen for messages from parent window (embed script)
    window.addEventListener('message', this.handleParentMessage.bind(this));
    
    // Send ready message to parent
    this.sendMessageToParent({ type: 'chatbot-ready' });

    console.log('Chatbot Widget initialized:', {
      isLandingPage: this.isLandingPage,
      isMinimized: this.isMinimized,
      botName: this.botName,
      primaryColor: this.primaryColor
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.handleParentMessage.bind(this));
  }

  loadWidgetConfig() {
    // Get configuration from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    this.botName = urlParams.get('name') || this.botName;
    this.welcomeMessage = urlParams.get('greeting') || this.welcomeMessage;
    this.inputPlaceholder = urlParams.get('placeholder') || this.inputPlaceholder;
    this.primaryColor = urlParams.get('primaryColor') || this.primaryColor;
    this.backgroundStyle = urlParams.get('backgroundStyle') || this.backgroundStyle;
    this.position = urlParams.get('position') || this.position;
    this.size = urlParams.get('size') || this.size;
    this.showBranding = urlParams.get('showBranding') === 'true';

    // Also check for config passed through the embed script
    try {
      if ((window as any).parent && (window as any).parent.ChatbotConfig) {
        const config = (window as any).parent.ChatbotConfig;
        this.applyConfigObject(config);
      }
    } catch (e) {
      // Cross-origin access might be blocked, that's okay
    }

    console.log('Widget Config Loaded:', {
      botName: this.botName,
      primaryColor: this.primaryColor,
      position: this.position,
      size: this.size,
      isMinimized: this.isMinimized
    });
  }

  loadLandingConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    
    this.landingTitle = urlParams.get('title') || this.landingTitle;
    this.landingDescription = urlParams.get('description') || this.landingDescription;
    this.backgroundStyle = urlParams.get('backgroundStyle') || this.backgroundStyle;
    this.primaryColor = urlParams.get('primaryColor') || this.primaryColor;
    this.botName = urlParams.get('name') || this.botName;
    this.welcomeMessage = urlParams.get('greeting') || this.welcomeMessage;
  }

  applyConfigObject(config: any) {
    if (config.name) this.botName = config.name;
    if (config.greeting) this.welcomeMessage = config.greeting;
    if (config.placeholder) this.inputPlaceholder = config.placeholder;
    if (config.primaryColor) this.primaryColor = config.primaryColor;
    if (config.position) this.position = config.position;
    if (config.size) this.size = config.size;
    if (config.showBranding !== undefined) this.showBranding = config.showBranding;
  }

  handleParentMessage(event: MessageEvent) {
    // Handle messages from parent window (embed script)
    if (event.data && typeof event.data === 'object') {
      switch (event.data.type) {
        case 'chatbot-toggle':
          this.toggleMinimize();
          break;
        case 'chatbot-send-message':
          this.receiveExternalMessage(event.data.message);
          break;
        case 'chatbot-minimize':
          this.isMinimized = true;
          break;
        case 'chatbot-maximize':
          this.isMinimized = false;
          this.unreadCount = 0;
          break;
      }
    }
  }

  sendMessageToParent(data: any) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(data, '*');
      }
    } catch (e) {
      // Cross-origin restrictions might prevent this, that's okay
      console.log('Could not send message to parent:', e);
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    
    if (!this.isMinimized) {
      this.unreadCount = 0;
      // Scroll to bottom when opening
      setTimeout(() => {
        this.shouldScrollToBottom = true;
      }, 100);
    }
    
    // Notify parent window
    this.sendMessageToParent({
      type: this.isMinimized ? 'chatbot-minimized' : 'chatbot-maximized'
    });
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
    this.shouldScrollToBottom = true;

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '',
      isUser: false,
      timestamp: new Date(),
      typing: true
    };
    this.messages.push(typingMessage);
    this.shouldScrollToBottom = true;

    // Notify parent about new message
    this.sendMessageToParent({
      type: 'chatbot-new-message',
      message: messageToSend,
      isUser: true
    });

    try {
      const response = await this.callChatAPI(messageToSend);
      
      // Remove typing indicator
      this.messages = this.messages.filter(m => m.id !== 'typing');
      
      const botMessage: Message = {
        id: this.generateMessageId(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      this.messages.push(botMessage);
      this.shouldScrollToBottom = true;
      
      // Update unread count if minimized
      if (this.isMinimized && !this.isLandingPage) {
        this.unreadCount++;
        this.sendMessageToParent({
          type: 'chatbot-notification',
          count: this.unreadCount
        });
      }
      
      // Notify parent about bot response
      this.sendMessageToParent({
        type: 'chatbot-new-message',
        message: response,
        isUser: false
      });
      
    } catch (error) {
      this.messages = this.messages.filter(m => m.id !== 'typing');
      
      const errorMessage: Message = {
        id: this.generateMessageId(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      
      this.messages.push(errorMessage);
      this.shouldScrollToBottom = true;
    } finally {
      this.isSending = false;
    }
  }

  private receiveExternalMessage(message: string) {
    if (message && message.trim()) {
      this.currentMessage = message;
      this.sendMessage();
    }
  }

  private async callChatAPI(message: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple response logic - replace with actual API call
    const responses = [
      `Thanks for asking about "${message}". How can I help you further?`,
      "That's a great question! Let me provide you with some information.",
      "I understand your inquiry. Here's what I can tell you...",
      "Interesting! I'd be happy to assist you with that.",
      "Let me help you with that query.",
      "I see what you're asking about. Here's my response...",
      "That's something I can definitely help with!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Utility function to darken a color
  darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const B = (num >> 8 & 0x00FF) - amt;
    const G = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                  (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + 
                  (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}