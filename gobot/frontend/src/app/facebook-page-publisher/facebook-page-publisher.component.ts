// facebook-page-publisher.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 'declare var FB: any;' is kept as it might be required for other features in the future
// and not removing it doesn't break anything.
declare var FB: any;

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  connected?: boolean;
  botName?: string;
}

export interface FacebookPermission {
  permission: string;
  status: 'granted' | 'declined';
}

@Component({
  selector: 'app-facebook-page-publisher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './facebook-page-publisher.component.html',
  styleUrls: ['./facebook-page-publisher.component.scss']
})
export class FacebookPagePublisherComponent implements OnInit {

  // Dummy data for testing
  isConnected = false; // Start as false to simulate the initial connection state
  isLoading = false;
  showPermissionDialog = false;

  pages: FacebookPage[] = [
    {
      id: '1234567890',
      name: 'Dress Shop',
      access_token: 'dummy_access_token_1',
      category: 'Clothing Store',
      connected: false,
      botName: ''
    },
    {
      id: '0987654321',
      name: 'Test Page',
      access_token: 'dummy_access_token_2',
      category: 'Local Business',
      connected: true,
      botName: 'Bot 1'
    },
    {
      id: '1122334455',
      name: 'My Chatbot Page',
      access_token: 'dummy_access_token_3',
      category: 'Bot',
      connected: false,
      botName: ''
    }
  ];

  selectedBot = 'Bot 1';
  availableBots = ['Bot 1', 'Bot 2', 'Bot 3'];

  // Facebook permissions required
  // The 'granted' status is set to false initially to simulate a new login flow
  requiredPermissions = [
    { name: 'Receive your email address', granted: false },
    { name: 'Manage and access Page conversations in Messenger', granted: false },
    { name: 'Send messages from Pages you manage at any time after the first user interaction', granted: false },
    { name: 'Show a list of the Pages you manage', granted: false },
    { name: 'Manage and access your Pages\' messaging conversations', granted: false },
    { name: 'Read content posted on the Page', granted: false },
    { name: 'Manage accounts, settings, and webhooks for a Page', granted: false },
    { name: 'Read user content on your Page', granted: false }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initializeFacebookSDK();
  }

  // This method remains, but the FB.init call will fail without a valid App ID.
  // The component's functionality is independent of this for dummy data testing.
  initializeFacebookSDK() {
    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: 'YOUR_FACEBOOK_APP_ID',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.head.appendChild(script);
  }

  // Modified to simulate a successful login and permission check
  connectToFacebook() {
    this.isLoading = true;

    // Simulate a successful login after a delay
    setTimeout(() => {
      this.showPermissionDialog = true;
      // This will now use the pre-defined dummy data for permissions
      this.checkPermissions();
      this.isLoading = false;
    }, 1000);
  }

  // Modified to simulate a permission check without a real API call
  checkPermissions() {
    // In a real scenario, this would be populated by the FB.api call.
    // For this dummy implementation, we will manually set some permissions to granted.
    this.requiredPermissions[0].granted = true; // Email
    this.requiredPermissions[3].granted = true; // Show pages
    this.requiredPermissions[5].granted = true; // Read content
  }

  // Modified to simulate loading pages without a real API call
  loadUserPages() {
    // In a real scenario, this would populate the `pages` array.
    // Since we have dummy data, we just clear the loading state.
    this.isLoading = false;
  }

  // This logic remains unchanged
  confirmPermissions() {
    this.requiredPermissions.forEach(p => p.granted = true);
    this.showPermissionDialog = false;
    this.isConnected = true;
  }

  // This logic remains unchanged
  cancelPermissions() {
    this.showPermissionDialog = false;
    this.isLoading = false;
  }

  // This logic remains unchanged, simulating a connection with a delay
  connectPageToBot(page: FacebookPage) {
    this.isLoading = true;
    setTimeout(() => {
      page.connected = true;
      page.botName = this.selectedBot;
      this.isLoading = false;
    }, 2000);
  }

  // This logic remains unchanged, simulating a disconnection with a delay
  disconnectPage(page: FacebookPage) {
    this.isLoading = true;
    setTimeout(() => {
      page.connected = false;
      page.botName = '';
      this.isLoading = false;
    }, 1000);
  }

  // This method remains unchanged, but the API call will likely fail without a real backend.
  setupPageWebhook(page: FacebookPage) {
    const webhookData = {
      pageId: page.id,
      accessToken: page.access_token,
      botName: page.botName,
      webhookUrl: 'http://localhost:4200/webhook'
    };

    this.http.post('/api/facebook/setup-webhook', webhookData).subscribe(
      response => {
        console.log('Webhook setup successful', response);
      },
      error => {
        console.error('Webhook setup failed', error);
      }
    );
  }

  // This logic remains unchanged, simulating a refresh with a delay
  refreshPagePermissions() {
    this.isLoading = true;
    this.checkPermissions();
    this.loadUserPages();

    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  // This logic remains unchanged, simulating permission removal
  removePagePermissions() {
    if (confirm('Are you sure you want to remove all page permissions? This will disconnect all connected pages.')) {
      this.pages.forEach(page => {
        page.connected = false;
        page.botName = '';
      });

      this.isConnected = false;
      this.showPermissionDialog = false;
      this.requiredPermissions.forEach(p => p.granted = false);
    }
  }

  // This logic remains unchanged
  getPageIcon(page: FacebookPage): string {
    const name = page.name.toLowerCase();
    if (name.includes('dress')) return '👗';
    if (name.includes('test')) return '🧪';
    if (name.includes('bot')) return '🤖';
    if (name.includes('chat')) return '💬';
    return '📄';
  }

  // This logic remains unchanged
  getPageColor(index: number): string {
    const colors = ['#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#4caf50'];
    return colors[index % colors.length];
  }
}