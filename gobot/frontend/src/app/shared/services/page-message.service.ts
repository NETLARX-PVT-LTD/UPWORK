import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PageMessage {
  id?: string;
  urls: string[];
  showAfterDelay: boolean;
  showAfterScroll: boolean;
  delay: number;
  messageType: 'text' | 'story';
  textMessage?: string;
  selectedStory?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PageMessageService {
  private pageMessagesSubject = new BehaviorSubject<PageMessage[]>([]);
  public pageMessages$ = this.pageMessagesSubject.asObservable();

  private storageKey = 'pageMessages';

  constructor() {
    this.loadFromStorage();
  }

  getPageMessages(): PageMessage[] {
    return this.pageMessagesSubject.value;
  }

  getPageMessageById(id: string): PageMessage | undefined {
    return this.pageMessagesSubject.value.find(message => message.id === id);
  }

  savePageMessage(message: PageMessage): void {
    const currentMessages = this.pageMessagesSubject.value;
    const existingIndex = currentMessages.findIndex(m => m.id === message.id);

    if (existingIndex >= 0) {
      // Update existing message
      currentMessages[existingIndex] = message;
    } else {
      // Add new message
      if (!message.id) {
        message.id = this.generateId();
      }
      currentMessages.push(message);
    }

    this.pageMessagesSubject.next([...currentMessages]);
    this.saveToStorage();
  }

  deletePageMessage(id: string): void {
    const currentMessages = this.pageMessagesSubject.value;
    const filteredMessages = currentMessages.filter(m => m.id !== id);
    this.pageMessagesSubject.next(filteredMessages);
    this.saveToStorage();
  }

  duplicatePageMessage(message: PageMessage): PageMessage {
    const duplicated: PageMessage = {
      ...message,
      id: this.generateId(),
    };
    
    const currentMessages = this.pageMessagesSubject.value;
    currentMessages.push(duplicated);
    this.pageMessagesSubject.next([...currentMessages]);
    this.saveToStorage();
    
    return duplicated;
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const messages = JSON.parse(saved);
        this.pageMessagesSubject.next(messages);
      }
    } catch (error) {
      console.error('Error loading page messages from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const messages = this.pageMessagesSubject.value;
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving page messages to storage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}