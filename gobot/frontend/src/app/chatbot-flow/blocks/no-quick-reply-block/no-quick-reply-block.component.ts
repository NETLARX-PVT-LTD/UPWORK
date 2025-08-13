// src/app/chatbot-flow/no-quick-reply-block/no-quick-reply-block.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChatbotBlock } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-no-quick-reply-block',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="no-quick-reply-block">
      <div class="flow-block-header">
        <mat-icon class="block-icon">block</mat-icon>
        <span class="block-title">No Quick Reply</span>
      </div>
      <div class="flow-block-body">
        <p class="block-description">Drag modules from the user input tab</p>
      </div>
      <div class="connection-point connection-output"
           (mousedown)="startConnection.emit($event)">
        <div class="connection-dot"></div>
      </div>
      <div class="connection-point connection-input">
        <div class="connection-dot"></div>
      </div>
    </div>
  `,
  styleUrls: ['./no-quick-reply-block.component.scss']
})
export class NoQuickReplyBlockComponent {
  @Input() block!: ChatbotBlock; // <--- ADD THIS LINE
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();
}