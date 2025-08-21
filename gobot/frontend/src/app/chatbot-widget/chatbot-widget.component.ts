// Enhanced chatbot-widget.component.ts with proper branding integration
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatbotMenuService } from '../shared/services/chatbot-menu.service';
import { MenuButton } from '../models/menu-button.model';
import { BrandingService, BrandingSettings } from '../shared/services/branding.service';
import { Subscription } from 'rxjs';
import { PageMessageService } from '../shared/services/page-message.service';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
   isPageTriggered?: boolean; 
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
  private brandingSubscription: Subscription | undefined;
// Page messaging properties
  private pageMessageSubscription: Subscription | undefined;
  currentPageUrl: string = '';
  pageTitle: string = '';
  // Add default values to prevent undefined errors
  secondaryColor: string = '#ffffff';
  // Add after existing properties
selectedAvatar: any = null; // Current selected avatar from branding
showChatAvatarAsWidget: boolean = true; // Whether to show avatar as widget icon
// Add new properties
botImage: string | null = null;
profileImage: string | null = null;
// Add this property
hasBotImage: boolean = false;
  isLandingPage: boolean = false;
  isMinimized: boolean = true;
  isSending: boolean = false;
  currentMessage: string = '';
  messages: Message[] = [];
  unreadCount: number = 0;
  private shouldScrollToBottom: boolean = false;

  // Header menu properties
  showHeaderMenu: boolean = false;
  isDarkMode: boolean = false;
  
  // Bot menu properties
  showBotMenu: boolean = false;
  currentMenu: MenuButton[] = [];
  menuHistory: { menu: MenuButton[]; title: string }[] = [];
  botId: string = 'bot-3';

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

  constructor(
    private route: ActivatedRoute,
    private chatbotMenuService: ChatbotMenuService,
    private brandingService: BrandingService,
     private pageMessageService: PageMessageService
  ) { }

  ngOnInit() {
    this.isLandingPage = this.route.snapshot.url[0]?.path === 'landing';
    
    // Load branding first, then other configs
    this.loadBrandingSettings();
    
    if (this.isLandingPage) {
      this.isMinimized = false;
      this.loadLandingConfig();
    } else {
      this.isMinimized = true;
      this.loadWidgetConfig();
    }
    
    // Subscribe to page message service
    this.subscribeToPageMessages();
    
    // Setup page message handling
    this.setupPageMessageHandling();
    this.loadMenuConfiguration();
    window.addEventListener('message', this.handleParentMessage.bind(this));
    this.sendMessageToParent({ type: 'chatbot-ready' });
    
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
     this.pageMessageSubscription?.unsubscribe();
    this.brandingSubscription?.unsubscribe();
    window.removeEventListener('message', this.handleParentMessage.bind(this));
  }

  /**
   * Load branding settings and subscribe to changes
   */
  private loadBrandingSettings(): void {
    // Subscribe to branding changes
    this.brandingSubscription = this.brandingService.branding$.subscribe(branding => {
      if (branding) {
        this.applyBrandingSettings(branding);
      }
    });

    // If no branding is loaded yet, try to load it
    const currentBranding = this.brandingService.getBranding();
    if (!currentBranding) {
      // Set some defaults or wait for branding to be set
      console.log('No branding settings found, using defaults');
    }
  }
  
  /**
   * Applies branding settings received from the service.
   */
  private applyBrandingSettings(branding: BrandingSettings): void {
    if (branding.botName) this.botName = branding.botName;
    if (branding.homeMessage) this.welcomeMessage = branding.homeMessage;
    if (branding.primaryColor) this.primaryColor = branding.primaryColor;
    if (branding.secondaryColor) this.secondaryColor = branding.secondaryColor;
     if (branding.botImage) this.botImage = branding.botImage;
  if (branding.profileImage) this.profileImage = branding.profileImage;
    
    // Apply landing page specific settings
    if (this.isLandingPage) {
      if (branding.landingTitle) this.landingTitle = branding.landingTitle;
      if (branding.landingDescription) this.landingDescription = branding.landingDescription;
    }
    
    // Only add welcome message if messages array is empty
    // This prevents duplicate welcome messages
    if (this.messages.length === 0 && this.welcomeMessage) {
      this.addBotMessage(this.welcomeMessage);
    }
   // Bot image for profile avatar in chat
// ADD THESE LINES:
  if (branding.botImage) {
    this.botImage = branding.botImage;
    console.log('Bot image loaded:', this.botImage); // Debug log
  }
  // ADD THESE LINES:
  // Selected avatar for widget icon
  if (branding.selectedAvatar) {
    this.selectedAvatar = branding.selectedAvatar;
  }
  
  // Widget icon preference
  if (branding.showChatAvatarAsWidget !== undefined) {
    this.showChatAvatarAsWidget = branding.showChatAvatarAsWidget;
  }
  }

  /**
   * Load menu configuration after branding is applied
   */
  private loadMenuConfiguration(): void {
    this.chatbotMenuService.getMenuConfiguration(this.botId).subscribe(config => {
      this.currentMenu = config.buttons;
      // Don't add welcome message here since it's handled in branding
    });
  }
  
  /**
   * Generates a unique ID for a chat message.
   */
  generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Formats a Date object or timestamp into a human-readable time string (HH:MM).
   */
  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Darkens a hex color by a specified amount.
   */
  darkenColor(color: string, amount: number): string {
    const hex = color.replace(/^#/, '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) - amount;
    let g = ((num >> 8) & 0x00FF) - amount;
    let b = (num & 0x0000FF) - amount;
    
    r = Math.max(0, r);
    g = Math.max(0, g);
    b = Math.max(0, b);
    
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  /**
   * Scrolls the messages container to the bottom.
   */
  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Scroll to bottom failed:', err);
    }
  }

  // --- Enhanced Menu Integration ---

  /**
   * Handle menu button click from header dropdown (closes dropdown after click)
   */
  handleMenuButtonClickFromHeader(button: MenuButton): void {
    this.closeHeaderMenu();
    this.handleMenuButtonClick(button);
  }

  /**
   * Main menu button click handler
   */
  handleMenuButtonClick(button: MenuButton): void {
    const userMessage: Message = {
      id: this.generateMessageId(),
      text: `Selected: ${button.label}`,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    this.shouldScrollToBottom = true;

    switch (button.type) {
      case 'action':
        this.handleActionButton(button);
        break;
      case 'submenu':
        this.handleSubmenuButton(button);
        break;
      case 'weblink':
        this.handleWeblinkButton(button);
        break;
    }
  }

  private handleActionButton(button: MenuButton): void {
    this.isSending = true;
    if (['light', 'dark', 'auto', 'reset'].includes(button.id)) {
      this.handleSettingsAction(button);
    }
    
    const typingMessage: Message = { 
      id: 'typing', 
      text: '', 
      isUser: false, 
      timestamp: new Date(), 
      typing: true 
    };
    this.messages.push(typingMessage);
    this.shouldScrollToBottom = true;

    setTimeout(() => {
      this.messages = this.messages.filter(m => m.id !== 'typing');
      let response = button.message || `Action "${button.label}" has been triggered.`;
      this.addBotMessage(response);
      this.isSending = false;
    }, 1000 + Math.random() * 1000);
  }

  private handleSubmenuButton(button: MenuButton): void {
    if (button.children && button.children.length > 0) {
      this.menuHistory.push({ 
        menu: this.currentMenu, 
        title: this.getCurrentMenuTitle() 
      });
      this.currentMenu = button.children;
      this.addBotMessage(`Here are the ${button.label.toLowerCase()} options:`);
    } else {
      this.addBotMessage(`The ${button.label} section is currently being updated. Please try again later.`);
    }
  }

  private handleWeblinkButton(button: MenuButton): void {
    this.addBotMessage(`Opening ${button.label}... This link will open in a new tab.`);
    if (button.url) {
      window.open(button.url, '_blank');
    }
  }

  /**
   * Show all menu options in the bot menu area
   */
  showAllMenuOptions(): void {
    this.closeHeaderMenu();
    this.showBotMenu = true;
    this.addBotMessage('Here are all available options:');
  }

  /**
   * Close the bot menu
   */
  closeBotMenu(): void {
    this.showBotMenu = false;
  }

  /**
   * Go back to previous menu level
   */
  goBackToPreviousMenu(): void {
    if (this.menuHistory.length > 0) {
      const previous = this.menuHistory.pop()!;
      this.currentMenu = previous.menu;
      this.addBotMessage(`Going back to ${previous.title}...`);
    }
  }

  /**
   * Check if we can go back to previous menu
   */
  canGoBack(): boolean {
    return this.menuHistory.length > 0;
  }

  /**
   * Get current menu title
   */
  getCurrentMenuTitle(): string {
    return this.menuHistory.length === 0 ? 'Main Menu' : 'Submenu';
  }

  /**
   * Get previous menu title for back button
   */
  getPreviousMenuTitle(): string {
    if (this.menuHistory.length === 0) return 'Menu';
    const previous = this.menuHistory[this.menuHistory.length - 1];
    return previous.title;
  }

  /**
   * Reset to main menu from header
   */
  resetToMainMenuFromHeader(): void {
    this.closeHeaderMenu();
    this.resetToMainMenu();
  }

  /**
   * Reset to main menu
   */
  resetToMainMenu(): void {
    this.chatbotMenuService.getMenuConfiguration(this.botId).subscribe(config => {
      this.currentMenu = config.buttons;
      this.menuHistory = [];
      this.addBotMessage('Returning to main menu. How can I help you?');
      this.showBotMenu = false;
    });
  }

  /**
   * Get button icon with fallback
   */
  getButtonIcon(button: MenuButton): string {
    return button.metadata?.icon || '💬';
  }

  // --- Core Chat Functionality ---

  async sendMessage() {
    if (!this.currentMessage.trim() || this.isSending) return;
    
    this.showBotMenu = false;
    this.closeHeaderMenu();
    
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
    
    const typingMessage: Message = { 
      id: 'typing', 
      text: '', 
      isUser: false, 
      timestamp: new Date(), 
      typing: true 
    };
    this.messages.push(typingMessage);
    this.shouldScrollToBottom = true;

    try {
      const response = await this.callChatAPI(messageToSend);
      this.messages = this.messages.filter(m => m.id !== 'typing');
      this.addBotMessage(response);
    } catch (error) {
      this.messages = this.messages.filter(m => m.id !== 'typing');
      this.addBotMessage('Sorry, I encountered an error. Please try again.');
    } finally {
      this.isSending = false;
    }
  }

  // --- Widget & Parent Communication ---

  loadWidgetConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Only override branding if URL params are provided
    // This allows branding service to take precedence
    const urlBotName = urlParams.get('name');
    const urlGreeting = urlParams.get('greeting');
    const urlPrimaryColor = urlParams.get('primaryColor');
    
    if (urlBotName && !this.brandingService.getBranding()?.botName) this.botName = urlBotName;
    if (urlGreeting && !this.brandingService.getBranding()?.homeMessage) this.welcomeMessage = urlGreeting;
    if (urlPrimaryColor && !this.brandingService.getBranding()?.primaryColor) this.primaryColor = urlPrimaryColor;
    
    this.inputPlaceholder = urlParams.get('placeholder') || this.inputPlaceholder;
    this.backgroundStyle = urlParams.get('backgroundStyle') || this.backgroundStyle;
    this.position = urlParams.get('position') || this.position;
    this.size = urlParams.get('size') || this.size;
    this.showBranding = urlParams.get('showBranding') === 'true';
    
    try {
      if ((window as any).parent && (window as any).parent.ChatbotConfig) {
        const config = (window as any).parent.ChatbotConfig;
        this.applyConfigObject(config);
      }
    } catch (e) { 
      console.log('No parent config found, using defaults');
    }
  }

  loadLandingConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Similar approach for landing page
    const urlTitle = urlParams.get('title');
    const urlDescription = urlParams.get('description');
    
    if (urlTitle && !this.brandingService.getBranding()?.landingTitle) this.landingTitle = urlTitle;
    if (urlDescription && !this.brandingService.getBranding()?.landingDescription) this.landingDescription = urlDescription;
    
    this.backgroundStyle = urlParams.get('backgroundStyle') || this.backgroundStyle;
    this.primaryColor = urlParams.get('primaryColor') || this.primaryColor;
    this.botName = urlParams.get('name') || this.botName;
    this.welcomeMessage = urlParams.get('greeting') || this.welcomeMessage;
  }

  applyConfigObject(config: any) {
    // Only apply if branding service doesn't have these values
    const currentBranding = this.brandingService.getBranding();
    
    if (config.name && !currentBranding?.botName) this.botName = config.name;
    if (config.greeting && !currentBranding?.homeMessage) this.welcomeMessage = config.greeting;
    if (config.primaryColor && !currentBranding?.primaryColor) this.primaryColor = config.primaryColor;
    
    if (config.placeholder) this.inputPlaceholder = config.placeholder;
    if (config.position) this.position = config.position;
    if (config.size) this.size = config.size;
    if (config.showBranding !== undefined) this.showBranding = config.showBranding;
  }

  /**
   * Subscribe to page messages from the service
   */
  // private subscribeToPageMessages(): void {
  //   this.pageMessageSubscription = this.pageMessageService.pageMessages$.subscribe(
  //     messages => {
  //       console.log('Page messages updated:', messages);
  //       // Send updated messages to parent if needed
  //       this.sendMessageToParent({
  //         type: 'page-messages-updated',
  //         messages: messages
  //       });
  //     }
  //   );
  // }

 /**
   * Setup page message handling from parent window
   */
  private setupPageMessageHandling(): void {
    // Correctly add the event listener using the class method
    window.addEventListener('message', this.handleParentMessage.bind(this));
    this.sendMessageToParent({ type: 'chatbot-ready' });
  }

  /**
   * Handle incoming messages from the parent window.
   * This method is now a proper class method, outside of setupPageMessageHandling.
   */
