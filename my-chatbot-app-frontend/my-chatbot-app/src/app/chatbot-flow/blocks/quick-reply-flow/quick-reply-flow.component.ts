// src/app/chatbot-flow/blocks/quick-reply-flow/quick-reply-flow.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { QuickReply } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-quick-reply-flow',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <!-- Connection line from parent block -->
    <div class="connection-line-from-parent"></div>

    <!-- No Quick Reply and Quick Replies container blocks -->
    <div class="quick-replies-flow-container">
      <!-- Left side: No Quick Reply block -->
      <div class="no-quick-reply-block">
        <div class="flow-block-header">
          <mat-icon class="block-icon">block</mat-icon>
          <span class="block-title">No Quick Reply</span>
        </div>
        <div class="flow-block-body">
          <p class="block-description">Continue without using quick reply modules from the user input</p>
        </div>
        <div class="connection-point connection-output">
          <div class="connection-dot"></div>
        </div>
      </div>

      <!-- Right side: Quick Replies block -->
      <div class="quick-replies-main-block">
        <div class="flow-block-header">
          <mat-icon class="block-icon">forum</mat-icon>
          <span class="block-title">Quick Replies</span>
        </div>
        <div class="flow-block-body">
          <p class="block-description">Simple buttons to carry forward the user conversation to a desired path</p>
        </div>
        <div class="connection-point connection-output">
          <div class="connection-dot"></div>
        </div>
      </div>
    </div>

    <!-- Connection line to individual quick reply cards -->
    <div class="connection-line-to-individual-replies"></div>

    <!-- Individual Quick Reply Cards -->
    <div class="individual-quick-replies">
      <div class="quick-reply-cards-row">
        <div *ngFor="let reply of quickReplies; let i = index" class="individual-quick-reply-card">
          <div class="quick-reply-card-header">
            <mat-icon class="quick-reply-icon">chat_bubble</mat-icon>
            <span class="quick-reply-label">Quick Reply:</span>
            <span class="quick-reply-status">{{ reply.text }}</span>
          </div>
          <div class="connection-point connection-output">
            <div class="connection-dot"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./quick-reply-flow.component.scss']
})
export class QuickReplyFlowComponent {
  @Input() quickReplies: QuickReply[] = [];
  @Input() parentBlockId: string = '';
  
  @Output() quickReplySelected = new EventEmitter<{
    parentBlockId: string,
    quickReply: QuickReply
  }>();
  
  onQuickReplyClick(quickReply: QuickReply) {
    this.quickReplySelected.emit({
      parentBlockId: this.parentBlockId,
      quickReply: quickReply
    });
  }
}