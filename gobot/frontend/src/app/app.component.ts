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
  showSocialCard: boolean = false;
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
      this.showHeaderAndAside = !url.includes('/create-story') && !url.includes('/chatbot-widget');
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

  onMouseEnter() {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
    }
    this.showSocialCard = true;
  }

  onMouseLeave() {
    this.leaveTimer = setTimeout(() => {
      this.showSocialCard = false;
    }, 300);
  }

  openWebsiteChatbotSidebar() {
    this.showSocialCard = false;
    this.showWebsiteChatbotSidebar = true;
    this.sidebarAnimationClass = 'entering';
  }

  closeWebsiteChatbotSidebar() {
    this.sidebarAnimationClass = 'exiting';
    setTimeout(() => {
      this.showWebsiteChatbotSidebar = false;
      this.sidebarAnimationClass = '';
    }, 200);
  }

  onSocialMediaClick(platform: string, event: Event) {
    event.preventDefault();
    switch (platform) {
      case 'website':
        this.openWebsiteChatbotSidebar();
        break;
      case 'whatsapp':
        console.log('Opening WhatsApp integration...');
        break;
      case 'instagram':
        console.log('Opening Instagram integration...');
        break;
      case 'facebook':
        console.log('Opening Facebook integration...');
        break;
      case 'twitter':
        console.log('Opening Twitter integration...');
        break;
      case 'sms':
        console.log('Opening SMS integration...');
        break;
      default:
        console.log('Unknown platform:', platform);
    }
    this.showSocialCard = false;
  }

  // UPDATED METHOD to navigate using the router
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
        this.router.navigate(['/dashboard']); // Fallback
    }
  }
}
