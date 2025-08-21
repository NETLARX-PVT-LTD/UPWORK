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

  // Make sure this method loads from localStorage AND emits to subscribers
  getPageMessages(): PageMessage[] {
    try {
      const saved = localStorage.getItem('pageMessages');
      const messages = saved ? JSON.parse(saved) : [];
      
      // Always keep subscribers in sync
      this.pageMessagesSubject.next(messages);
      
      return messages;
    } catch (error) {
      console.error('Error loading page messages:', error);
      return [];
    }
  }

  private generateId(): string {
    return `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getPageMessageById(id: string): PageMessage | undefined {
    return this.pageMessagesSubject.value.find(message => message.id === id);
  }

   savePageMessage(message: PageMessage): void {
    const messages = this.getPageMessages();
    const existingIndex = messages.findIndex(m => m.id === message.id);
    
    if (existingIndex >= 0) {
      messages[existingIndex] = message;
    } else {
      if (!message.id) {
        message.id = this.generateId();
      }
      messages.push(message);
    }
    
    // Save to localStorage
    localStorage.setItem('pageMessages', JSON.stringify(messages));
     // Debug log
    console.log('Saved to localStorage:', localStorage.getItem('pageMessages'));
    // Emit changes to subscribers (this will trigger the chatbot widget)
    this.pageMessagesSubject.next(messages);
    
    console.log('Page message saved and synced:', message);
  }

  deletePageMessage(messageId: string): void {
    const messages = this.getPageMessages();
    const filteredMessages = messages.filter(m => m.id !== messageId);
    
    // Save to localStorage
    localStorage.setItem('pageMessages', JSON.stringify(filteredMessages));
    
    // Emit changes to subscribers
    this.pageMessagesSubject.next(filteredMessages);
    
    console.log('Page message deleted and synced:', messageId);
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

  // private generateId(): string {
  //   return Date.now().toString(36) + Math.random().toString(36).substr(2);
  // }
}