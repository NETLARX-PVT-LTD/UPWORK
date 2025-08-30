// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Import the necessary Angular Material modules
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
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
  
  showChatbotAISidebar: boolean = false;

  private leaveTimer: any;
  private destroy$ = new Subject<void>();
  sidebarAnimationClass: string = '';

  // New properties to control visibility
  showHeader: boolean = true;
  showAside: boolean = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
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

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;

      // Paths where BOTH header and aside should be hidden
      const noHeaderAndAsidePaths = ['/create-story', '/chatbot-widget', '/partner-dashboard'];
      
      // Paths where ONLY the header should be hidden
      const noHeaderOnlyPaths = ['/live-chat'];
      
      // Set showHeader to true if the URL does NOT include any of the header-hiding paths
      this.showHeader = !noHeaderOnlyPaths.some(path => url.includes(path)) && !noHeaderAndAsidePaths.some(path => url.includes(path)) && !url.startsWith('/landing/');
      
      // Set showAside to true if the URL does NOT include any of the aside-hiding paths
      this.showAside = !noHeaderAndAsidePaths.some(path => url.includes(path)) && !url.startsWith('/landing/');
      
      console.log('Current route:', url);
      console.log('Show header:', this.showHeader);
      console.log('Show aside:', this.showAside);
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
  
  onChatbotAIClick() {
    this.closeAllSidebars(true); 
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
    }, 500); 
  }

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

  onSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars(true);
    switch (item) {
      case 'publish':
        this.router.navigate(['/publish-bot']);
        break;
      case 'menu':
        this.router.navigate(['/chatbot-menu']);
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
        this.router.navigate(['/manage-stories']);
        break;
      case 'ai-assistants':
        this.router.navigate(['/assistants']);
        break;
      case 'blocks':
        this.router.navigate(['/media-blocks']);
        break;
      case 'forms':
        this.router.navigate(['/forms']);
        break;
        case 'chats':
        this.router.navigate(['/live-chat']);
        break;
        case 'analytics':
        this.router.navigate(['/chatbot-analytics']);
        break;
        case 'users':
        this.router.navigate(['/users']);
        break;
      default:
        this.router.navigate(['/create-story']);
    }
  }

  onWhatsAppSidebarNavClick(item: string, event: Event) {
    event.preventDefault();
    this.closeAllSidebars(true);
    switch (item) {
      case 'publish':
        this.router.navigate(['/whatsapp-publisher']);
        break;
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
      default:
        this.router.navigate(['/twilio-sms']);
    }
  }

  navigateToPartnerDashboard(): void {
    this.router.navigate(['/partner-dashboard']);
  }
}