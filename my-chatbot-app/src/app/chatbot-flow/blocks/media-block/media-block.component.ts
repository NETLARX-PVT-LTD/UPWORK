// src/app/chatbot-flow/blocks/media-block/media-block.component.ts
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

import { ChatbotBlock, AvailableMedia } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-media-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    CdkTextareaAutosize
  ],
  templateUrl: './media-block.component.html',
  styleUrls: ['./media-block.component.scss']
})
export class MediaBlockComponent implements OnInit {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;
  @Input() availableMedia: AvailableMedia[] = [];

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();
  @Output() closeSidebarEvent = new EventEmitter<void>();

  showNewMediaForm: boolean = false;
  showButtonTypeCard: boolean = false;
  showTextMessageIntegrationCard: boolean = false;

  // --- NEW PROPERTIES FOR INFO MODAL ---
  showInfoModal: boolean = false;
  private activeInputElementType: 'buttonTitle' | 'buttonTextMessage' | null = null;
  searchTerm: string = '';

  @ViewChild('buttonTitleAutosize', { read: ElementRef }) buttonTitleAutosizeElement!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('buttonTextMessageAutosize', { read: ElementRef }) buttonTextMessageAutosizeElement!: ElementRef<HTMLTextAreaElement>;

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
  // --- END NEW PROPERTIES FOR INFO MODAL ---

  constructor(private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    if (!this.block.mediaType) {
      this.block.mediaType = 'text';
    }
    if (this.block.content === undefined) {
      this.block.content = '';
    }
    if (this.block.mediaUrl === undefined) {
      this.block.mediaUrl = '';
    }
    if (this.block.mediaName === undefined) {
      this.block.mediaName = '';
    }
    if (this.block.buttonTitle === undefined) {
      this.block.buttonTitle = '';
    }
    if (this.block.buttonTextMessage === undefined) {
      this.block.buttonTextMessage = '';
    }

    if (this.isSelected && this.block.mediaId) {
      const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
      if (selected) {
        this.block.mediaName = selected.name;
        this.block.mediaType = selected.type;
        this.block.content = selected.content;
        this.block.mediaUrl = selected.url;
      }
    }

    // NEW: Initialize filtered attributes
    this.resetFilteredAttributes();
  }

  onMediaSelectionChange(): void {
    const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
    if (selected) {
      this.block.mediaName = selected.name;
      this.block.mediaType = selected.type;
      this.block.content = selected.content;
      this.block.mediaUrl = selected.url;
    } else {
      this.block.mediaName = '';
      this.block.mediaType = 'text';
      this.block.content = '';
      this.block.mediaUrl = '';
    }
    this.blockUpdated.emit(this.block);
    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.showTextMessageIntegrationCard = false;
  }

  createNewMediaBlock(): void {
    this.showNewMediaForm = true;
    this.block.mediaId = undefined;
    this.block.mediaName = this.generateDefaultMediaBlockName();
    this.block.mediaType = 'text';
    this.block.content = '';
    this.block.mediaUrl = '';
    this.blockUpdated.emit(this.block);
    this.showButtonTypeCard = false;
    this.showTextMessageIntegrationCard = false;
    this._snackBar.open('Ready to create a new media block. Fill in the details.', 'Dismiss', { duration: 3000 });
  }

  editExistingMediaBlock(): void {
    if (this.block.mediaId) {
      this.showNewMediaForm = true;
      this.onContentChange();
      this.showButtonTypeCard = false;
      this.showTextMessageIntegrationCard = false;
      this._snackBar.open(`Editing Media Block: ${this.getMediaName(this.block.mediaId)}`, 'Dismiss', { duration: 3000 });
    } else {
      this._snackBar.open('Please select a media block to edit first.', 'Dismiss', { duration: 3000 });
    }
  }

  saveMedia(): void {
    const currentMediaType = this.block.mediaType || 'text';

    if (!this.block.mediaName || this.block.mediaName.trim() === '') {
      this._snackBar.open('Media Name cannot be empty.', 'Dismiss', { duration: 3000 });
      return;
    }
    if (currentMediaType === 'text' && (!this.block.content || this.block.content.trim() === '')) {
      this._snackBar.open('Text content cannot be empty for text media type.', 'Dismiss', { duration: 3000 });
      return;
    }

    if (['image', 'video', 'file', 'audio'].includes(currentMediaType) && (!this.block.mediaUrl || this.block.mediaUrl.trim() === '')) {
      this._snackBar.open(`Please provide a URL for ${currentMediaType} media.`, 'Dismiss', { duration: 3000 });
      return;
    }

    const isNewMedia = !this.block.mediaId;

    if (isNewMedia) {
      const newMediaId = 'media-' + Date.now().toString();
      const newMedia: AvailableMedia = {
        id: newMediaId,
        name: this.block.mediaName,
        type: currentMediaType,
        content: this.block.content ?? '',
        url: this.block.mediaUrl ?? ''
      };

      this.availableMedia.push(newMedia);
      this.block.mediaId = newMediaId;

      this._snackBar.open('New Media Block content saved and linked!', 'Dismiss', { duration: 3000 });
    } else {
      const existingMediaIndex = this.availableMedia.findIndex(m => m.id === this.block.mediaId);
      if (existingMediaIndex > -1) {
        this.availableMedia[existingMediaIndex] = {
          ...this.availableMedia[existingMediaIndex],
          name: this.block.mediaName,
          type: currentMediaType,
          content: this.block.content ?? '',
          url: this.block.mediaUrl ?? ''
        };
        this._snackBar.open('Media Block content updated!', 'Dismiss', { duration: 3000 });
      } else {
        this._snackBar.open('Error: Could not find existing media to update.', 'Dismiss', { duration: 3000 });
      }
    }

    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.showTextMessageIntegrationCard = false;
    this.blockUpdated.emit(this.block);
  }

