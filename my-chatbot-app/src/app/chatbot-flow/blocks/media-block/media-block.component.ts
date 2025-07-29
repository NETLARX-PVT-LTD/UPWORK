// src/app/chatbot-flow/blocks/media-block/media-block.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
    MatSnackBarModule
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
  showTextMessageIntegrationCard: boolean = false; // NEW: Property to control text message integration card visibility
  // You might want to define a property on your block to store the button's text message content
  // For example, block.buttonTextMessageContent: string;
  // If your ChatbotBlock model doesn't have it, add it there, or manage it separately here.
  // For now, I'll assume `block` can hold a property like `currentButtonTextMessageContent`.
  // A better long-term solution would be to have a `buttons` array on `ChatbotBlock`
  // and manage button data within each button object. For this specific request,
  // I'll add a simple property to the component to simulate button content for the integration card.
  currentButtonTextMessageContent: string = ''; // NEW: To hold the text message for the integration card

  constructor(private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    // Ensure all potentially undefined block properties are initialized with sensible defaults
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
    // Initialize currentButtonTextMessageContent if it's meant to persist with the block
    // For this example, we'll assume it's transient or handled by a more complex button structure.
    // If you add `buttonTextMessageContent` to ChatbotBlock, initialize it here.
    // if (this.block.buttonTextMessageContent === undefined) {
    //   this.block.buttonTextMessageContent = '';
    // }


    // When the sidebar opens for an existing block, ensure its media details are loaded
    if (this.isSelected && this.block.mediaId) {
      const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
      if (selected) {
        this.block.mediaName = selected.name;
        this.block.mediaType = selected.type;
        this.block.content = selected.content;
        this.block.mediaUrl = selected.url;
      }
    }
  }

  onMediaSelectionChange(): void {
    const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
    if (selected) {
      this.block.mediaName = selected.name;
      this.block.mediaType = selected.type;
      this.block.content = selected.content;
      this.block.mediaUrl = selected.url;
    } else {
      // If "No parent media block" is selected, clear media-related properties
      this.block.mediaName = '';
      this.block.mediaType = 'text';
      this.block.content = '';
      this.block.mediaUrl = '';
    }
    this.blockUpdated.emit(this.block);
    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.showTextMessageIntegrationCard = false; // NEW: Hide text message card on media selection change
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
    this.showTextMessageIntegrationCard = false; // NEW: Hide text message card when creating new media
    this._snackBar.open('Ready to create a new media block. Fill in the details.', 'Dismiss', { duration: 3000 });
  }

  editExistingMediaBlock(): void {
    if (this.block.mediaId) {
      this.showNewMediaForm = true;
      this.onContentChange();
      this.showButtonTypeCard = false;
      this.showTextMessageIntegrationCard = false; // NEW: Hide text message card when editing existing media
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
    this.showTextMessageIntegrationCard = false; // NEW: Hide text message card after saving media
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
    this.showTextMessageIntegrationCard = false; // NEW: Hide text message card on cancel
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
    this.showTextMessageIntegrationCard = false; // NEW: Hide text message card if block selection changes
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
    this.showTextMessageIntegrationCard = false; // NEW: Hide text message card when sidebar closes
  }

  private generateDefaultMediaBlockName(): string {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    return `Media Block ${randomNumber}`;
  }

  // Method to show the button type card
  onAddNewButton(): void {
    this.showButtonTypeCard = true;
    this.showTextMessageIntegrationCard = false; // NEW: Hide text message card when showing button type card
    this._snackBar.open('Select a button type.', 'Dismiss', { duration: 2000 });
  }

  // Method to close the button type card
  closeButtonTypeCard(): void {
    this.showButtonTypeCard = false;
  }

  // NEW: Method to handle "Text Message" button click from the button type card
  onTextMessageButtonClick(): void {
    this.showButtonTypeCard = false; // Hide the button type card
    this.showTextMessageIntegrationCard = true; // Show the text message integration card
    // You might want to initialize `currentButtonTextMessageContent` here if it's per-button
    // For now, it will use its default empty string or previously saved value.
    this._snackBar.open('Configure your text message.', 'Dismiss', { duration: 2000 });
  }

  // NEW: Method to close the text message integration card
  closeTextMessageIntegrationCard(): void {
    this.showTextMessageIntegrationCard = false;
  }

  // NEW: Method to save the text message content from the integration card
  saveTextMessageIntegration(): void {
    if (!this.currentButtonTextMessageContent || this.currentButtonTextMessageContent.trim() === '') {
      this._snackBar.open('Text message cannot be empty.', 'Dismiss', { duration: 3000 });
      return;
    }
    // Here you would typically save `this.currentButtonTextMessageContent`
    // to your `block` model or a specific button object within the block.
    // For example, if your `ChatbotBlock` has a `buttons` array and you're editing a specific button:
    // this.block.buttons[indexOfCurrentButton].textMessage = this.currentButtonTextMessageContent;

    // For this example, we'll just log and provide a success message.
    console.log('Text Message saved:', this.currentButtonTextMessageContent);
    this._snackBar.open('Text Message content saved!', 'Dismiss', { duration: 3000 });
    this.closeTextMessageIntegrationCard(); // Close the card after saving
    // You'd typically emit an event here to notify parent component about block update
    this.blockUpdated.emit(this.block);
  }
}