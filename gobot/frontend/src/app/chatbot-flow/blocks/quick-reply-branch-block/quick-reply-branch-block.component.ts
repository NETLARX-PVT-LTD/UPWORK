// src/app/chatbot-flow/quick-reply-branch-block/quick-reply-branch-block.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Assuming you use Material icons
import { ChatbotBlock } from '../../../models/chatbot-block.model'; // Adjust path if necessary

@Component({
  selector: 'app-quick-reply-branch-block',
  standalone: true,
  imports: [CommonModule, MatIconModule], // Include any necessary modules
  template: `
    <div class="quick-replies-main-block">
      <div class="flow-block-header">
        <mat-icon class="block-icon">forum</mat-icon>
        <span class="block-title">Quick Replies</span>
      </div>
      <div class="flow-block-body">
        <p class="block-description">Simple buttons to carry forward the user conversation to a desired path</p>
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
  styleUrls: ['./quick-reply-branch-block.component.scss'] // Or inline styles
})
export class QuickReplyBranchBlockComponent {
  @Input() block!: ChatbotBlock; // <--- ADD THIS LINE
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();
}