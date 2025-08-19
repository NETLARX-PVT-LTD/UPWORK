import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BrandingSettings {
  botName?: string;
  botSubheading?: string;
  homeMessage?: string;
   botImage?: string | null; // This will be the widget icon
  profileImage?: string | null; // Add this for the profile picture
  selectedAvatar?: { id: number; icon: string; selected: boolean };
  showChatAvatarAsWidget?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  landingTitle?: string;
  landingDescription?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  private brandingSubject = new BehaviorSubject<BrandingSettings | null>(null);
  public branding$ = this.brandingSubject.asObservable();

  constructor() {
    // Load initial branding from localStorage
    this.loadBrandingFromStorage();
  }

  private loadBrandingFromStorage(): void {
    try {
      const savedBranding = localStorage.getItem('chatbotBranding');
      if (savedBranding) {
        const parsedBranding = JSON.parse(savedBranding);
        this.brandingSubject.next(parsedBranding);
      }
    } catch (error) {
      console.error('Error loading branding from localStorage:', error);
      // If localStorage fails, provide default values
      this.setDefaultBranding();
    }
  }

  private setDefaultBranding(): void {
    const defaultBranding: BrandingSettings = {
      botName: 'Jarvis',
      homeMessage: 'Hi! How can I help you today?',
      primaryColor: '#00BCD4',
      secondaryColor: '#ffffff',
      landingTitle: 'Chat with our AI Assistant',
      landingDescription: 'Get instant answers to your questions'
    };
    this.brandingSubject.next(defaultBranding);
  }

  saveBranding(brandingData: BrandingSettings): void {
    try {
      // Save to localStorage
      localStorage.setItem('chatbotBranding', JSON.stringify(brandingData));
      // Emit the new branding data
      this.brandingSubject.next(brandingData);
    } catch (error) {
      console.error('Error saving branding to localStorage:', error);
      // Even if localStorage fails, still emit the data for current session
      this.brandingSubject.next(brandingData);
    }
  }

  getBranding(): BrandingSettings | null {
    return this.brandingSubject.getValue();
  }

  updateBrandingProperty(property: keyof BrandingSettings, value: any): void {
    const currentBranding = this.getBranding() || {};
    const updatedBranding = { ...currentBranding, [property]: value };
    this.saveBranding(updatedBranding);
  }

  resetBranding(): void {
    try {
      localStorage.removeItem('chatbotBranding');
    } catch (error) {
      console.error('Error removing branding from localStorage:', error);
    }
    this.setDefaultBranding();
  }
}