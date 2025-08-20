import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageMessageComponent } from '../page-message/page-message.component';

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

@Component({
  selector: 'app-page-messages-list',
  standalone: true,
  imports: [CommonModule, PageMessageComponent],
    templateUrl: './page-messages-list.component.html',
  styleUrls: ['./page-messages-list.component.scss']
})
export class PageMessagesListComponent implements OnInit {
  pageMessages: PageMessage[] = [];
  showPageMessageForm = false;
  selectedMessage?: PageMessage;
  availableStories: any[] = []; // Add your stories here

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadPageMessages();
  }

  createNewPageMessage(): void {
    this.selectedMessage = undefined;
    this.showPageMessageForm = true;
  }

  editMessage(message: PageMessage): void {
    this.selectedMessage = { ...message };
    this.showPageMessageForm = true;
  }

  deleteMessage(messageId: string): void {
    if (confirm('Are you sure you want to delete this page message?')) {
      this.pageMessages = this.pageMessages.filter(m => m.id !== messageId);
      this.savePageMessages();
    }
  }

  duplicateMessage(message: PageMessage): void {
    const duplicated: PageMessage = {
      ...message,
      id: this.generateId(),
    };
    this.pageMessages.push(duplicated);
    this.savePageMessages();
  }

  onMessageSaved(message: PageMessage): void {
    const existingIndex = this.pageMessages.findIndex(m => m.id === message.id);
    
    if (existingIndex >= 0) {
      // Update existing message
      this.pageMessages[existingIndex] = message;
    } else {
      // Add new message
      this.pageMessages.push(message);
    }
    
    this.savePageMessages();
    this.showPageMessageForm = false;
    this.selectedMessage = undefined;
  }

  onMessageCancel(): void {
    this.showPageMessageForm = false;
    this.selectedMessage = undefined;
  }

  private loadPageMessages(): void {
    // Load from localStorage or service
    const saved = localStorage.getItem('pageMessages');
    if (saved) {
      this.pageMessages = JSON.parse(saved);
    }
  }

  private savePageMessages(): void {
    // Save to localStorage or service
    localStorage.setItem('pageMessages', JSON.stringify(this.pageMessages));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}