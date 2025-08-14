// instagram-publisher.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom, of } from 'rxjs';
import { delay } from 'rxjs/operators';

interface FacebookPermission {
  name: string;
  description: string;
  granted: boolean;
  required: boolean;
}

interface InstagramPage {
  id: string;
  name: string;
  username: string;
  connected: boolean;
  profilePicture?: string;
  accessToken?: string;
  pageId?: string;
  webhookSetup?: boolean;
  followers?: number;
  posts?: number;
}

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
}

interface WebhookSubscription {
  object: string;
  callback_url: string;
  fields: string[];
  verify_token: string;
}

interface BotConfiguration {
  id: string;
  name: string;
  welcomeMessage: string;
  fallbackMessage: string;
  isActive: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'bot';
  messageType: 'text' | 'image' | 'quick_reply';
  attachments?: any[];
}

@Component({
  selector: 'app-instagram-publisher',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './instagram-publisher.component.html',
  styleUrl: './instagram-publisher.component.scss'
})
export class InstagramPublisherComponent implements OnInit, OnDestroy {
  // New properties for API testing
  testRecipientId: string = '';
  manualTestMessage: string = '';
  apiTestResults: any[] = [];
  realAccessToken: string = '';
  // Configuration
  private readonly FACEBOOK_APP_ID = '61579119704014'; // Dummy App ID for testing
  private readonly API_VERSION = 'v19.0';
  private readonly BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;
  private readonly WEBHOOK_URL = 'http://localhost:4200/webhook';
  
  // Testing Mode Flag
  private readonly TESTING_MODE = true; // Set to false when you have real API access
  
  // Component State
  selectedBot = 'Bot 3';
  currentStep: 'connect' | 'select' | 'configure' | 'chat' | 'test' = 'connect';
  showPermissions = false;
  isLoading = false;
  loadingMessage = '';
  
  // Facebook/Instagram Data
  facebookAccessToken: string = '';
  userAccessToken: string = '';
  selectedPage: InstagramPage | null = null;
  
  // Bot Configuration
  botConfig: BotConfiguration = {
    id: 'bot_001',
    name: 'Instagram Bot',
    welcomeMessage: 'Hello! Welcome to our Instagram page. How can I help you today?',
    fallbackMessage: 'I didn\'t understand that. Can you please rephrase?',
    isActive: false
  };

  // Chat Testing
  testMessages: ChatMessage[] = [];
  testInput: string = '';
  isTestMode: boolean = false;

  facebookPermissions: FacebookPermission[] = [
    {
      name: 'pages_messaging',
      description: 'Send and receive messages on behalf of Facebook Pages',
      granted: false,
      required: true
    },
    {
      name: 'pages_manage_metadata',
      description: 'Manage Page metadata and settings',
      granted: false,
      required: true
    },
    {
      name: 'pages_read_engagement',
      description: 'Read Page posts, comments, and reactions',
      granted: false,
      required: true
    },
    {
      name: 'instagram_basic',
      description: 'Access Instagram account information',
      granted: false,
      required: true
    },
    {
      name: 'instagram_manage_messages',
      description: 'Send and receive Instagram messages',
      granted: false,
      required: true
    },
    {
      name: 'pages_show_list',
      description: 'Access list of Facebook Pages',
      granted: false,
      required: true
    }
  ];

  instagramPages: InstagramPage[] = [];