// Add this to your handleParentMessage method in chatbot-widget.component.ts

private handleParentMessage(event: MessageEvent): void {
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
      case 'page-message':
        this.handlePageMessage(event.data);
        break;
      case 'page-data':
        this.handlePageData(event.data);
        break;
      case 'chatbot-request-page-data':
        this.sendPageDataToParent();
        break;
      case 'chatbot-maximize':
        this.isMinimized = false;
        this.unreadCount = 0;
        setTimeout(() => {
          this.shouldScrollToBottom = true;
        }, 100);
        break;
      case 'chatbot-update-branding':
        if (event.data.branding) {
          this.brandingService.saveBranding(event.data.branding);
        }
        break;
      // ADD THESE NEW CASES:
      case 'request-bot-info':
        this.sendBotInfoToParent();
        break;
      case 'request-page-messages':
        this.sendPageMessagesToParent(event.data.currentUrl);
        break;
    }
  }
}

// ADD THESE NEW METHODS:
/**
 * Send bot information to parent window for notification cards
 */
private sendBotInfoToParent(): void {
  this.sendMessageToParent({
    type: 'bot-info-response',
    botName: this.botName,
    botAvatar: this.getBotAvatar(),
    botImage: this.botImage,
    primaryColor: this.primaryColor
  });
}

