// src/app/chatbot-flow/blocks/user-input-block/user-input-block.component.html (Updated Template)
// <!-- The main block display when not selected -->
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ChatbotBlock } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-user-input-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './user-input-block.component.html',
  styleUrls: ['./user-input-block.component.scss']
})
export class UserInputBlockComponent implements OnInit {
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

  newKeyword: string = '';
  selectedInputMode: 'keyword' | 'variable' = 'keyword';

  // Define availableVariables as a class property
  availableVariables: string[] = [
    'location',
    'datetime',
    'email',
    'number',
    'local_search_query',
    'amount_of_money',
    'url',
    'Gender'
  ];

  ngOnInit(): void {
    // Initialize keywords array if it's undefined
    if (this.block.subType === 'keywordGroup' && !this.block.keywords) {
      this.block.keywords = [];
    }
    // Set initial selectedInputMode based on block's data
    if (this.block.datastoreVariable) {
      this.selectedInputMode = 'variable';
    } else {
      this.selectedInputMode = 'keyword';
    }
  }

  addKeyword(block: ChatbotBlock, event: KeyboardEvent) {
    if ((event.key === 'Enter' || event.key === ',') && this.newKeyword.trim()) {
      event.preventDefault();
      if (block.keywords) {
        const keywordToAdd = this.newKeyword.trim();
        if (!block.keywords.includes(keywordToAdd)) {
          block.keywords.push(keywordToAdd);
          this.newKeyword = '';
          this.blockUpdated.emit(block);
        }
      }
    }
  }

  removeKeyword(block: ChatbotBlock, keyword: string) {
    if (block.keywords) {
      block.keywords = block.keywords.filter(k => k !== keyword);
      this.blockUpdated.emit(block);
    }
  }

  addKeywordFromSidebar(event: KeyboardEvent) {
    if (this.block.subType === 'keywordGroup') {
      this.addKeyword(this.block, event);
    }
  }

  onInputModeChange(mode: 'keyword' | 'variable') {
    this.selectedInputMode = mode;
    // Only clear datastoreVariable when switching to keyword mode
    if (this.selectedInputMode === 'keyword') {
      this.block.datastoreVariable = undefined;
    }
    this.blockUpdated.emit(this.block);
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