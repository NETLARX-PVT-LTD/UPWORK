// src/app/chatbot-flow/blocks/conversational-form-block/conversational-form-block.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatbotBlock, AvailableForm, FormField } from '../../../models/chatbot-block.model';

@Component({
  selector: 'app-conversational-form-block',
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
    MatCheckboxModule,
    MatTooltipModule
  ],
  templateUrl: './conversational-form-block.component.html',
  styleUrls: ['./conversational-form-block.component.scss']
})
export class ConversationalFormBlockComponent implements OnInit {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;
  @Input() availableForms: AvailableForm[] = []; // List of available forms from parent

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();

  showNewFormForm: boolean = false;

  ngOnInit(): void {
    if (!this.block.formId) {
      this.showNewFormForm = true;
      // Initialize form fields for a new form
      if (!this.block.formFields) {
        this.block.formFields = [{ name: '', type: 'text' }];
      }
    } else {
      const selected = this.availableForms.find(f => f.id === this.block.formId);
      if (selected) {
        this.block.formName = selected.name;
        // In a real app, you'd fetch full form details here (webhook, email, fields)
        // For now, we'll assume they are part of the block if it's an existing selection
      }
    }
  }

  onFormSelectionChange() {
    const selected = this.availableForms.find(f => f.id === this.block.formId);
    if (selected) {
      this.block.formName = selected.name;
      // Clear other form-specific properties if switching to a pre-existing form
      this.block.webhookUrl = undefined;
      this.block.sendEmailNotification = undefined;
      this.block.notificationEmail = undefined;
      this.block.formFields = undefined;
      this.block.showAsInlineForm = undefined;
    } else {
      this.block.formName = undefined;
    }
    this.blockUpdated.emit(this.block);
  }

  createNewFormBlock() {
    this.showNewFormForm = true;
    this.block.formId = undefined; // Clear existing selection
    this.block.formName = '';
    this.block.webhookUrl = '';
    this.block.sendEmailNotification = false;
    this.block.notificationEmail = '';
    this.block.formFields = [{ name: '', type: 'text' }]; // Default first field
    this.block.showAsInlineForm = false;
    this.blockUpdated.emit(this.block);
  }

  editExistingFormBlock() {
    this.showNewFormForm = true;
    // In a real app, you'd fetch the full form details here if not already loaded
  }

  cancelFormEdit() {
    this.showNewFormForm = false;
    // If cancelling new form creation, and no formId was set, clear content
    if (!this.block.formId) {
      this.block.formName = undefined;
      this.block.webhookUrl = undefined;
      this.block.sendEmailNotification = undefined;
      this.block.notificationEmail = undefined;
      this.block.formFields = undefined;
      this.block.showAsInlineForm = undefined;
    }
    this.blockUpdated.emit(this.block);
  }

  addFormField() {
    if (!this.block.formFields) {
      this.block.formFields = [];
    }
    this.block.formFields.push({ name: '', type: 'text' });
    this.blockUpdated.emit(this.block);
  }

  removeFormField(index: number) {
    if (this.block.formFields) {
      this.block.formFields.splice(index, 1);
      this.blockUpdated.emit(this.block);
    }
  }

  getFormName(formId: string | undefined): string {
    const form = this.availableForms.find(f => f.id === formId);
    return form ? form.name : 'N/A';
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
