import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { ChatbotBlock } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-user-input-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
export class UserInputBlockComponent implements OnInit, OnChanges {
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
  @Output() closeSidebarEvent = new EventEmitter<void>();
  @Output() addKeywordGroupBlock = new EventEmitter<void>();

  selectedInputMode: 'keyword' | 'variable' = 'keyword';
  keywordFormControls: FormControl[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  availableVariables: string[] = [
    'location', 'datetime', 'email', 'number', 
    'local_search_query', 'amount_of_money', 'url', 'Gender'
  ];

  constructor() { }

  ngOnInit(): void {
    this.initializeInputMode();
    this.initializeKeywordGroups();
    this.initializePhrases(); // <-- ADD THIS
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['block']) {
      this.initializeInputMode();
      this.initializeKeywordGroups();
      this.initializePhrases(); // <-- AND THIS
    }
  }

  // --- ADD THIS NEW FUNCTION ---
  private initializePhrases(): void {
    if (this.block.subType === 'phrase') {
      if (this.block.phraseText === undefined || this.block.phraseText === null) {
        this.block.phraseText = '';
      }
      if (this.block.similarPhrases === undefined || this.block.similarPhrases === null) {
        this.block.similarPhrases = '';
      }
    }
  }
  // --- END OF NEW FUNCTION ---

  private initializeInputMode(): void {
    if (this.block.datastoreVariable) {
      this.selectedInputMode = 'variable';
    } else {
      this.selectedInputMode = 'keyword';
    }
  }

  private initializeKeywordGroups(): void {
    if (this.block.subType === 'keywordGroup') {
      if (!this.block.keywordGroups || this.block.keywordGroups.length === 0) {
        this.block.keywordGroups = [[]];
      }
    }
    this.keywordFormControls = (this.block.keywordGroups || []).map(() => new FormControl(''));
  }

  onContentChange(): void {
    this.blockUpdated.emit(this.block);
  }

  addKeyword(event: MatChipInputEvent, groupIndex: number): void {
    const value = (event.value || '').trim();
    if (value && this.block.keywordGroups && this.block.keywordGroups[groupIndex]) {
      if (!this.block.keywordGroups[groupIndex].includes(value)) {
        this.block.keywordGroups[groupIndex].push(value);
        this.onContentChange();
      }
    }
    if (this.keywordFormControls[groupIndex]) {
      this.keywordFormControls[groupIndex].setValue(null);
    }
    event.chipInput!.clear();
  }

  removeKeyword(keyword: string, groupIndex: number): void {
    if (this.block.keywordGroups && this.block.keywordGroups[groupIndex]) {
      const index = this.block.keywordGroups[groupIndex].indexOf(keyword);
      if (index >= 0) {
        this.block.keywordGroups[groupIndex].splice(index, 1);
        this.onContentChange();
      }
    }
  }

  addKeywordInputGroup(): void {
    if (this.block.subType === 'keywordGroup') {
      if (!this.block.keywordGroups) {
        this.block.keywordGroups = [];
      }
      this.block.keywordGroups.push([]);
      this.keywordFormControls.push(new FormControl(''));
      this.onContentChange();
    }
  }

  removeKeywordInputGroup(groupIndex: number): void {
    if (this.block.keywordGroups && this.block.keywordGroups.length > 1) {
      this.block.keywordGroups.splice(groupIndex, 1);
      this.keywordFormControls.splice(groupIndex, 1);
      this.onContentChange();
    } else if (this.block.keywordGroups && this.block.keywordGroups.length === 1) {
      this.block.keywordGroups[0] = [];
      this.onContentChange();
    }
  }

  onInputModeChange(mode: 'keyword' | 'variable') {
    this.selectedInputMode = mode;
    if (this.block.subType === 'keywordGroup') {
      if (this.selectedInputMode === 'keyword') {
        this.block.datastoreVariable = undefined;
        if (!this.block.keywordGroups || this.block.keywordGroups.length === 0) {
          this.block.keywordGroups = [[]];
        }
      } else {
        this.block.keywordGroups = undefined;
        this.keywordFormControls = [];
      }
    }
    this.onContentChange();
  }

  onBlockClick(): void {
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

  onAddKeywordGroupBlockToCanvas(): void {
    this.addKeywordGroupBlock.emit();
  }

  closeSidebar(): void {
    this.closeSidebarEvent.emit();
  }
}