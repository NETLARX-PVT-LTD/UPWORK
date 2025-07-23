// src/app/chatbot-flow/blocks/user-input-block/user-input-block.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ChatbotBlock } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-user-input-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatButtonToggleModule
  ],
  templateUrl: './user-input-block.component.html',
  styleUrls: ['./user-input-block.component.scss']
})
export class UserInputBlockComponent implements OnInit {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false; // To know if this block is selected in the main flow
  @Input() isSidebarOpen: boolean = false; // To know if the sidebar is open

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();


  selectedInputMode: 'keyword' | 'variable' = 'keyword';
  newKeyword: string = '';

  ngOnInit(): void {
    // Initialize selectedInputMode based on block's subType if it's a userInput block
    if (this.block.type === 'userInput') {
      if (this.block.subType === 'keywordGroup') {
        this.selectedInputMode = 'keyword';
        // Ensure keywords array exists for keywordGroup
        if (!this.block.keywords) {
          this.block.keywords = [];
        }
      } else {
        // For 'phrase' or 'anything', default to 'keyword' or handle as needed
        this.selectedInputMode = 'keyword';
      }
    }
  }

  onInputModeChange(event: any) {
    this.selectedInputMode = event.value;
    // Potentially update block.subType based on this, or keep it separate
    // For now, we'll assume subType is fixed on block creation.
    console.log('Selected Input Mode:', this.selectedInputMode);
  }

  addKeyword(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Enter' && input.value.trim()) {
      if (!this.block.keywords) {
        this.block.keywords = [];
      }
      this.block.keywords.push(input.value.trim());
      input.value = '';
      event.preventDefault();
      this.blockUpdated.emit(this.block); // Notify parent of update
    }
  }

  removeKeyword(keyword: string) {
    if (this.block.keywords) {
      this.block.keywords = this.block.keywords.filter(k => k !== keyword);
      this.blockUpdated.emit(this.block); // Notify parent of update
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

  // Helper for ngModelChange on phraseText and customMessage
  onContentChange() {
    this.blockUpdated.emit(this.block);
  }
}
