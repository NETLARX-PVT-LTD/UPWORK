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
    MatButtonToggleModule
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

  showNewMediaForm: boolean = false;

  ngOnInit(): void {
    this.showNewMediaForm = false;

    if (this.block.mediaId) {
      const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
      if (selected) {
        this.block.mediaName = selected.name;
        this.block.mediaType = selected.type;
        this.block.content = selected.content;
        this.block.mediaUrl = selected.url;
      }
    } else {
      if (!this.block.mediaType) {
        this.block.mediaType = 'text'; // Default to text for new media
      }
    }
  }

  onMediaSelectionChange() {
    const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
    if (selected) {
      this.block.mediaName = selected.name;
      this.block.mediaType = selected.type;
      this.block.content = selected.content;
      this.block.mediaUrl = selected.url;
    } else {
      this.block.mediaName = undefined;
      this.block.mediaType = undefined;
      this.block.content = undefined;
      this.block.mediaUrl = undefined;
    }
    this.blockUpdated.emit(this.block);
  }

  createNewMediaBlock() {
    this.showNewMediaForm = true;
    this.block.mediaId = undefined;
    this.block.mediaName = undefined; // Clear for new
    this.block.mediaType = 'text'; // Default for new
    this.block.content = ''; // Clear for new
    this.block.mediaUrl = ''; // Clear for new
    this.blockUpdated.emit(this.block);
  }

  editExistingMediaBlock() {
    this.showNewMediaForm = true;
    this.onContentChange();
  }

  cancelMediaEdit() {
    if (this.block.mediaId) {
      this.showNewMediaForm = false;
      const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
      if (selected) {
        this.block.mediaName = selected.name;
        this.block.mediaType = selected.type;
        this.block.content = selected.content;
        this.block.mediaUrl = selected.url;
      }
    } else {
      this.showNewMediaForm = false;
      this.block.content = undefined;
      this.block.mediaType = undefined;
      this.block.mediaUrl = undefined;
      this.block.mediaName = undefined;
    }
    this.blockUpdated.emit(this.block);
  }

  getMediaName(mediaId: string | undefined): string {
    const media = this.availableMedia.find(m => m.id === mediaId);
    return media ? media.name : 'No media selected';
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

  onContentChange() {
    this.blockUpdated.emit(this.block);
  }
}