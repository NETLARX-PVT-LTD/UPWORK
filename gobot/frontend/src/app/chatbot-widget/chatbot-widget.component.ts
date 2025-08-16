// Enhanced chatbot-widget.component.ts with Direct Menu Integration
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatbotMenuService } from '../shared/services/chatbot-menu.service';
import { MenuButton } from '../models/menu-button.model';

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
  isMinimized: boolean = true;
  isSending: boolean = false;
  currentMessage: string = '';
  messages: Message[] = [];
  unreadCount: number = 0;
  private shouldScrollToBottom: boolean = false;

  // Header menu properties
  showHeaderMenu: boolean = false;
  isDarkMode: boolean = false;
  
  // Bot menu properties (now only for "show all" functionality)
  showBotMenu: boolean = false;
  currentMenu: MenuButton[] = [];
  menuHistory: { menu: MenuButton[]; title: string }[] = [];
  botId: string = 'bot-3'; // Your bot ID

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
    private chatbotMenuService: ChatbotMenuService
  ) { }

  ngOnInit() {
    this.isLandingPage = this.route.snapshot.url[0]?.path === 'landing';
    if (this.isLandingPage) {
      this.isMinimized = false;
      this.loadLandingConfig();
    } else {
      this.isMinimized = true;
      this.loadWidgetConfig();
    }
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
    window.removeEventListener('message', this.handleParentMessage.bind(this));
  }
  
  // --- CORE UTILITY METHODS (FIXING YOUR ERRORS) ---
  
  /**
   * Generates a unique ID for a chat message.
   * This fixes the "Property 'generateMessageId' does not exist" error.
   */
  generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Formats a Date object or timestamp into a human-readable time string (HH:MM).
   * This fixes the "Property 'formatTime' does not exist" error.
   */
  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Darkens a hex color by a specified amount.
   * This fixes the "Property 'darkenColor' does not exist" error.
   */
  darkenColor(color: string, amount: number): string {
    const hex = color.replace(/^#/, '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) - amount;
    let b = ((num >> 8) & 0x00FF) - amount;
    let g = (num & 0x0000FF) - amount;
    
    r = Math.max(0, r);
    b = Math.max(0, b);
    g = Math.max(0, g);
    
    return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
  }

  /**
   * Scrolls the messages container to the bottom.
   * This fixes the "Property 'scrollToBottom' does not exist" error.
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

  private loadMenuConfiguration(): void {
    this.chatbotMenuService.getMenuConfiguration(this.botId).subscribe(config => {
      this.currentMenu = config.buttons;
      this.addBotMessage(this.welcomeMessage);
    });
  }

  /**
   * Handle menu button click from header dropdown (closes dropdown after click)
   */
  handleMenuButtonClickFromHeader(button: MenuButton): void {
    this.closeHeaderMenu(); // Close the header dropdown
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
      this.showBotMenu = false; // Hide bot menu when resetting
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
    
    this.showBotMenu = false; // Hide menu when user types
    this.closeHeaderMenu(); // Close header menu if open
    
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
    this.botName = urlParams.get('name') || this.botName;
    this.welcomeMessage = urlParams.get('greeting') || this.welcomeMessage;
    this.inputPlaceholder = urlParams.get('placeholder') || this.inputPlaceholder;
    this.primaryColor = urlParams.get('primaryColor') || this.primaryColor;
    this.backgroundStyle = urlParams.get('backgroundStyle') || this.backgroundStyle;
    this.position = urlParams.get('position') || this.position;
    this.size = urlParams.get('size') || this.size;
    this.showBranding = urlParams.get('showBranding') === 'true';
    
    try {
      if ((window as any).parent && (window as any).parent.ChatbotConfig) {
        const config = (window as any).parent.ChatbotConfig;
        this.applyConfigObject(config);
      }
    } catch (e) { }
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
      this.showBotMenu = false; // Close bot menu when opening header menu
    }
  }

  closeHeaderMenu(): void {
    this.showHeaderMenu = false;
  }

  toggleBotMenu(): void {
    this.showBotMenu = !this.showBotMenu;
    if (this.showBotMenu) {
      this.closeHeaderMenu(); // Close header menu when opening bot menu
    }
  }

  clearChat(): void {
    this.closeHeaderMenu();
    if (confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
      this.messages = [];
      this.menuHistory = [];
      this.loadMenuConfiguration();
    }
  }

  downloadChat(): void {
    this.closeHeaderMenu();
    try {
      const chatData = this.prepareChatForDownload();
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
    // You could handle settings menu logic here, but for this example, the main menu is re-shown.
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

  private addBotMessage(text: string): void {
    const message: Message = {
      id: this.generateMessageId(),
      text: text,
      isUser: false,
      timestamp: new Date()
    };
    this.messages.push(message);
    this.shouldScrollToBottom = true;
    if (this.isMinimized && !this.isLandingPage) {
      this.unreadCount++;
    }
  }

  private getSettingsMenuButtons(): MenuButton[] {
    return [
      { id: 'notifications', type: 'action', label: 'Notification Settings', message: 'Notification settings updated! You can now receive alerts for new messages and updates.', metadata: { color: '#6366f1', icon: '🔔' }, isActive: false, order: 1 },
      { id: 'language', type: 'submenu', label: 'Language', children: [{ id: 'english', type: 'action', label: 'English', message: 'Language set to English.', metadata: { icon: '🇺🇸' }, isActive: false, order: 1 }, { id: 'spanish', type: 'action', label: 'Español', message: 'Idioma configurado a Español.', metadata: { icon: '🇪🇸' }, isActive: false, order: 2 }, { id: 'french', type: 'action', label: 'Français', message: 'Langue définie sur Français.', metadata: { icon: '🇫🇷' }, isActive: false, order: 3 }], metadata: { color: '#10b981', icon: '🌐' }, isActive: false, order: 2 },
      { id: 'theme', type: 'submenu', label: 'Theme', children: [{ id: 'light', type: 'action', label: 'Light Mode', message: 'Theme set to Light mode.', metadata: { icon: '☀️' }, isActive: false, order: 1 }, { id: 'dark', type: 'action', label: 'Dark Mode', message: 'Theme set to Dark mode.', metadata: { icon: '🌙' }, isActive: false, order: 2 }, { id: 'auto', type: 'action', label: 'Auto', message: 'Theme set to Auto (follows system preference).', metadata: { icon: '🔄' }, isActive: false, order: 3 }], metadata: { color: '#f59e0b', icon: '🎨' }, isActive: false, order: 3 },
      { id: 'reset', type: 'action', label: 'Reset to Defaults', message: 'Settings reset to defaults.', metadata: { color: '#ef4444', icon: '🔄' }, isActive: false, order: 4 }
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