// src/app/chatbot-flow/blocks/link-story-block/link-story-block.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ChatbotBlock, AvailableStory } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-link-story-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './link-story-block.component.html',
  styleUrls: ['./link-story-block.component.scss']
})
export class LinkStoryBlockComponent implements OnInit {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;
  @Input() availableStories: AvailableStory[] = []; // List of available stories from parent

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();

  ngOnInit(): void {
    // Set initial linkStoryName if a story is already linked
    if (this.block.linkStoryId) {
      const selectedStory = this.availableStories.find(s => s.id === this.block.linkStoryId);
      if (selectedStory) {
        this.block.linkStoryName = selectedStory.name;
      }
    }
  }

  onStorySelectionChange() {
    const selectedStory = this.availableStories.find(s => s.id === this.block.linkStoryId);
    if (selectedStory) {
      this.block.linkStoryName = selectedStory.name;
    } else {
      this.block.linkStoryName = undefined;
    }
    this.blockUpdated.emit(this.block);
  }

  getStoryName(storyId: string | undefined): string {
    const story = this.availableStories.find(s => s.id === storyId);
    return story ? story.name : 'N/A';
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