/**
 * Get bot avatar for notifications - prioritize based on settings
 */
private getBotAvatar(): string | null {
  if (this.showChatAvatarAsWidget && this.selectedAvatar) {
    if (this.selectedAvatar.type === 'upload' && this.selectedAvatar.file) {
      return this.selectedAvatar.file;
    }
  }
  
  if (this.botImage) {
    return this.botImage;
  }
  
  if (this.profileImage) {
    return this.profileImage;
  }
  
  return null;
}

/**
 * Send current page messages to parent window
 */
private sendPageMessagesToParent(currentUrl?: string): void {
  // Get all page messages from the service
  const allMessages = this.pageMessageService.getPageMessages();
  
  this.sendMessageToParent({
    type: 'page-messages-response',
    messages: allMessages,
    currentUrl: currentUrl || window.location.href,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enhanced page message subscription to notify embed script of updates
 */
private subscribeToPageMessages(): void {
  this.pageMessageSubscription = this.pageMessageService.pageMessages$.subscribe(
    messages => {
      console.log('Page messages updated:', messages);
      
      // Update localStorage for embed script
      localStorage.setItem('pageMessages', JSON.stringify(messages));
      
      // Send updated messages to parent window
      this.sendMessageToParent({
        type: 'page-messages-updated',
        messages: messages,
        timestamp: new Date().toISOString()
      });
    }
  );
}


/**
   * Handle incoming page message from embed script
   */
  private handlePageMessage(data: any): void {
    if (!data.message) return;
    
    console.log('Received page message:', data);
    
    // Show the widget if it's minimized
    if (this.isMinimized) {
      this.isMinimized = false;
      this.unreadCount = 0;
    }
    
    // Add the page message as a bot message
    this.addBotMessage(data.message, true);
    
    // Add a follow-up message to provide context
    setTimeout(() => {
      this.addBotMessage("This message was triggered by your activity on this page. How can I help you further?");
    }, 1000);
  }

  /**
   * Handle page data from parent window
   */
  private handlePageData(data: any): void {
    this.currentPageUrl = data.url || '';
    this.pageTitle = data.title || '';
    
    console.log('Received page data:', {
      url: this.currentPageUrl,
      title: this.pageTitle,
      pageMessages: data.pageMessages
    });
  }

  /**
   * Send page data to parent window
   */
  private sendPageDataToParent(): void {
    // Get current page messages that match the current URL
    const currentMessages = this.pageMessageService.getPageMessages();
    
    this.sendMessageToParent({
      type: 'page-data-response',
      messages: currentMessages,
      totalCount: currentMessages.length
    });
  }

  /**
   * Enhanced addBotMessage with page message support
   */
  private addBotMessage(text: string, isPageTriggered: boolean = false): void {
    const message: Message = {
      id: this.generateMessageId(),
      text: text,
      isUser: false,
      timestamp: new Date(),
      isPageTriggered: isPageTriggered // Add this flag to track page-triggered messages
    };
    
    this.messages.push(message);
    this.shouldScrollToBottom = true;
    
    // Don't count page-triggered messages as unread when widget is minimized
    if (this.isMinimized && !this.isLandingPage && !isPageTriggered) {
      this.unreadCount++;
      // Send notification to parent about unread messages
      this.sendMessageToParent({ 
        type: 'chatbot-notification', 
        count: this.unreadCount 
      });
    }
  }

  /**
   * Method to manually trigger page messages (for testing)
   */
  public triggerPageMessagesForUrl(url: string): void {
    const messages = this.pageMessageService.getPageMessages();
    const matchingMessages = this.filterMessagesForUrl(messages, url);
    
    matchingMessages.forEach(message => {
      let messageText = '';
      
      if (message.messageType === 'text' && message.textMessage) {
        messageText = message.textMessage;
      } else if (message.messageType === 'story' && message.selectedStory) {
        messageText = this.convertStoryToText(message.selectedStory);
      }
      
      if (messageText) {
        setTimeout(() => {
          this.addBotMessage(messageText, true);
        }, (message.delay || 0) * 1000);
      }
    });
  }

  /**
   * Filter messages that match the given URL
   */
  private filterMessagesForUrl(messages: any[], url: string): any[] {
    return messages.filter(message => {
      return message.urls.some((messageUrl: string) => {
        // Handle different URL matching patterns
        if (messageUrl === '*') return true; // Wildcard matches all
        if (messageUrl.endsWith('*')) {
          const prefix = messageUrl.slice(0, -1);
          return url.startsWith(prefix);
        }
        if (messageUrl.includes('*')) {
          const pattern = messageUrl.replace(/\*/g, '.*');
          const regex = new RegExp(pattern);
          return regex.test(url);
        }
        return url === messageUrl || url.includes(messageUrl);
      });
    });
  }

  /**
   * Convert story to text message
   */
  private convertStoryToText(story: any): string {
    if (!story || !story.blocks) return story.name || 'Story content';
    
    const textBlocks = story.blocks
      .filter((block: any) => block.type === 'text' && block.content && block.content.text)
      .map((block: any) => block.content.text);
    
    return textBlocks.length > 0 ? textBlocks.join(' ') : story.name || 'Story content';
  }

  /**
   * Enhanced clear chat to handle page messages
   */
  clearChat(): void {
    this.closeHeaderMenu();
    if (confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
      this.messages = [];
      this.menuHistory = [];
      this.loadMenuConfiguration();
      
      // Re-add welcome message after clearing
      if (this.welcomeMessage) {
        this.addBotMessage(this.welcomeMessage);
      }
      
      // Notify parent that chat was cleared
      this.sendMessageToParent({ 
        type: 'chat-cleared',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Enhanced download chat to include page message context
   */
  downloadChat(): void {
    this.closeHeaderMenu();
    try {
      const chatData = this.prepareChatForDownloadWithPageContext();
      const blob = new Blob([chatData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      this.addBotMessage('Chat history downloaded successfully!');
    } catch (error) {
      console.error('Error downloading chat:', error);
      this.addBotMessage('Sorry, there was an error downloading the chat history.');
    }
  }

  /**
   * Enhanced chat download with page context
   */
  private prepareChatForDownloadWithPageContext(): string {
    let chatText = `Chat History - ${new Date().toLocaleString()}\n`;
    chatText += `Bot: ${this.botName}\n`;
    chatText += `Page URL: ${this.currentPageUrl || 'Unknown'}\n`;
    chatText += `Page Title: ${this.pageTitle || 'Unknown'}\n`;
    chatText += '='.repeat(50) + '\n\n';
    
    this.messages.forEach((message) => {
      if (!message.typing) {
        const sender = message.isUser ? 'You' : this.botName;
        const time = this.formatTime(message.timestamp);
        const pageTriggered = (message as any).isPageTriggered ? ' [Page Triggered]' : '';
        chatText += `[${time}] ${sender}${pageTriggered}: ${message.text}\n`;
        chatText += '\n';
      }
    });
    
    return chatText;
  }

  sendMessageToParent(data: any) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(data, '*');
      }
    } catch (e) {
      console.log('Could not send message to parent:', e);
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    if (!this.isMinimized) {
      this.unreadCount = 0;
      setTimeout(() => {
        this.shouldScrollToBottom = true;
      }, 100);
    }
    this.sendMessageToParent({ 
      type: this.isMinimized ? 'chatbot-minimized' : 'chatbot-maximized' 
    });
  }

  private receiveExternalMessage(message: string) {
    if (message && message.trim()) {
      this.currentMessage = message;
      this.sendMessage();
    }
  }

  private async callChatAPI(message: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      `Thanks for asking about "${message}". Please use the menu options for more specific help.`,
      "That's a great question! Let me provide you with some information. Check the menu for quick actions.",
      "I understand your inquiry. Use the menu options for relevant help.",
      "Interesting! I'd be happy to assist you with that. The menu has helpful options.",
      "Let me help you with that query. You might find the menu options useful.",
      "I see what you're asking about. Please explore the menu for more assistance."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // --- Header Menu & Settings ---

  toggleHeaderMenu(): void {
    this.showHeaderMenu = !this.showHeaderMenu;
    if (this.showHeaderMenu) {
      this.showBotMenu = false;
    }
  }

  closeHeaderMenu(): void {
    this.showHeaderMenu = false;
  }

  toggleBotMenu(): void {
    this.showBotMenu = !this.showBotMenu;
    if (this.showBotMenu) {
      this.closeHeaderMenu();
    }
  }

  // clearChat(): void {
  //   this.closeHeaderMenu();
  //   if (confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
  //     this.messages = [];
  //     this.menuHistory = [];
  //     this.loadMenuConfiguration();
  //     // Re-add welcome message after clearing
  //     if (this.welcomeMessage) {
  //       this.addBotMessage(this.welcomeMessage);
  //     }
  //   }
  // }

  // downloadChat(): void {
  //   this.closeHeaderMenu();
  //   try {
  //     const chatData = this.prepareChatForDownload();
  //     const blob = new Blob([chatData], { type: 'text/plain' });
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);
  //     this.addBotMessage('Chat history downloaded successfully!');
  //   } catch (error) {
  //     console.error('Error downloading chat:', error);
  //     this.addBotMessage('Sorry, there was an error downloading the chat history.');
  //   }
  // }

  toggleDarkMode(): void {
    this.closeHeaderMenu();
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    this.addBotMessage(`Switched to ${this.isDarkMode ? 'dark' : 'light'} mode.`);
  }

  showSettings(): void {
    this.closeHeaderMenu();
    const settingsMessage = 'Settings & Preferences:';
    this.addBotMessage(settingsMessage);
    this.currentMenu = this.getSettingsMenuButtons();
    this.menuHistory.push({ menu: this.currentMenu, title: 'Settings' });
    this.showBotMenu = true;
  }

  private prepareChatForDownload(): string {
    let chatText = `Chat History - ${new Date().toLocaleString()}\n`;
    chatText += `Bot: ${this.botName}\n`;
    chatText += '='.repeat(50) + '\n\n';
    this.messages.forEach((message) => {
      if (!message.typing) {
        const sender = message.isUser ? 'You' : this.botName;
        const time = this.formatTime(message.timestamp);
        chatText += `[${time}] ${sender}: ${message.text}\n`;
        chatText += '\n';
      }
    });
    return chatText;
  }

  // private addBotMessage(text: string): void {
  //   const message: Message = {
  //     id: this.generateMessageId(),
  //     text: text,
  //     isUser: false,
  //     timestamp: new Date()
  //   };
  //   this.messages.push(message);
  //   this.shouldScrollToBottom = true;
  //   if (this.isMinimized && !this.isLandingPage) {
  //     this.unreadCount++;
  //   }
  // }

  private getSettingsMenuButtons(): MenuButton[] {
    return [
      { 
        id: 'notifications', 
        type: 'action', 
        label: 'Notification Settings', 
        message: 'Notification settings updated! You can now receive alerts for new messages and updates.', 
        metadata: { color: '#6366f1', icon: '🔔' }, 
        isActive: false, 
        order: 1 
      },
      { 
        id: 'language', 
        type: 'submenu', 
        label: 'Language', 
        children: [
          { id: 'english', type: 'action', label: 'English', message: 'Language set to English.', metadata: { icon: '🇺🇸' }, isActive: false, order: 1 }, 
          { id: 'spanish', type: 'action', label: 'Español', message: 'Idioma configurado a Español.', metadata: { icon: '🇪🇸' }, isActive: false, order: 2 }, 
          { id: 'french', type: 'action', label: 'Français', message: 'Langue définie sur Français.', metadata: { icon: '🇫🇷' }, isActive: false, order: 3 }
        ], 
        metadata: { color: '#10b981', icon: '🌐' }, 
        isActive: false, 
        order: 2 
      },
      { 
        id: 'theme', 
        type: 'submenu', 
        label: 'Theme', 
        children: [
          { id: 'light', type: 'action', label: 'Light Mode', message: 'Theme set to Light mode.', metadata: { icon: '☀️' }, isActive: false, order: 1 }, 
          { id: 'dark', type: 'action', label: 'Dark Mode', message: 'Theme set to Dark mode.', metadata: { icon: '🌙' }, isActive: false, order: 2 }, 
          { id: 'auto', type: 'action', label: 'Auto', message: 'Theme set to Auto (follows system preference).', metadata: { icon: '🔄' }, isActive: false, order: 3 }
        ], 
        metadata: { color: '#f59e0b', icon: '🎨' }, 
        isActive: false, 
        order: 3 
      },
      { 
        id: 'reset', 
        type: 'action', 
        label: 'Reset to Defaults', 
        message: 'Settings reset to defaults.', 
        metadata: { color: '#ef4444', icon: '🔄' }, 
        isActive: false, 
        order: 4 
      }
    ];
  }

  private handleSettingsAction(button: MenuButton): void {
    if (button.id === 'light') {
      this.isDarkMode = false;
      document.body.classList.remove('dark-mode');
    } else if (button.id === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    } else if (button.id === 'reset') {
      this.isDarkMode = false;
      document.body.classList.remove('dark-mode');
      this.brandingService.resetBranding();
      this.loadWidgetConfig();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.showHeaderMenu && !target.closest('.header-menu-btn') && !target.closest('.header-menu-dropdown')) {
      this.closeHeaderMenu();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.showHeaderMenu) {
      this.closeHeaderMenu();
    }
  }
}