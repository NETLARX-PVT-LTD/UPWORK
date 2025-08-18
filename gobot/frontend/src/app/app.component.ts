// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Import the necessary Angular Material modules
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
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
    // The header and aside will now be hidden for both '/create-story' AND '/chatbot-widget' paths.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      this.showHeaderAndAside = !url.includes('/create-story') && !url.includes('/chatbot-widget') && !url.startsWith('/landing/');
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

  closeAllSidebars() {
    this.showWebsiteSidebar = false;
    this.showWhatsAppSidebar = false;
    this.showInstagramSidebar = false;
    this.showMessengerSidebar = false;
    this.showTelegramSidebar = false;
    this.showSMSSidebar = false;
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
    this.closeWebsiteChatbotSidebar(); // Close sidebar on navigation
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
        this.router.navigate(['/settings']);
        break;
      case 'messaging':
        this.router.navigate(['/messaging']);
        break;
      default:
        this.router.navigate(['/create-story']); // Updated fallback to match your default route
    }
  }

  // New methods for handling platform-specific sidebar navigation
  onWhatsAppSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars();
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
    this.closeAllSidebars();
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
    this.closeAllSidebars();
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
    this.closeAllSidebars();
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
    this.closeAllSidebars();
    switch (item) {
      case 'publish':
        this.router.navigate(['/twilio-sms']);
        break;
      // Add other SMS-specific routes as needed
      default:
        this.router.navigate(['/twilio-sms']);
    }
  }
}