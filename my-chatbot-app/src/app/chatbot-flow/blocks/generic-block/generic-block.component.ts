// src/app/chatbot-flow/blocks/generic-block/generic-block.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu'; // Import MatMenuModule
import { MatButtonModule } from '@angular/material/button';
import { ChatbotBlock } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-generic-block',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule, // Add MatMenuModule here
    MatButtonModule
  ],
  templateUrl: './generic-block.component.html',
  styleUrls: ['./generic-block.component.scss']
})
export class GenericBlockComponent implements OnInit {
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

  ngOnInit(): void {
    // Initialization logic for generic blocks if needed
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

  onContentChange() {
    this.blockUpdated.emit(this.block);
  }
}
