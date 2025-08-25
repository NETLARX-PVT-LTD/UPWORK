// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Import the necessary Angular Material modules
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip'; // Added for tooltip

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule, // Added to imports
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  pageHeading: string = 'Dashboard';
  showSocialMediaCard = false;
  showWebsiteSidebar = false;
  showWhatsAppSidebar = false;
  showInstagramSidebar = false;
  showMessengerSidebar = false;
  showTelegramSidebar = false;
  showSMSSidebar = false;
  showWebsiteChatbotSidebar: boolean = false;
  
  // New property for the main "Chatbot AI" sidebar
  showChatbotAISidebar: boolean = false;

  private leaveTimer: any;
  private destroy$ = new Subject<void>();
  sidebarAnimationClass: string = '';

  // New property to control visibility
  showHeaderAndAside: boolean = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    // Listen to router events to update the heading on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route: ActivatedRoute) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter((route: ActivatedRoute) => route.outlet === 'primary'),
      switchMap((route: ActivatedRoute) => route.data),
      takeUntil(this.destroy$)
    ).subscribe((data: Data) => {
      if (data['title']) {
        this.pageHeading = data['title'];
      }
    });

    // Updated subscription to check the current URL path.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      this.showHeaderAndAside = !url.includes('/create-story') && !url.includes('/chatbot-widget') && !url.includes('/partner-dashboard') && !url.startsWith('/landing/');
      console.log('Current route:', url);
      console.log('Show header and aside:', this.showHeaderAndAside);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
    }
  }

  onSocialMediaClick(platform: string, event: Event) {
    event.stopPropagation();
    this.showSocialMediaCard = false;
    
    // Close all sidebars except the social media ones
    this.closeAllSidebars();
    
    switch(platform) {
      case 'website':
        this.showWebsiteSidebar = true;
        break;
      case 'whatsapp':
        this.showWhatsAppSidebar = true;
        break;
      case 'instagram':
        this.showInstagramSidebar = true;
        break;
      case 'messenger':
        this.showMessengerSidebar = true;
        break;
      case 'telegram':
        this.showTelegramSidebar = true;
        break;
      case 'sms':
        this.showSMSSidebar = true;
        break;
    }
  }

  /**
   * Closes all sidebars, with an option to keep the main chatbot AI sidebar open.
   * This is a utility method to clean up the UI state.
   * @param keepChatbotAISidebarOpen Optional boolean to prevent closing the main sidebar.
   */
  closeAllSidebars(keepChatbotAISidebarOpen: boolean = false) {
    this.showWebsiteSidebar = false;
    this.showWhatsAppSidebar = false;
    this.showInstagramSidebar = false;
    this.showMessengerSidebar = false;
    this.showTelegramSidebar = false;
    this.showSMSSidebar = false;
    this.showWebsiteChatbotSidebar = false;
    this.showSocialMediaCard = false;

    if (!keepChatbotAISidebarOpen) {
      this.showChatbotAISidebar = false;
    }
  }
  
  /**
   * Handles the click event for the main "Chatbot AI" icon.
   * This method ensures all other sidebars are closed before the main
   * chatbot sidebar is toggled.
   */
  onChatbotAIClick() {
    // First, close all other sidebars.
    this.closeAllSidebars(true); 
    // Then, toggle the main chatbot AI sidebar.
    this.showChatbotAISidebar = !this.showChatbotAISidebar;
  }

  onMouseEnter() {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
    }
    this.showSocialMediaCard = true;
  }

  onMouseLeave() {
    this.leaveTimer = setTimeout(() => {
      this.showSocialMediaCard = false;
    }, 500); // Increased delay for better UX
  }

  // Fix for social media card mouse events
  onSocialCardMouseEnter() {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
    }
  }

  onSocialCardMouseLeave() {
    this.leaveTimer = setTimeout(() => {
      this.showSocialMediaCard = false;
    }, 300);
  }

  closeWebsiteChatbotSidebar() {
    this.sidebarAnimationClass = 'exiting';
    setTimeout(() => {
      this.showWebsiteChatbotSidebar = false;
      this.sidebarAnimationClass = '';
    }, 200);
  }

  // UPDATED METHOD to navigate using the router with integrated routes
  onSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars(true); // Close all sidebars on navigation
    switch (item) {
      case 'publish':
        this.router.navigate(['/publish-bot']);
        break;
      case 'menu':
        this.router.navigate(['/chatbot-menu']); // Navigate to the chatbot menu page
        break;
      case 'branding':
        this.router.navigate(['/branding']);
        break;
      case 'settings':
        this.router.navigate(['/advance-settings']);
        break;
      case 'messaging':
        this.router.navigate(['/page-messages/create']);
        break;
      case 'story':
        this.router.navigate(['/create-story']);
        break;
      case 'ai-assistants':
        this.router.navigate(['/ai-assistants']);
        break;
      case 'blocks':
        this.router.navigate(['/media-blocks']);
        break;
      case 'forms':
        this.router.navigate(['/forms']);
        break;
      default:
        this.router.navigate(['/create-story']); // Updated fallback to match your default route
    }
  }

  // New methods for handling platform-specific sidebar navigation
  onWhatsAppSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars(true);
    switch (item) {
      case 'publish':
        this.router.navigate(['/whatsapp-publisher']);
        break;
      // Add other WhatsApp-specific routes as needed
      default:
        this.router.navigate(['/whatsapp-publisher']);
    }
  }

  onInstagramSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars(true);
    switch (item) {
      case 'publish':
        this.router.navigate(['/instagram-publisher']);
        break;
      // Add other Instagram-specific routes as needed
      default:
        this.router.navigate(['/instagram-publisher']);
    }
  }

  onMessengerSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars(true);
    switch (item) {
      case 'publish':
        this.router.navigate(['/facebook-publisher']);
        break;
      // Add other Messenger-specific routes as needed
      default:
        this.router.navigate(['/facebook-publisher']);
    }
  }

  onTelegramSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars(true);
    switch (item) {
      case 'publish':
        this.router.navigate(['/connect-to-telegram']);
        break;
      // Add other Telegram-specific routes as needed
      default:
        this.router.navigate(['/connect-to-telegram']);
    }
  }

  onSMSSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars(true);
    switch (item) {
      case 'publish':
        this.router.navigate(['/twilio-sms']);
        break;
      // Add other SMS-specific routes as needed
      default:
        this.router.navigate(['/twilio-sms']);
    }
  }

  navigateToPartnerDashboard(): void {
    this.router.navigate(['/partner-dashboard']);
  }
}
