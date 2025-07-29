// src/app/chatbot-flow/blocks/user-input-block/user-input-block.component.ts
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
  // New output for closing the sidebar
  @Output() closeSidebarEvent = new EventEmitter<void>();

  // This output is now primarily for the canvas context menu if you want to add a NEW CANVAS BLOCK
  // from there, not for the sidebar button (which will add a new keyword group row).
  @Output() addKeywordGroupBlock = new EventEmitter<void>();


  selectedInputMode: 'keyword' | 'variable' = 'keyword'; // This belongs to the main block settings

  // Use a FormControl for the chip input within each keyword group
  keywordFormControls: FormControl[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

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

  constructor() { }

   ngOnInit(): void {
    this.initializeInputMode();
    this.initializeKeywordGroups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['block']) {
      this.initializeInputMode();
      this.initializeKeywordGroups();
    }
  }

  private initializeInputMode(): void {
    // Determine the initial mode based on block data
    if (this.block.datastoreVariable) {
      this.selectedInputMode = 'variable';
    } else if (this.block.subType === 'keywordGroup' && this.block.keywordGroups && this.block.keywordGroups.length > 0) {
      this.selectedInputMode = 'keyword';
    } else {
      // Default to keyword if no specific data exists
      this.selectedInputMode = 'keyword';
    }
  }

  private initializeKeywordGroups(): void {
    // Only initialize keywordGroups for 'keywordGroup' subtype blocks
    if (this.block.subType === 'keywordGroup') {
      // Ensure keywordGroups is an array if it's supposed to be in keyword mode
      if (this.selectedInputMode === 'keyword' && (!this.block.keywordGroups || this.block.keywordGroups.length === 0)) {
        this.block.keywordGroups = [[]];
      }
      // If in variable mode, keywordGroups should be undefined or empty, but we might still need the form controls
      // if the button exists and allows adding them.
      // If we are strictly in variable mode, keywordGroups should probably be null or undefined.
      // If you are allowing adding keyword groups while in variable mode, this implies a logical shift.
      // For now, let's keep it clean: if selectedInputMode is 'variable', don't automatically initialize keywordGroups.
      // They will be initialized if 'addKeywordInputGroup' is explicitly called.
    }
    // Re-initialize form controls to match the number of keyword groups that *might* exist
    this.keywordFormControls = (this.block.keywordGroups || []).map(() => new FormControl(''));
  }


  // Generic method to update the block and emit
  onContentChange(): void {
    this.blockUpdated.emit(this.block);
  }

  // --- Keyword Group Management (within the block) ---

  addKeyword(event: MatChipInputEvent, groupIndex: number): void {
    const value = (event.value || '').trim();

    // Ensure block.keywordGroups is initialized before pushing
    if (this.block.subType === 'keywordGroup' && !this.block.keywordGroups) {
      this.block.keywordGroups = [[]]; // Initialize if null, especially if adding keywords in variable mode
    }

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
    // This action is only relevant for 'keywordGroup' subtype blocks
    if (this.block.subType === 'keywordGroup') {
      if (!this.block.keywordGroups) {
        this.block.keywordGroups = []; // Ensure it's an array before pushing
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

  // --- Input Mode Changes ---
  onInputModeChange(mode: 'keyword' | 'variable') {
    this.selectedInputMode = mode;
    if (this.block.subType === 'keywordGroup') { // Only apply this logic if the block is a keywordGroup type
      if (this.selectedInputMode === 'keyword') {
        this.block.datastoreVariable = undefined;
        // Re-initialize keyword groups if switching to keyword mode AND it's a keywordGroup block
        if (!this.block.keywordGroups || this.block.keywordGroups.length === 0) {
          this.block.keywordGroups = [[]];
        }
      } else { // 'variable' mode
        // When switching to variable mode, clear keyword groups if they exist
        // but *do not* initialize them again if they are null, as the button will handle that.
        this.block.keywordGroups = undefined;
        this.keywordFormControls = [];
      }
    }
    this.onContentChange();
  }


  // --- Emit events to parent for canvas actions (if applicable) ---
  onBlockClick(): void {
    this.selectBlock.emit(this.block); //
  }

  onStartConnection(event: MouseEvent) {
    this.startConnection.emit(event); //
  }

  onEndConnection(event: MouseEvent) {
    this.endConnection.emit(event); //
  }

  onRemoveBlock() {
    this.removeBlock.emit(this.block.id); //
  }

  onDuplicateBlock() {
    this.duplicateBlock.emit(this.block); //
  }

  onEditBlock() {
    this.editBlock.emit(this.block); //
  }

  // This method now serves to emit to the parent only if a NEW CANVAS BLOCK
  // needs to be added (e.g., from a context menu option on the canvas itself)
  onAddKeywordGroupBlockToCanvas(): void {
    this.addKeywordGroupBlock.emit(); //
  }

  // New method to close the sidebar
  closeSidebar(): void {
    this.closeSidebarEvent.emit();
  }
}