import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @Output() closeSidebarEvent = new EventEmitter<void>();

  // Existing properties
  showAlternateResponses: boolean = false;
  showSearchVariableCard: boolean = false;
  newAlternateResponse: string = '';
  newQuickReply: string = '';

  // Info Modal Properties
  showInfoModal: boolean = false;
  // infoModalContent: string = ''; // No longer needed directly for insertion
  infoModalAlternateResponse: string = ''; // Used for highlighting selected variable in modal
  // infoModalQuickReplies: string = ''; // Not used for this logic
  searchTerm: string = '';

  // Property to track which input opened the modal
  private activeInputElementType: 'content' | 'alternateResponse' | null = null;

  // ViewChild to get direct reference to the textarea elements
  @ViewChild('contentAutosize', { read: ElementRef }) contentAutosizeElement!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('newAlternateResponseAutosize', { read: ElementRef }) newAlternateResponseAutosizeElement!: ElementRef<HTMLTextAreaElement>;

  // Variables for the modal
  generalAttributes: string[] = [
    '{first_name}',
    '{last_name}',
    '{timezone}',
    '{gender}',
    '{last_user_msg}',
    '{last_page}',
    '{os}'
  ];

  formAttributes: string[] = [
    '{user/last_user_message}',
    '{user/last_bot_message}',
    '{user/last_user_button}',
    '{user/created_at}',
    '{user/mens_watch}',
    '{user/Range}',
    '{user/Price}',
    '{user/Name}'
  ];

  userAttributes: string[] = [
    '{user/Gender}'
  ];

  // Filtered attributes for search
  filteredGeneralAttributes: string[] = [];
  filteredFormAttributes: string[] = [];
  filteredUserAttributes: string[] = [];

  ngOnInit(): void {
    // Initialize alternateResponses and quickReplies arrays if undefined
    if (!this.block.alternateResponses) {
      this.block.alternateResponses = [];
    }
    if (!this.block.quickReplies) {
      this.block.quickReplies = [];
    }

    // Initialize filtered attributes
    this.resetFilteredAttributes();
  }

  // Info Modal Methods
  /**
   * Opens the info modal and sets which input field triggered it.
   * @param inputType 'content' for main bot response, 'alternateResponse' for alternate response input.
   */
  openInfoModal(inputType: 'content' | 'alternateResponse'): void {
    this.showInfoModal = true;
    this.activeInputElementType = inputType; // Store the type of input that opened the modal
    this.searchTerm = '';
    this.resetFilteredAttributes();
  }

  closeInfoModal(): void {
    this.showInfoModal = false;
    this.searchTerm = '';
    this.resetFilteredAttributes();
    this.activeInputElementType = null; // Clear the active input type
  }

  /**
   * Inserts the selected variable into the currently active textarea.
   * @param variable The variable string to insert (e.g., '{first_name}').
   */
  selectVariable(variable: string): void {
    // This is for visual selection in the modal, not direct input binding.
    this.infoModalAlternateResponse = variable;

    let targetTextarea: HTMLTextAreaElement | null = null;
    let targetModel: 'block.content' | 'newAlternateResponse' | null = null;

    // Determine which textarea to target based on what opened the modal
    if (this.activeInputElementType === 'content' && this.contentAutosizeElement) {
      targetTextarea = this.contentAutosizeElement.nativeElement;
      targetModel = 'block.content';
    } else if (this.activeInputElementType === 'alternateResponse' && this.newAlternateResponseAutosizeElement) {
      targetTextarea = this.newAlternateResponseAutosizeElement.nativeElement;
      targetModel = 'newAlternateResponse';
    }

    if (targetTextarea && targetModel) {
      const start = targetTextarea.selectionStart;
      const end = targetTextarea.selectionEnd;
      const currentValue = targetTextarea.value;

      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);

      // Update the correct model property
      if (targetModel === 'block.content') {
        this.block.content = newValue;
      } else if (targetModel === 'newAlternateResponse') {
        this.newAlternateResponse = newValue;
      }

      // Manually update the textarea's value and cursor position for immediate UI reflection
      // This is crucial because ngModel might not update immediately after direct DOM manipulation
      targetTextarea.value = newValue;
      targetTextarea.selectionStart = targetTextarea.selectionEnd = start + variable.length;

      // Ensure the model change is propagated and component state is consistent
      this.onContentChange();
    }

    this.closeInfoModal();
  }

  filterVariables(): void {
    const searchLower = this.searchTerm.toLowerCase();

    this.filteredGeneralAttributes = this.generalAttributes.filter(attr =>
      attr.toLowerCase().includes(searchLower)
    );

    this.filteredFormAttributes = this.formAttributes.filter(attr =>
      attr.toLowerCase().includes(searchLower)
    );

    this.filteredUserAttributes = this.userAttributes.filter(attr =>
      attr.toLowerCase().includes(searchLower)
    );
  }

  resetFilteredAttributes(): void {
    this.filteredGeneralAttributes = [...this.generalAttributes];
    this.filteredFormAttributes = [...this.formAttributes];
    this.filteredUserAttributes = [...this.userAttributes];
  }

  // Removed addAlternateResponseFromModal and hideAlternateResponsesFromModal
  // as their functionality is now integrated into selectVariable and addAlternateResponse

  generateFromAI(): void {
    // TODO: Implement AI generation logic
    console.log('Generate from AI clicked');
  }


  // Existing Methods (modified for clarity or consistency)
  toggleAlternateResponses() {
    this.showAlternateResponses = !this.showAlternateResponses;
    // When toggling open, ensure the input is clear and focused if possible
    if (this.showAlternateResponses) {
      this.newAlternateResponse = ''; // Clear previous input
    }
  }

  toggleSearchVariableCard() {
    this.showSearchVariableCard = !this.showSearchVariableCard;
  }

  addAlternateResponse() {
    if (this.newAlternateResponse.trim()) {
      // Ensure the array exists before pushing
      if (!this.block.alternateResponses) {
        this.block.alternateResponses = [];
      }
      this.block.alternateResponses.push(this.newAlternateResponse.trim());
      this.newAlternateResponse = ''; // Clear the input after adding
      this.onContentChange();
    }
  }

  removeAlternateResponse(index: number) {
    this.block.alternateResponses?.splice(index, 1);
    this.onContentChange();
  }

  // Add quick reply to the block
  addQuickReplyToBlock(): void {
    if (this.newQuickReply.trim()) {
      if (!this.block.quickReplies) {
        this.block.quickReplies = [];
      }
      
      this.block.quickReplies.push({
        text: this.newQuickReply.trim(),
        value: this.newQuickReply.trim(),
        id: ''
      });
      
      this.newQuickReply = '';
      this.onContentChange(); // This will emit the blockUpdated event
    }
  }

  // Add quick reply on Enter key
  addQuickReply(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addQuickReplyToBlock();
    }
  }

  // Remove quick reply
  removeQuickReply(replyToRemove: any): void {
    if (this.block.quickReplies) {
      this.block.quickReplies = this.block.quickReplies.filter(reply => reply !== replyToRemove);
      this.onContentChange(); // This will emit the blockUpdated event
    }
  }

  onContentChange() {
    // This method is called whenever block.content, newAlternateResponse,
    // or block.alternateResponses/quickReplies are modified via ngModel or direct manipulation.
    this.blockUpdated.emit(this.block);
  }

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

  closeSidebar(): void {
    this.closeSidebarEvent.emit();
  }
}