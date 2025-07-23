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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Corrected import: Import ChatbotBlock, AvailableForm, and FormField
// directly from your central models file.
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
    MatTooltipModule,
    MatSlideToggleModule
  ],
  templateUrl: './conversational-form-block.component.html',
  styleUrls: ['./conversational-form-block.component.scss']
})
export class ConversationalFormBlockComponent implements OnInit {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;
  @Input() availableForms: AvailableForm[] = []; // This will now hold all form data

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();

  showNewFormForm: boolean = false;

  ngOnInit(): void {
    // Initialize block properties if they are undefined (important for the comprehensive type)
    if (this.block.showAsInlineForm === undefined) {
      this.block.showAsInlineForm = false;
    }
    if (this.block.renderFormResponses === undefined) {
      this.block.renderFormResponses = false;
    }
    // Also ensure the 'missing' properties are present, though they should be
    // initialized by the parent (ChatbotFlowComponent) when adding the block.
    // This is a safety net in case a block instance is somehow created without them.
    this.block.status = this.block.status ?? 'new';
    this.block.x = this.block.x ?? 0;
    this.block.y = this.block.y ?? 0;
    this.block.width = this.block.width ?? 0;
    this.block.height = this.block.height ?? 0;

    // Populate availableForms with the specific options and their full data.
    // In a real application, this data would typically come from an API call.
    // For demonstration, we're hardcoding it here.
    this.availableForms = [
      {
        id: 'form-main',
        name: 'Form',
        webhookUrl: 'https://api.example.com/forms/main-webhook',
        sendEmailNotification: true,
        notificationEmail: 'admin@example.com',
        formFields: [
          { name: 'Your Name', type: 'text', required: true, promptPhrase: 'Enter your name' },
          { name: 'Your Email', type: 'email', required: true, promptPhrase: 'What is your email address?' },
          { name: 'Message', type: 'text', required: false, promptPhrase: 'How can we help you today?' }
        ],
        showAsInlineForm: false,
        renderFormResponses: true
      },
      {
        id: 'form-records',
        name: 'Records',
        webhookUrl: 'https://api.example.com/forms/records-webhook',
        sendEmailNotification: false,
        notificationEmail: '',
        formFields: [
          { name: 'Record ID', type: 'number', required: true, promptPhrase: 'Please enter the record ID.' },
          { name: 'Record Date', type: 'date', required: false, promptPhrase: 'What date is this record for?' }
        ],
        showAsInlineForm: true,
        renderFormResponses: false
      },
      {
        id: 'form-applyservice',
        name: 'applyservice',
        webhookUrl: 'https://api.example.com/forms/applyservice-webhook',
        sendEmailNotification: true,
        notificationEmail: 'applications@example.com',
        formFields: [
          { name: 'Service Type', type: 'multiple-options', required: true, promptPhrase: 'Which service are you applying for?', options: ['Service A', 'Service B', 'Service C'] },
          { name: 'File Upload', type: 'file', required: false, promptPhrase: 'Upload any relevant documents.' }
        ],
        showAsInlineForm: false,
        renderFormResponses: true
      },
      {
        id: 'form-conversational',
        name: 'Conversational form',
        webhookUrl: 'https://api.example.com/forms/conversational-webhook',
        sendEmailNotification: false,
        notificationEmail: '',
        formFields: [
          { name: 'User Inquiry', type: 'text', required: true, promptPhrase: 'How can I assist you today?' }
        ],
        showAsInlineForm: true,
        renderFormResponses: false
      }
    ];

    // Determine initial state of showNewFormForm based on if a form is selected
    if (this.block.formId) {
      this.showNewFormForm = false; // If a form is initially selected, show the "select/edit" view
      const selected = this.availableForms.find(f => f.id === this.block.formId);
      if (selected) {
        // Load all properties from the selected form into the block
        this.block.formName = selected.name;
        this.block.webhookUrl = selected.webhookUrl;
        this.block.sendEmailNotification = selected.sendEmailNotification;
        this.block.notificationEmail = selected.notificationEmail;
        this.block.formFields = selected.formFields ? JSON.parse(JSON.stringify(selected.formFields)) : []; // Deep copy to avoid mutation
        this.block.showAsInlineForm = selected.showAsInlineForm;
        this.block.renderFormResponses = selected.renderFormResponses;
      }
    } else {
      this.showNewFormForm = false; // Default to showing select/create options
    }
  }