  cancelMediaEdit(): void {
    if (!this.block.mediaId) {
      this.block.mediaId = undefined;
      this.block.mediaName = '';
      this.block.mediaType = 'text';
      this.block.content = '';
      this.block.mediaUrl = '';
    } else {
      const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
      if (selected) {
        this.block.mediaName = selected.name;
        this.block.mediaType = selected.type;
        this.block.content = selected.content;
        this.block.mediaUrl = selected.url;
      }
    }
    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.showTextMessageIntegrationCard = false;
    this.blockUpdated.emit(this.block);
    this._snackBar.open('Media editing/creation canceled.', 'Dismiss', { duration: 2000 });
  }

  getMediaName(mediaId: string | undefined): string {
    const media = this.availableMedia.find(m => m.id === mediaId);
    return media ? media.name : 'No media selected';
  }

  onSelectBlock(): void {
    this.selectBlock.emit(this.block);
    this.showButtonTypeCard = false;
    this.showTextMessageIntegrationCard = false;
  }

  onStartConnection(event: MouseEvent): void {
    this.startConnection.emit(event);
  }

  onEndConnection(event: MouseEvent): void {
    this.endConnection.emit(event);
  }

  onRemoveBlock(): void {
    this.removeBlock.emit(this.block.id);
  }

  onDuplicateBlock(): void {
    this.duplicateBlock.emit(this.block);
  }

  onEditBlock(): void {
    this.editBlock.emit(this.block);
  }

  onContentChange(): void {
    this.blockUpdated.emit(this.block);
  }

  closeSidebar(): void {
    this.closeSidebarEvent.emit();
    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.showTextMessageIntegrationCard = false;
  }

  private generateDefaultMediaBlockName(): string {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    return `Media Block ${randomNumber}`;
  }

  onAddNewButton(): void {
    this.showButtonTypeCard = true;
    this.showTextMessageIntegrationCard = false;
    this._snackBar.open('Select a button type.', 'Dismiss', { duration: 2000 });
  }

  closeButtonTypeCard(): void {
    this.showButtonTypeCard = false;
  }

  onTextMessageButtonClick(): void {
    this.showButtonTypeCard = false;
    this.showTextMessageIntegrationCard = true;
    this._snackBar.open('Configure your text message.', 'Dismiss', { duration: 2000 });
  }

  closeTextMessageIntegrationCard(): void {
    this.showTextMessageIntegrationCard = false;
  }

  saveTextMessageIntegration(): void {
    if (!this.block.buttonTitle || this.block.buttonTitle.trim() === '') {
        this._snackBar.open('Button Title cannot be empty.', 'Dismiss', { duration: 3000 });
        return;
    }

    if (!this.block.buttonTextMessage || this.block.buttonTextMessage.trim() === '') {
        this._snackBar.open('Bot says message cannot be empty.', 'Dismiss', { duration: 3000 });
        return;
    }

    console.log('Button Title saved:', this.block.buttonTitle);
    console.log('Bot says message saved:', this.block.buttonTextMessage);
    this._snackBar.open('Text Message content saved!', 'Dismiss', { duration: 3000 });
    this.closeTextMessageIntegrationCard();
    this.blockUpdated.emit(this.block);
  }

  // --- NEW INFO MODAL METHODS ---
  openInfoModal(inputType: 'buttonTitle' | 'buttonTextMessage'): void {
    this.showInfoModal = true;
    this.activeInputElementType = inputType;
    this.searchTerm = '';
    this.resetFilteredAttributes();
  }

  closeInfoModal(): void {
    this.showInfoModal = false;
    this.searchTerm = '';
    this.resetFilteredAttributes();
    this.activeInputElementType = null;
  }

  selectVariable(variable: string): void {
    let targetTextarea: HTMLTextAreaElement | null = null;
    let targetModelProperty: 'buttonTitle' | 'buttonTextMessage' | null = null;

    if (this.activeInputElementType === 'buttonTitle' && this.buttonTitleAutosizeElement) {
      targetTextarea = this.buttonTitleAutosizeElement.nativeElement;
      targetModelProperty = 'buttonTitle';
    } else if (this.activeInputElementType === 'buttonTextMessage' && this.buttonTextMessageAutosizeElement) {
      targetTextarea = this.buttonTextMessageAutosizeElement.nativeElement;
      targetModelProperty = 'buttonTextMessage';
    }

    if (targetTextarea && targetModelProperty) {
      const start = targetTextarea.selectionStart;
      const end = targetTextarea.selectionEnd;
      const currentValue = targetTextarea.value;

      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);

      this.block[targetModelProperty] = newValue;

      targetTextarea.value = newValue;
      targetTextarea.selectionStart = targetTextarea.selectionEnd = start + variable.length;

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
}