// src/app/chatbot-flow/blocks/typing-delay-block/typing-delay-block.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ChatbotBlock } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-typing-delay-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './typing-delay-block.component.html',
  styleUrls: ['./typing-delay-block.component.scss']
})
export class TypingDelayBlockComponent implements OnInit {
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

  // Local property for the slider, bound to block.delaySeconds
  typingDelay: number = 0;

  ngOnInit(): void {
    if (this.block.delaySeconds === undefined) {
      this.block.delaySeconds = 0; // Default value
    }
    this.typingDelay = this.block.delaySeconds;
  }

  onDelayChange() {
    this.block.delaySeconds = this.typingDelay;
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
