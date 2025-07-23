// src/app/chatbot-flow/blocks/text-response-block/text-response-block.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ChatbotBlock, QuickReply } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-text-response-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    CdkTextareaAutosize
  ],
  templateUrl: './text-response-block.component.html',
  styleUrls: ['./text-response-block.component.scss']
})
export class TextResponseBlockComponent implements OnInit {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();

  showAlternateResponses: boolean = false;
  showSearchVariableCard: boolean = false; // New property for Search Variable card visibility
  newAlternateResponse: string = '';
  newQuickReply: string = '';

  ngOnInit(): void {
    // Initialize alternateResponses and quickReplies arrays if undefined
    if (!this.block.alternateResponses) {
      this.block.alternateResponses = [];
    }
    if (!this.block.quickReplies) {
      this.block.quickReplies = [];
    }
  }

  toggleAlternateResponses() {
    this.showAlternateResponses = !this.showAlternateResponses;
  }

  // New method to toggle Search Variable card visibility
  toggleSearchVariableCard() {
    this.showSearchVariableCard = !this.showSearchVariableCard;
  }

  addAlternateResponse() {
    if (this.newAlternateResponse.trim()) {
      this.block.alternateResponses?.push(this.newAlternateResponse.trim());
      this.newAlternateResponse = '';
      this.onContentChange();
    }
  }

  removeAlternateResponse(index: number) {
    this.block.alternateResponses?.splice(index, 1);
    this.onContentChange();
  }

  addQuickReply(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.newQuickReply.trim()) {
      event.preventDefault();
      this.addQuickReplyToBlock();
    }
  }

  // Separate method to add quick reply (can be called from Enter key or button click)
  addQuickReplyToBlock() {
    const replyText = this.newQuickReply.trim();
    if (replyText && this.block.quickReplies) {
      // Check if quick reply already exists
      const exists = this.block.quickReplies.some(qr => qr.text.toLowerCase() === replyText.toLowerCase());
      if (!exists) {
        this.block.quickReplies.push({ 
          id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          text: replyText 
        });
        this.newQuickReply = '';
        this.onContentChange();
      }
    }
  }

  removeQuickReply(quickReply: QuickReply) {
    if (this.block.quickReplies) {
      this.block.quickReplies = this.block.quickReplies.filter(qr => qr.id !== quickReply.id);
      this.onContentChange();
    }
  }

  onContentChange() {
    this.blockUpdated.emit(this.block);
  }

  // Emit events to parent for actions
  onSelectBlock() {
    this.selectBlock.emit(this.block);
  }

  onStartConnection(event: MouseEvent) {
    this.startConnection.emit(event);
  }

  onEndConnection(event: MouseEvent) {
    this.endConnection.emit(event);
  }

  onRemoveBlock() {
    this.removeBlock.emit(this.block.id);
  }

  onDuplicateBlock() {
    this.duplicateBlock.emit(this.block);
  }

  onEditBlock() {
    this.editBlock.emit(this.block);
  }
}