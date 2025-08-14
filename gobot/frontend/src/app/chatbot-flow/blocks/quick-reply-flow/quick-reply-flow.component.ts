// src/app/chatbot-flow/blocks/quick-reply-flow/quick-reply-flow.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { QuickReply } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-quick-reply-flow',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './quick-reply-flow.component.html',
  styleUrls: ['./quick-reply-flow.component.scss']
})
export class QuickReplyFlowComponent {
  @Input() quickReplies: QuickReply[] = [];
  @Input() parentBlockId: string = '';
  
  @Output() quickReplySelected = new EventEmitter<{
    parentBlockId: string,
    quickReply: QuickReply
  }>();
  
  @Output() startConnection = new EventEmitter<{event: MouseEvent, type: string}>();
  
  onQuickReplyClick(quickReply: QuickReply) {
    this.quickReplySelected.emit({
      parentBlockId: this.parentBlockId,
      quickReply: quickReply
    });
  }

  onStartConnection(event: MouseEvent, type: string) {
    this.startConnection.emit({event, type});
  }

  getConnectionLinePosition(index: number): { left: number, width: number } {
    // Calculate position for connection lines from Quick Replies block to individual cards
    const cardWidth = 180; // Width of each quick reply card
    const gap = 20; // Gap between cards
    const totalWidth = this.quickReplies.length * cardWidth + (this.quickReplies.length - 1) * gap;
    
    // Center the cards under the Quick Replies block
    const containerWidth = 800; // Total width of the flow container
    const startLeft = (containerWidth - totalWidth) / 2;
    
    const cardLeft = startLeft + index * (cardWidth + gap);
    const quickRepliesBlockCenter = containerWidth / 2; // Center of the Quick Replies block
    
    // Calculate the actual width needed for the connection line
    const cardCenter = cardLeft + cardWidth / 2;
    const lineWidth = Math.abs(cardCenter - quickRepliesBlockCenter);
    
    // Always start from the Quick Replies block center
    return {
      left: quickRepliesBlockCenter,
      width: lineWidth
    };
  }
}