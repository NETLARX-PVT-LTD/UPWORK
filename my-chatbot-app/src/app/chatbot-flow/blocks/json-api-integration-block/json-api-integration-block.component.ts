import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChatbotBlock } from '../../../models/chatbot-block.model';

// Assuming ChatbotBlock and ApiHeader are defined in your models
// You might need to add ApiHeader to your chatbot-block.model.ts
interface ApiHeader {
  key: string;
  value: string;
}

// Extend ChatbotBlock to include JSON API specific properties
// You might want to define a more specific interface for this block type
// For now, I'll extend ChatbotBlock assuming it's a generic block type
interface JsonApiBlock extends ChatbotBlock {
  apiEndpoint?: string;
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiHeaders?: ApiHeader[];
  // Add any other properties specific to JSON API integration
}

@Component({
  selector: 'app-json-api-integration-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './json-api-integration-block.component.html',
  styleUrls: ['./json-api-integration-block.component.scss']
})
export class JsonApiIntegrationBlockComponent implements OnInit {
  @Input() block!: JsonApiBlock; // Use the extended interface
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;

  @Output() blockUpdated = new EventEmitter<JsonApiBlock>();
  @Output() selectBlock = new EventEmitter<JsonApiBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<JsonApiBlock>();
  @Output() editBlock = new EventEmitter<JsonApiBlock>();

  // State for expansion panel
  expandedSection: string = 'apiConfig'; // Default to API config section

  ngOnInit(): void {
    this.initializeBlockProperties();
  }

  /**
   * Initialize block properties with default values for JSON API Integration
   */
  private initializeBlockProperties(): void {
    if (this.block.apiEndpoint === undefined) {
      this.block.apiEndpoint = '';
    }
    if (this.block.requestType === undefined) {
      this.block.requestType = 'POST'; // Default request type as per image
    }
    if (this.block.apiHeaders === undefined) {
      this.block.apiHeaders = []; // Initialize as an empty array
    }

    // Ensure other required properties from ChatbotBlock are present
    this.block.status = this.block.status ?? 'new';
    this.block.x = this.block.x ?? 0;
    this.block.y = this.block.y ?? 0;
    this.block.width = this.block.width ?? 0;
    this.block.height = this.block.height ?? 0;
  }

  /**
   * Adds a new, empty API header field to the list
   */
  addApiHeader(): void {
    if (!this.block.apiHeaders) {
      this.block.apiHeaders = [];
    }
    this.block.apiHeaders.push({ key: '', value: '' });
    this.onContentChange();
  }

  /**
   * Removes an API header at the specified index
   */
  removeApiHeader(index: number): void {
    if (this.block.apiHeaders && this.block.apiHeaders.length > 0) {
      this.block.apiHeaders.splice(index, 1);
      this.onContentChange();
    }
  }

  /**
   * Emits an event when the block itself is selected
   */
  onSelectBlock(): void {
    this.selectBlock.emit(this.block);
  }

  /**
   * Emits an event to signal the start of a connection drag
   */
  onStartConnection(event: MouseEvent): void {
    this.startConnection.emit(event);
  }

  /**
   * Emits an event to signal the end of a connection drag
   */
  onEndConnection(event: MouseEvent): void {
    this.endConnection.emit(event);
  }

  /**
   * Emits an event to request the removal of this block
   */
  onRemoveBlock(): void {
    this.removeBlock.emit(this.block.id);
  }

  /**
   * Emits an event to request the duplication of this block
   */
  onDuplicateBlock(): void {
    this.duplicateBlock.emit(this.block);
  }

  /**
   * Emits an event to request editing of this block
   */
  onEditBlock(): void {
    this.editBlock.emit(this.block);
  }

  /**
   * Emits the blockUpdated event whenever a change is made to the block's content
   */
  onContentChange(): void {
    this.blockUpdated.emit(this.block);
  }
}