  /**
   * Handles the change event when a form is selected from the dropdown.
   * Updates the block's form details by loading all properties of the selected form.
   */
  onFormSelectionChange(): void {
    const selected = this.availableForms.find(f => f.id === this.block.formId);
    if (selected) {
      // Load all properties from the selected form into the block
      this.block.formName = selected.name;
      this.block.webhookUrl = selected.webhookUrl;
      this.block.sendEmailNotification = selected.sendEmailNotification;
      this.block.notificationEmail = selected.notificationEmail;
      this.block.formFields = selected.formFields ? JSON.parse(JSON.stringify(selected.formFields)) : []; // Deep copy
      this.block.showAsInlineForm = selected.showAsInlineForm;
      this.block.renderFormResponses = selected.renderFormResponses;
      this.showNewFormForm = false; // Keep showing select/edit buttons after selection
    } else {
      // If no form selected (e.g., option cleared, though not typical for mat-select)
      this.block.formId = undefined;
      this.block.formName = undefined;
      this.block.webhookUrl = undefined;
      this.block.sendEmailNotification = undefined;
      this.block.notificationEmail = undefined;
      this.block.formFields = undefined;
      this.block.showAsInlineForm = false; // Default state
      this.block.renderFormResponses = false; // Default state
    }
    this.blockUpdated.emit(this.block);
  }

  /**
   * Sets up the component to display the form for creating a new conversational form.
   * Resets block properties to prepare for new form creation.
   */
  createNewFormBlock(): void {
    this.showNewFormForm = true;
    this.block.formId = undefined; // Ensure no existing form is linked
    this.block.formName = '';
    this.block.webhookUrl = '';
    this.block.sendEmailNotification = false;
    this.block.notificationEmail = '';
    this.block.formFields = [{ name: '', type: 'text', required: false, promptPhrase: '' }]; // Initialize with all new properties
    this.block.showAsInlineForm = false;
    this.block.renderFormResponses = false;
    this.blockUpdated.emit(this.block);
  }

  /**
   * Sets up the component to display the form for editing an existing conversational form.
   * This means populating the form fields with the details of the currently selected form.
   */
  editExistingFormBlock(): void {
    this.showNewFormForm = true; // Show the "Define Conversational Form" section

    // The data is already loaded into `this.block` when `onFormSelectionChange()`
    // or `ngOnInit()` is called if `block.formId` was already set.
    // So, we just need to ensure `this.block.formFields` is an array.
    if (!this.block.formFields) {
      this.block.formFields = [];
    }
    this.blockUpdated.emit(this.block); // Emit to update parent with potentially loaded data
  }

  /**
   * Cancels the creation or editing of a form.
   * Resets the view to either show existing form selection or the "Create New Form" button.
   */
  cancelFormEdit(): void {
    this.showNewFormForm = false;
    // If no form was selected previously (i.e., we were in 'create new' mode), reset the fields.
    // If a form was selected, its details should remain in the block.
    if (!this.block.formId) {
      this.block.formName = undefined;
      this.block.webhookUrl = undefined;
      this.block.sendEmailNotification = undefined;
      this.block.notificationEmail = undefined;
      this.block.formFields = undefined; // Clear form fields
      this.block.showAsInlineForm = false;
      this.block.renderFormResponses = false;
    }
    this.blockUpdated.emit(this.block);
  }

  /**
   * Adds a new, empty form field to the list of form fields.
   */
  addFormField(): void {
    if (!this.block.formFields) {
      this.block.formFields = [];
    }
    // Add default values for new fields including promptPhrase and required
    this.block.formFields.push({ name: '', type: 'text', required: false, promptPhrase: '' });
    this.onContentChange();
  }

  /**
   * Removes a form field at the specified index.
   * @param index The index of the form field to remove.
   */
  removeFormField(index: number): void {
    if (this.block.formFields) {
      this.block.formFields.splice(index, 1);
      this.onContentChange();
    }
  }

  /**
   * Retrieves the name of a form based on its ID from the availableForms list.
   * @param formId The ID of the form.
   * @returns The name of the form, or 'N/A' if not found.
   */
  getFormName(formId: string | undefined): string {
    const form = this.availableForms.find(f => f.id === formId);
    return form ? form.name : 'N/A';
  }

  /**
   * Emits an event when the block itself is selected.
   */
  onSelectBlock(): void {
    this.selectBlock.emit(this.block);
  }

  /**
   * Emits an event to signal the start of a connection drag.
   * @param event The mouse event that triggered the connection start.
   */
  onStartConnection(event: MouseEvent): void {
    this.startConnection.emit(event);
  }

  /**
   * Emits an event to signal the end of a connection drag.
   * @param event The mouse event that triggered the connection end.
   */
  onEndConnection(event: MouseEvent): void {
    this.endConnection.emit(event);
  }

  /**
   * Emits an event to request the removal of this block.
   */
  onRemoveBlock(): void {
    this.removeBlock.emit(this.block.id);
  }

  /**
   * Emits an event to request the duplication of this block.
   */
  onDuplicateBlock(): void {
    this.duplicateBlock.emit(this.block);
  }

  /**
   * Emits an event to request editing of this block.
   */
  onEditBlock(): void {
    this.editBlock.emit(this.block);
  }

  /**
   * Emits the blockUpdated event whenever a change is made to the block's content.
   */
  onContentChange(): void {
    this.blockUpdated.emit(this.block);
  }
}