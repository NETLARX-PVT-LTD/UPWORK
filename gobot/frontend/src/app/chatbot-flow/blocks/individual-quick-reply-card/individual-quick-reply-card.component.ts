// src/app/chatbot-flow/individual-quick-reply-card/individual-quick-reply-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChatbotBlock, QuickReply } from '../../../models/chatbot-block.model'; // You might need QuickReply here if the block represents one directly

@Component({
  selector: 'app-individual-quick-reply-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="individual-quick-reply-card">
      <div class="quick-reply-card-header">
        <mat-icon class="quick-reply-icon">chat_bubble</mat-icon>
        <span class="quick-reply-label">Quick Reply:</span>
        <span class="quick-reply-status">{{ block.text || 'N/A' }}</span> </div>
      <div class="connection-point connection-output"
           (mousedown)="startConnection.emit($event)">
        <div class="connection-dot"></div>
      </div>
      <div class="connection-point connection-input">
        <div class="connection-dot"></div>
      </div>
    </div>
  `,
  styleUrls: ['./individual-quick-reply-card.component.scss']
})
export class IndividualQuickReplyCardComponent {
  @Input() block!: ChatbotBlock; // <--- ADD THIS LINE (or specific type like QuickReply if that's what this block represents)
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();
}