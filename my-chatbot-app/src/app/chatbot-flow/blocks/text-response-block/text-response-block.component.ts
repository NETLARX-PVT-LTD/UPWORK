// src/app/chatbot-flow/blocks/text-response-block/text-response-block.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { ChatbotBlock } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-text-response-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    TextFieldModule // For cdkTextareaAutosize
  ],
  templateUrl: './text-response-block.component.html',
  styleUrls: ['./text-response-block.component.scss']
})
export class TextResponseBlockComponent {
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
  newAlternateResponse: string = '';

  toggleAlternateResponses() {
    this.showAlternateResponses = !this.showAlternateResponses;
    if (!this.showAlternateResponses) {
      this.newAlternateResponse = ''; // Clear input when hiding
    }
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

  onContentChange() {
    this.blockUpdated.emit(this.block);
  }
}