  // Dummy data for testing
  private dummyInstagramPages: InstagramPage[] = [
    {
      id: 'ig_001',
      name: 'Tech Solutions Co.',
      username: '@techsolutions',
      connected: false,
      profilePicture: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop&crop=face',
      accessToken: 'dummy_access_token_001',
      pageId: 'page_001',
      webhookSetup: false,
      followers: 15420,
      posts: 342
    },
    {
      id: 'ig_002',
      name: 'Digital Marketing Agency',
      username: '@digitalmarketing_pro',
      connected: false,
      profilePicture: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop&crop=face',
      accessToken: 'dummy_access_token_002',
      pageId: 'page_002',
      webhookSetup: false,
      followers: 8750,
      posts: 189
    },
    {
      id: 'ig_003',
      name: 'Creative Studio',
      username: '@creativestudio',
      connected: false,
      profilePicture: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=150&h=150&fit=crop&crop=face',
      accessToken: 'dummy_access_token_003',
      pageId: 'page_003',
      webhookSetup: false,
      followers: 23100,
      posts: 456
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.TESTING_MODE) {
      console.log('🧪 Running in TESTING MODE - Using dummy data');
      this.simulateInitialization();
    } else {
      this.loadFacebookSDK();
      this.checkExistingConnection();
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  // Testing Mode Simulation
  private simulateInitialization() {
    // Check if there's any existing connection in localStorage for testing
    const savedConnection = localStorage.getItem('dummy_instagram_connection');
    if (savedConnection) {
      const connectionData = JSON.parse(savedConnection);
      this.facebookAccessToken = connectionData.accessToken;
      this.userAccessToken = connectionData.accessToken;
      this.instagramPages = [...this.dummyInstagramPages];
      
      // Restore connected state
      if (connectionData.selectedPageId) {
        const connectedPage = this.instagramPages.find(p => p.id === connectionData.selectedPageId);
        if (connectedPage) {
          connectedPage.connected = true;
          connectedPage.webhookSetup = true;
          this.selectedPage = connectedPage;
          this.currentStep = 'configure';
        }
      }
      
      this.facebookPermissions.forEach(p => p.granted = true);
    }
  }

  // Facebook SDK Integration (Mock for testing)
  private loadFacebookSDK(): Promise<void> {
    if (this.TESTING_MODE) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      if ((window as any).FB) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        (window as any).FB.init({
          appId: this.FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: this.API_VERSION
        });
        resolve();
      };

      document.head.appendChild(script);
    });
  }

  private checkExistingConnection() {
    if (this.TESTING_MODE) {
      return;
    }

    // Check if user is already logged in
    if ((window as any).FB) {
      (window as any).FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          this.handleFacebookLoginSuccess(response.authResponse);
        }
      });
    }
  }

  // Authentication Flow (With Testing Mode Support)
  connectFacebook() {
    this.showPermissions = true;
    this.isLoading = true;
    this.loadingMessage = 'Initializing Facebook connection...';

    if (this.TESTING_MODE) {
      // Simulate Facebook login process
      setTimeout(() => {
        const mockAuthResponse = {
          accessToken: 'dummy_access_token_' + Date.now(),
          userID: 'dummy_user_123',
          expiresIn: 3600,
          signedRequest: 'dummy_signed_request'
        };
        this.handleFacebookLoginSuccess(mockAuthResponse);
      }, 2000);
      return;
    }

    const permissions = this.facebookPermissions
      .filter(p => p.required)
      .map(p => p.name)
      .join(',');

    (window as any).FB.login((response: any) => {
      this.isLoading = false;
      if (response.status === 'connected') {
        this.handleFacebookLoginSuccess(response.authResponse);
      } else {
        this.handleFacebookLoginError('User cancelled login or did not fully authorize.');
      }
    }, { scope: permissions });
  }

  private async handleFacebookLoginSuccess(authResponse: FacebookAuthResponse) {
    try {
      this.facebookAccessToken = authResponse.accessToken;
      this.userAccessToken = authResponse.accessToken;
      
      // Mark permissions as granted
      this.facebookPermissions.forEach(p => p.granted = true);
      
      this.isLoading = true;
      this.loadingMessage = 'Fetching your Facebook Pages...';
      
      // Fetch user's Facebook pages
      await this.fetchUserPages();
      
      this.currentStep = 'select';
      this.showPermissions = false;
      this.isLoading = false;
      
      // Save connection for testing persistence
      if (this.TESTING_MODE) {
        localStorage.setItem('dummy_instagram_connection', JSON.stringify({
          accessToken: authResponse.accessToken,
          userID: authResponse.userID
        }));
      }
      
    } catch (error) {
      console.error('Error handling Facebook login:', error);
      this.handleFacebookLoginError('Failed to fetch your pages. Please try again.');
    }
  }

  private handleFacebookLoginError(message: string) {
    this.isLoading = false;
    this.showPermissions = false;
    alert(message);
  }

  // Page Management (With Testing Mode Support)
  private async fetchUserPages() {
    if (this.TESTING_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.instagramPages = [...this.dummyInstagramPages];
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get(`${this.BASE_URL}/me/accounts`, {
          params: {
            access_token: this.userAccessToken,
            fields: 'id,name,access_token,instagram_business_account{id,username,profile_picture_url}'
          }
        })
      );

      const data = response as any;
      
      if (data.data) {
        this.instagramPages = data.data
          .filter((page: any) => page.instagram_business_account)
          .map((page: any) => ({
            id: page.instagram_business_account.id,
            name: page.name,
            username: `@${page.instagram_business_account.username}`,
            connected: false,
            profilePicture: page.instagram_business_account.profile_picture_url || '/assets/default-avatar.png',
            accessToken: page.access_token,
            pageId: page.id,
            webhookSetup: false
          }));
      }

    } catch (error) {
      console.error('Error fetching pages:', error);
      throw new Error('Failed to fetch Facebook Pages');
    }
  }

  async connectPage(page: InstagramPage) {
    try {
      this.isLoading = true;
      this.loadingMessage = `Connecting to ${page.name}...`;

      // Simulate connection process
      if (this.TESTING_MODE) {
        await this.simulatePageConnection(page);
      } else {
        // Step 1: Setup webhook subscription
        await this.setupWebhookSubscription(page);
        
        // Step 2: Subscribe to webhook fields
        await this.subscribeToWebhookFields(page);
        
        // Step 3: Test webhook connection
        await this.testWebhookConnection(page);
      }
      
      // Mark as connected
      page.connected = true;
      page.webhookSetup = true;
      this.selectedPage = page;
      
      // Save selected page for testing persistence
      if (this.TESTING_MODE) {
        const savedConnection = JSON.parse(localStorage.getItem('dummy_instagram_connection') || '{}');
        savedConnection.selectedPageId = page.id;
        localStorage.setItem('dummy_instagram_connection', JSON.stringify(savedConnection));
      }
      
      this.isLoading = false;
      this.currentStep = 'configure';
      
      // Show success message
      alert(`Successfully connected to ${page.name}! Your bot is now ready to receive messages.`);
      
    } catch (error) {
      console.error('Error connecting page:', error);
      this.isLoading = false;
      alert(`Failed to connect to ${page.name}. Please check your configuration and try again.`);
    }
  }

  private async simulatePageConnection(page: InstagramPage) {
    // Simulate webhook setup delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate some random success/failure for realism
    if (Math.random() > 0.1) { // 90% success rate
      console.log(`✅ Mock webhook setup successful for ${page.name}`);
    } else {
      throw new Error('Simulated connection failure');
    }
  }

  private async setupWebhookSubscription(page: InstagramPage) {
    try {
      // Subscribe page to webhook
      const subscriptionData = {
        object: 'instagram',
        callback_url: this.WEBHOOK_URL,
        fields: [
          'messages',
          'messaging_postbacks',
          'messaging_optins',
          'message_deliveries',
          'message_reads'
        ].join(','),
        verify_token: 'your_verify_token',
        access_token: page.accessToken
      };

      const response = await firstValueFrom(
        this.http.post(`${this.BASE_URL}/${page.pageId}/subscribed_apps`, subscriptionData)
      );

      console.log('Webhook subscription successful:', response);

    } catch (error) {
      console.error('Error setting up webhook subscription:', error);
      throw error;
    }
  }

  private async subscribeToWebhookFields(page: InstagramPage) {
    try {
      const fields = [
        'messages',
        'messaging_postbacks',
        'messaging_optins',
        'message_deliveries',
        'message_reads'
      ];

      for (const field of fields) {
        const response = await firstValueFrom(
          this.http.post(`${this.BASE_URL}/${page.pageId}/subscriptions`, {
            object: 'instagram',
            fields: field,
            access_token: page.accessToken
          })
        );
        console.log(`Subscribed to ${field}:`, response);
      }

    } catch (error) {
      console.error('Error subscribing to webhook fields:', error);
      throw error;
    }
  }

  private async testWebhookConnection(page: InstagramPage): Promise<void> {
    // This would typically involve sending a test message to verify the webhook is working
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Webhook connection test completed');
        resolve();
      }, 1000);
    });
  }

  async disconnectPage(page: InstagramPage) {
    if (!confirm(`Are you sure you want to disconnect ${page.name}? This will stop your bot from responding to messages.`)) {
      return;
    }

    try {
      this.isLoading = true;
      this.loadingMessage = `Disconnecting ${page.name}...`;

      if (this.TESTING_MODE) {
        // Simulate disconnection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove from localStorage
        const savedConnection = JSON.parse(localStorage.getItem('dummy_instagram_connection') || '{}');
        delete savedConnection.selectedPageId;
        localStorage.setItem('dummy_instagram_connection', JSON.stringify(savedConnection));
      } else {
        // Remove webhook subscription
        await this.removeWebhookSubscription(page);
      }
      
      page.connected = false;
      page.webhookSetup = false;
      
      if (this.selectedPage?.id === page.id) {
        this.selectedPage = null;
        this.currentStep = 'select';
      }
      
      this.isLoading = false;
      alert(`Successfully disconnected ${page.name}.`);

    } catch (error) {
      console.error('Error disconnecting page:', error);
      this.isLoading = false;
      alert(`Error disconnecting ${page.name}. Please try again.`);
    }
  }

  private async removeWebhookSubscription(page: InstagramPage) {
    if (!page.accessToken) {
      console.error('Access token is missing for the page.');
      throw new Error('Access token required to remove webhook subscription.');
    }

    try {
      const response = await firstValueFrom(
        this.http.delete(`${this.BASE_URL}/${page.pageId}/subscribed_apps`, {
          params: { access_token: page.accessToken }
        })
      );
      console.log('Webhook unsubscribed:', response);
    } catch (error) {
      console.error('Error removing webhook subscription:', error);
      throw error;
    }
  }

  // Bot Configuration
  updateBotConfig<K extends keyof BotConfiguration>(field: K, value: BotConfiguration[K]) {
    this.botConfig[field] = value;
  }

  async publishBot() {
    if (!this.selectedPage) {
      alert('Please select an Instagram page first.');
      return;
    }

    try {
      this.isLoading = true;
      this.loadingMessage = 'Publishing bot configuration...';

      // Save bot configuration
      await this.saveBotConfiguration();
      
      // Activate the bot
      this.botConfig.isActive = true;
      
      this.isLoading = false;
      this.currentStep = 'test';
      
      alert('Bot published successfully! You can now test it or it will respond to real Instagram messages.');

    } catch (error) {
      console.error('Error publishing bot:', error);
      this.isLoading = false;
      alert('Failed to publish bot. Please try again.');
    }
  }

  private async saveBotConfiguration() {
    const config = {
      pageId: this.selectedPage?.id,
      botConfig: this.botConfig,
      timestamp: new Date().toISOString()
    };

    console.log('Saving bot configuration:', config);
    
    if (this.TESTING_MODE) {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage for persistence in testing
      localStorage.setItem('dummy_bot_config', JSON.stringify(config));
    } else {
      // Example API call to your backend:
      // await firstValueFrom(this.http.post('/api/bot/config', config));
    }
  }

  // Enhanced Message Handling with More Realistic Bot Responses
  async processIncomingMessage(webhookData: any) {
    try {
      const entry = webhookData.entry[0];
      const messaging = entry.messaging[0];
      
      if (messaging.message) {
        const senderId = messaging.sender.id;
        const messageText = messaging.message.text;
        
        // Process message with your bot logic
        const botResponse = await this.generateBotResponse(messageText);
        
        // Send response back to Instagram
        await this.sendInstagramMessage(senderId, botResponse);
      }

    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  private async generateBotResponse(userMessage: string): Promise<string> {
    // Enhanced bot logic with more responses
    const lowerMessage = userMessage.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return this.botConfig.welcomeMessage;
    }
    
    // Help responses
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'I\'m here to help! I can assist you with:\n• Product information\n• Customer support\n• Business hours\n• Contact details\n\nWhat would you like to know?';
    }
    
    // Business hours
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
      return 'We\'re open Monday-Friday: 9 AM - 6 PM\nSaturday: 10 AM - 4 PM\nSunday: Closed\n\nFor urgent matters, please email us at support@company.com';
    }
    
    // Contact information
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return 'You can reach us at:\n📞 Phone: (555) 123-4567\n📧 Email: support@company.com\n🌐 Website: www.company.com\n\nWe typically respond within 2 hours during business hours.';
    }
    
    // Products/Services
    if (lowerMessage.includes('product') || lowerMessage.includes('service') || lowerMessage.includes('offer')) {
      return 'We offer a range of services including:\n• Digital Marketing Solutions\n• Social Media Management\n• Web Development\n• Brand Strategy\n\nWould you like more details about any of these?';
    }
    
    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      return 'Our pricing varies based on your specific needs. I\'d love to connect you with our team for a personalized quote.\n\nWould you like to schedule a free consultation?';
    }
    
    // Goodbye responses
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('thanks')) {
      return 'Thank you for chatting with us! Have a great day! 🌟\n\nFeel free to message us anytime if you have more questions.';
    }
    
    // Default fallback
    return this.botConfig.fallbackMessage;
  }

  private async sendInstagramMessage(recipientId: string, message: string) {
    if (this.TESTING_MODE) {
      console.log(`📤 Mock message sent to ${recipientId}: ${message}`);
      return;
    }

    try {
      const messageData = {
        recipient: { id: recipientId },
        message: { text: message },
        access_token: this.selectedPage?.accessToken
      };

      const response = await firstValueFrom(
        this.http.post(`${this.BASE_URL}/me/messages`, messageData)
      );

      console.log('Message sent successfully:', response);

    } catch (error) {
      console.error('Error sending Instagram message:', error);
      throw error;
    }
  }

  // Enhanced Testing Interface
  startTesting() {
    this.isTestMode = true;
    this.testMessages = [
      {
        id: '1',
        text: 'Test mode started. Send a message to test your bot!',
        timestamp: new Date(),
        sender: 'bot',
        messageType: 'text'
      }
    ];
  }

  async sendTestMessage() {
    if (!this.testInput.trim()) return;

    // Add user message
    this.testMessages.push({
      id: Date.now().toString(),
      text: this.testInput,
      timestamp: new Date(),
      sender: 'user',
      messageType: 'text'
    });

    const userMessage = this.testInput;
    this.testInput = '';

    // Generate bot response
    const botResponse = await this.generateBotResponse(userMessage);

    // Add bot response with realistic delay
    setTimeout(() => {
      this.testMessages.push({
        id: (Date.now() + 1).toString(),
        text: botResponse,
        timestamp: new Date(),
        sender: 'bot',
        messageType: 'text'
      });
    }, Math.random() * 1000 + 500); // Random delay between 0.5-1.5 seconds
  }

  clearTestMessages() {
    this.testMessages = [];
    this.isTestMode = false;
  }

  // Quick Test Buttons
  sendQuickTestMessage(message: string) {
    this.testInput = message;
    this.sendTestMessage();
  }

  // Utility Methods
  togglePermission(permission: FacebookPermission) {
    if (!permission.required) {
      permission.granted = !permission.granted;
    }
  }

  cancelPermissions() {
    this.showPermissions = false;
  }

  goBack() {
    if (this.currentStep === 'configure') {
      this.currentStep = 'select';
    } else if (this.currentStep === 'test') {
      this.currentStep = 'configure';
    } else if (this.currentStep === 'select') {
      this.currentStep = 'connect';
    }
  }

  approvePermissions() {
    const allRequiredGranted = this.facebookPermissions
      .filter(p => p.required)
      .every(p => p.granted);

    if (!allRequiredGranted) {
      alert('Please grant all required permissions to continue.');
      return;
    }

    this.connectFacebook();
  }

  async refreshPermissions() {
    try {
      this.isLoading = true;
      this.loadingMessage = 'Refreshing permissions...';
      
      await this.fetchUserPages();
      
      this.isLoading = false;
      alert('Permissions refreshed successfully!');
    } catch (error) {
      this.isLoading = false;
      alert('Failed to refresh permissions.');
    }
  }

  async removePermissions() {
    if (!confirm('This will disconnect all pages and remove all permissions. Continue?')) {
      return;
    }

    try {
      this.isLoading = true;
      this.loadingMessage = 'Removing permissions...';

      if (this.TESTING_MODE) {
        // Clear localStorage
        localStorage.removeItem('dummy_instagram_connection');
        localStorage.removeItem('dummy_bot_config');
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Disconnect all pages
        for (const page of this.instagramPages.filter(p => p.connected)) {
          await this.removeWebhookSubscription(page);
        }

        // Revoke Facebook login
        (window as any).FB.logout();
      }

      // Reset state
      this.instagramPages = [];
      this.selectedPage = null;
      this.currentStep = 'connect';
      this.facebookAccessToken = '';
      this.userAccessToken = '';
      this.facebookPermissions.forEach(p => p.granted = false);
      this.botConfig.isActive = false;

      this.isLoading = false;
      alert('All permissions removed successfully!');

    } catch (error) {
      console.error('Error removing permissions:', error);
      this.isLoading = false;
      alert('Error removing permissions. Please try again.');
    }
  }

  // Analytics and Monitoring
  getConnectionStatus(): string {
    const connectedPages = this.instagramPages.filter(p => p.connected).length;
    return `${connectedPages} page${connectedPages !== 1 ? 's' : ''} connected`;
  }

  getBotStatus(): string {
    return this.botConfig.isActive ? 'Active' : 'Inactive';
  }

  // Testing helper methods
  getTestingModeStatus(): string {
    return this.TESTING_MODE ? 'Testing Mode' : 'Production Mode';
  }

  resetTestingData() {
    if (confirm('Reset all testing data? This will clear all connections and configurations.')) {
      localStorage.removeItem('dummy_instagram_connection');
      localStorage.removeItem('dummy_bot_config');
      location.reload();
    }
  }

  // Method to test sending messages directly via Instagram API
  async testDirectMessageSending() {
    if (!this.selectedPage?.accessToken || !this.testRecipientId || !this.manualTestMessage) {
      alert('Please fill in access token, recipient ID, and message');
      return;
    }

    try {
      this.isLoading = true;
      this.loadingMessage = 'Sending message via Instagram API...';

      const messageData = {
        recipient: { id: this.testRecipientId },
        message: { text: this.manualTestMessage }
      };

      const url = `https://graph.facebook.com/${this.API_VERSION}/me/messages`;
      
      const response = await firstValueFrom(
        this.http.post(url, messageData, {
          params: {
            access_token: this.selectedPage.accessToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      this.apiTestResults.push({
        type: 'success',
        timestamp: new Date(),
        action: 'Message Sent',
        data: response,
        message: this.manualTestMessage
      });

      this.isLoading = false;
      alert('Message sent successfully! Check your Instagram messages.');
      this.manualTestMessage = '';

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      this.apiTestResults.push({
        type: 'error',
        timestamp: new Date(),
        action: 'Message Send Failed',
        error: error.error || error.message,
        message: this.manualTestMessage
      });

      this.isLoading = false;
      alert('Failed to send message. Check console for details.');
    }
  }

  // Method to test webhook verification manually
  async testWebhookVerification() {
    try {
      this.isLoading = true;
      this.loadingMessage = 'Testing webhook verification...';

      // Simulate webhook verification
      const verifyToken = 'your_verify_token_123';
      const challenge = 'test_challenge_' + Date.now();

      // This simulates what Facebook would send to verify your webhook
      const webhookTestData = {
        'hub.mode': 'subscribe',
        'hub.verify_token': verifyToken,
        'hub.challenge': challenge
      };

      console.log('Webhook verification test data:', webhookTestData);

      this.apiTestResults.push({
        type: 'info',
        timestamp: new Date(),
        action: 'Webhook Verification Test',
        data: webhookTestData,
        message: 'Simulated Facebook webhook verification'
      });

      this.isLoading = false;
      alert('Webhook verification test completed. Check results below.');

    } catch (error) {
      console.error('Webhook verification test failed:', error);
      this.isLoading = false;
    }
  }

  // Method to simulate incoming message processing
  simulateIncomingMessage() {
    const testIncomingMessage = {
      object: 'instagram',
      entry: [{
        id: this.selectedPage?.id || 'test_page_id',
        time: Date.now(),
        messaging: [{
          sender: { id: 'test_user_12345' },
          recipient: { id: this.selectedPage?.id || 'test_page_id' },
          timestamp: Date.now(),
          message: {
            mid: 'test_message_id',
            text: this.testInput || 'Hello'
          }
        }]
      }]
    };

    // Process with your bot logic
    const userMessage = testIncomingMessage.entry[0].messaging[0].message.text;
    const botResponse = this.generateBotResponseForAPI(userMessage);

    this.apiTestResults.push({
      type: 'info',
      timestamp: new Date(),
      action: 'Incoming Message Simulation',
      data: {
        incoming: testIncomingMessage,
        botResponse: botResponse
      },
      message: `User: "${userMessage}" → Bot: "${botResponse}"`
    });

    console.log('Simulated incoming message:', testIncomingMessage);
    console.log('Generated bot response:', botResponse);
  }

  // Enhanced bot response method for API testing
  generateBotResponseForAPI(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return '👋 Hello! Welcome to our Instagram page. I\'m here to help you 24/7. What can I assist you with today?';
    }
    
    // Enhanced help responses with emojis
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return '🤝 I\'m here to help! I can assist you with:\n\n📦 Product information\n🛠️ Customer support\n🕒 Business hours\n📞 Contact details\n💰 Pricing information\n\nJust type your question or choose a topic!';
    }
    
    // Business hours with better formatting
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
      return '🕒 Our Business Hours:\n\n📅 Monday-Friday: 9:00 AM - 6:00 PM\n📅 Saturday: 10:00 AM - 4:00 PM\n📅 Sunday: Closed\n\n📧 For urgent matters outside business hours, email us at support@company.com\n\n⚡ We typically respond within 2 hours during business hours!';
    }
    
    // Enhanced contact information
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return '📞 Get in Touch:\n\n☎️ Phone: (555) 123-4567\n📧 Email: support@company.com\n🌐 Website: www.company.com\n📍 Address: 123 Business Street, City, State\n\n💬 You can also continue chatting here - I\'m available 24/7!';
    }
    
    // Products/Services with more detail
    if (lowerMessage.includes('product') || lowerMessage.includes('service') || lowerMessage.includes('offer')) {
      return '🚀 Our Services:\n\n📱 Digital Marketing Solutions\n📊 Social Media Management\n💻 Web Development\n🎨 Brand Strategy & Design\n📈 SEO & Analytics\n📧 Email Marketing\n\nWould you like detailed information about any of these services? Just ask!';
    }
    
    // Enhanced pricing with call-to-action
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      return '💰 Pricing Information:\n\nOur pricing is customized based on your specific needs and goals. We offer:\n\n🎯 Free initial consultation\n📊 Custom pricing plans\n💡 Flexible packages\n🎁 Special discounts for long-term partnerships\n\nWould you like to schedule a free consultation to discuss your project?';
    }
    
    // Thank you/goodbye with engagement
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('thanks')) {
      return '🙏 Thank you for chatting with us! Have a wonderful day! ✨\n\nRemember:\n📞 We\'re here whenever you need us\n💬 Feel free to message anytime\n🔔 Follow us for updates and tips\n\nTake care! 👋';
    }
    
    // Enhanced fallback with suggestions
    return '🤔 I didn\'t quite understand that, but I\'m here to help!\n\n💡 Try asking about:\n• "business hours"\n• "contact information"\n• "services"\n• "pricing"\n• "help"\n\nOr just tell me what you\'re looking for, and I\'ll do my best to assist you! 😊';
  }

  // Method to get Instagram account information
  async getInstagramAccountInfo() {
    if (!this.selectedPage?.accessToken) {
      alert('Please connect to an Instagram page first');
      return;
    }

    try {
      this.isLoading = true;
      this.loadingMessage = 'Fetching Instagram account information...';

      const url = `https://graph.facebook.com/${this.API_VERSION}/${this.selectedPage.id}`;
      
      const response = await firstValueFrom(
        this.http.get(url, {
          params: {
            fields: 'id,username,name,profile_picture_url,followers_count,media_count,account_type',
            access_token: this.selectedPage.accessToken
          }
        })
      );

      this.apiTestResults.push({
        type: 'success',
        timestamp: new Date(),
        action: 'Account Info Retrieved',
        data: response,
        message: 'Successfully fetched Instagram account details'
      });

      this.isLoading = false;
      console.log('Instagram account info:', response);

    } catch (error: any) {
      console.error('Error fetching account info:', error);
      
      this.apiTestResults.push({
        type: 'error',
        timestamp: new Date(),
        action: 'Account Info Failed',
        error: error.error || error.message,
        message: 'Failed to fetch Instagram account information'
      });

      this.isLoading = false;
    }
  }

  // Method to clear API test results
  clearApiResults() {
    this.apiTestResults = [];
  }

  // Method to export test results
  exportTestResults() {
    const dataStr = JSON.stringify(this.apiTestResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `instagram-bot-test-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Utility method to format API test results for display
  formatTestResult(result: any): string {
    if (result.type === 'error') {
      return `❌ ${result.action}: ${result.error}`;
    } else if (result.type === 'success') {
      return `✅ ${result.action}: Success`;
    } else {
      return `ℹ️ ${result.action}: ${result.message}`;
    }
  }

  // Method to validate access token
  async validateAccessToken() {
    if (!this.realAccessToken) {
      alert('Please enter an access token to validate');
      return;
    }

    try {
      this.isLoading = true;
      this.loadingMessage = 'Validating access token...';

      const url = `https://graph.facebook.com/${this.API_VERSION}/me`;
      
      const response = await firstValueFrom(
        this.http.get(url, {
          params: {
            access_token: this.realAccessToken
          }
        })
      );

      this.apiTestResults.push({
        type: 'success',
        timestamp: new Date(),
        action: 'Token Validation',
        data: response,
        message: 'Access token is valid'
      });

      this.isLoading = false;
      alert('Access token is valid!');

    } catch (error: any) {
      console.error('Invalid access token:', error);
      
      this.apiTestResults.push({
        type: 'error',
        timestamp: new Date(),
        action: 'Token Validation Failed',
        error: error.error || error.message,
        message: 'Access token is invalid or expired'
      });

      this.isLoading = false;
      alert('Access token is invalid or expired');
    }
  }
}