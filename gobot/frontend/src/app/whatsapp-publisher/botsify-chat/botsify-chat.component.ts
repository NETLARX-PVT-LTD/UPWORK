// src/app/whatsapp-publisher/botsify-chat/botsify-chat.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { WhatsappService, ChatMessage, LeadData } from '../../shared/services/whatsapp.service';

@Component({
  selector: 'app-botsify-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './botsify-chat.component.html',
  styleUrls: ['./botsify-chat.component.scss']
})
export class BotsifyChatComponent implements OnInit {
  @Input() botId: string = '123456';
  @Output() close = new EventEmitter<void>();
  messages: ChatMessage[] = [];
  userInput: string = '';
  isLeadFormActive: boolean = false;
  leadData: Partial<LeadData> = {};

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit(): void {
    this.startConversation();
  }

  startConversation(): void {
    this.whatsappService.getBotResponse(this.botId, '').subscribe((response: string) => {
      this.addMessage('bot', response);
    });
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    if (this.isLeadFormActive) {
      if (!this.leadData.name) {
        this.leadData.name = this.userInput;
        this.addMessage('user', this.userInput);
        this.userInput = '';
        this.addMessage('bot', 'Please enter your email:');
      } else if (!this.leadData.email) {
        this.leadData.email = this.userInput;
        this.addMessage('user', this.userInput);
        this.whatsappService.collectLead(this.botId, this.leadData.name!, this.leadData.email!).subscribe((response: string) => {
          this.addMessage('bot', response);
          this.isLeadFormActive = false;
          this.leadData = {};
        });
        this.userInput = '';
      }
    } else {
      this.addMessage('user', this.userInput);
      this.whatsappService.getBotResponse(this.botId, this.userInput).subscribe((response: string) => {
        this.addMessage('bot', response);
        if (response.includes('provide your name and email')) {
          this.isLeadFormActive = true;
        } else if (response.includes('Goodbye')) {
          this.close.emit();
        }
      });
      this.userInput = '';
    }
  }

  addMessage(sender: 'user' | 'bot', message: string): void {
    const conversation = this.whatsappService.getConversation(this.botId);
    if (conversation) {
      const messageObj: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender,
        message,
        timestamp: new Date(),
        type: 'text'
      };
      conversation.messages.push(messageObj);
      this.messages = [...conversation.messages];
    }
  }

  onClose(): void {
    this.close.emit();
  }
}