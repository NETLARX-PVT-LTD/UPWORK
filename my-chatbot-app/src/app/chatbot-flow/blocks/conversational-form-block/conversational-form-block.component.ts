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
import { MatExpansionModule } from '@angular/material/expansion';

import { ChatbotBlock, AvailableForm, FormField, AvailableStory } from '../../../models/chatbot-block.model';

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
    MatSlideToggleModule,
    MatExpansionModule
  ],
  templateUrl: './conversational-form-block.component.html',
  styleUrls: ['./conversational-form-block.component.scss']
})
export class ConversationalFormBlockComponent implements OnInit {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;
  @Input() availableForms: AvailableForm[] = [];
  @Input() availableStories: AvailableStory[] = []; // This line is crucial!
  
  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();

  showNewFormForm: boolean = false;
  expandedSection: string = 'selection'; // Initialize to 'selection' by default
  // NEW: Control the visibility of the configuration panels
  showFormConfigMode: boolean = false;

  ngOnInit(): void {
    this.initializeBlockProperties();
    this.loadAvailableForms();
    this.handleInitialFormSelection();
    this.loadAvailableStories();
  }
/**
   * Inserts a selected variable into the successMessage textarea at the current cursor position.
   */
  insertVariableIntoSuccessMessage(variable: string): void {
    if (this.block.successMessage === undefined || this.block.successMessage === null) {
      this.block.successMessage = '';
    }

    // You can implement more sophisticated cursor management if you need
    // For simplicity, this will append the variable.
    // If you need to insert at cursor position, you'd use @ViewChild and NativeElement.
    this.block.successMessage += variable;
    this.onContentChange(); // Notify parent of the change
  }
  /**
   * Initialize block properties with default values
   */
  private initializeBlockProperties(): void {
    // Core display properties
    if (this.block.showAsInlineForm === undefined) {
      this.block.showAsInlineForm = false;
    }
    if (this.block.renderFormResponses === undefined) {
      this.block.renderFormResponses = false;
    }

    // Additional properties for enhanced functionality
    if (this.block.requireCompletion === undefined) {
      this.block.requireCompletion = true;
    }
    if (this.block.validateEmail === undefined) {
      this.block.validateEmail = true;
    }
    if (this.block.validatePhone === undefined) {
      this.block.validatePhone = true;
    }
    if (this.block.spamProtection === undefined) {
      this.block.spamProtection = false;
    }
    if (this.block.welcomeMessage === undefined) {
      this.block.welcomeMessage = '';
    }
    // New properties for On Form Submit section
    if (this.block.successMessage === undefined) {
      this.block.successMessage = '';
    }
    if (this.block.redirectUrl === undefined) {
      this.block.redirectUrl = '';
    }
      if (this.block.callApiWithResponseData === undefined) {
      this.block.callApiWithResponseData = false; // Set your desired default value
    }
 // NEW API PROPERTIES INITIALIZATION
    if (this.block.apiUrl === undefined) {
      this.block.apiUrl = '';
    }
    if (this.block.apiMethod === undefined) {
      this.block.apiMethod = 'POST'; // Default to POST or another suitable method
    }
    if (this.block.apiHeaders === undefined) {
      this.block.apiHeaders = []; // Initialize as an empty array
    }
 // New properties for Basic Settings
    if (this.block.allowMultipleSubmission === undefined) {
      this.block.allowMultipleSubmission = true; // Default to true as per image
    }
    if (this.block.multipleSubmissionMessage === undefined) {
      this.block.multipleSubmissionMessage = 'You have already submitted this form.'; // Default message
    }
    if (this.block.allowExitForm === undefined) {
      this.block.allowExitForm = true; // Default to true as per image
    }
    if (this.block.exitFormMessage === undefined) {
      this.block.exitFormMessage = 'You have exited the form.'; // Default message
    }

    // NEW ADVANCE SETTINGS PROPERTIES
    if (this.block.successResponseType === undefined) {
      this.block.successResponseType = 'textMessage'; // Default to 'Text Message'
    }
    if (this.block.successRedirectStoryId === undefined) {
      this.block.successRedirectStoryId = ''; // Default empty
    }
    if (this.block.allowMultipleSubmission === undefined) { // from previous fix
      this.block.allowMultipleSubmission = true;
    }
    if (this.block.multipleSubmissionMessage === undefined) { // from previous fix
      this.block.multipleSubmissionMessage = 'You have already submitted this information.';
    }
    if (this.block.allowExitForm === undefined) { // from previous fix
      this.block.allowExitForm = true;
    }
    if (this.block.exitFormMessage === undefined) { // from previous fix
      this.block.exitFormMessage = 'You have exited the form.';
    }
    // Ensure other required properties are present
    this.block.status = this.block.status ?? 'new';
    this.block.x = this.block.x ?? 0;
    this.block.y = this.block.y ?? 0;
    this.block.width = this.block.width ?? 0;
    this.block.height = this.block.height ?? 0;
  }

  /**
 * Load available forms data
 */
private loadAvailableForms(): void {
  this.availableForms = [
    {
      id: 'form-generic', // Assuming a generic ID for "Form"
      name: 'Form',       // This is the "Form" label shown
      webhookUrl: 'https://api.example.com/forms/generic-webhook',
      sendEmailNotification: false,
      notificationEmail: '',
      formFields: [], // No specific fields are shown for this generic "Form"
      showAsInlineForm: false,
      renderFormResponses: false
    },
    {
      id: 'form-records',
      name: 'Records', // Matching the name from the image
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
      name: 'applyservice', // Matching the name from the image
      webhookUrl: 'https://api.example.com/forms/applyservice-webhook',
      sendEmailNotification: true,
      notificationEmail: 'applications@example.com',
      formFields: [
        {
          name: 'Service Type',
          type: 'multiple-options',
          required: true,
          promptPhrase: 'Which service are you applying for?',
          options: ['Service A', 'Service B', 'Service C']
        },
        { name: 'File Upload', type: 'file', required: false, promptPhrase: 'Upload any relevant documents.' }
      ],
      showAsInlineForm: false,
      renderFormResponses: true
    },
    {
      id: 'form-conversational',
      name: 'Conversational form', // Matching the name from the image
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
}

  /**
   * Handle initial form selection if formId is already set
   */
  private handleInitialFormSelection(): void {
    if (this.block.formId) {
      this.showNewFormForm = false;
      // When a form is initially loaded (e.g., page refresh or opening an existing block),
      // we don't want to immediately show the config mode. User must explicitly click "Edit Form" and "Next".
      this.showFormConfigMode = false;
      this.loadFormData(this.block.formId);
    } else {
      this.showNewFormForm = false;
      this.showFormConfigMode = false; // Ensure it's false by default
    }
  }

  /**
   * Load form data into block when a form is selected
   */
  private loadFormData(formId: string): void {
    const selected = this.availableForms.find(f => f.id === formId);
    if (selected) {
      this.block.formName = selected.name;
      this.block.webhookUrl = selected.webhookUrl;
      this.block.sendEmailNotification = selected.sendEmailNotification;
      this.block.notificationEmail = selected.notificationEmail;
      this.block.formFields = selected.formFields ? JSON.parse(JSON.stringify(selected.formFields)) : [];
      this.block.showAsInlineForm = selected.showAsInlineForm;
      this.block.renderFormResponses = selected.renderFormResponses;

      // Process options for choice fields
      this.processFieldOptions();
    }
  }
 /**
   * NEW: Load available stories data (mock data for now)
   */
  private loadAvailableStories(): void {
    // In a real application, you would fetch this from a service.
    this.availableStories = [
      { id: 'go-back-to-previous-story', name: 'Go back to previous story' },
      { id: 'hii', name: '(Hii),' },
      { id: 'report-incident', name: 'Report Incident' },
      { id: 'process-for-setting-up-shop', name: 'Process for setting up shop' }
    ];
  }
  /**
   * Process field options to create optionsText for editing
   */
  private processFieldOptions(): void {
    if (this.block.formFields) {
      this.block.formFields.forEach(field => {
        if ((field.type === 'options' || field.type === 'multiple-options') && field.options) {
          field.optionsText = field.options.join(', ');
        }
      });
    }
  }

  /**
   * Handles the change event when a form is selected from the dropdown
   */
  onFormSelectionChange(): void {
    if (this.block.formId) {
      this.loadFormData(this.block.formId);
      this.showNewFormForm = false; // Stay in selection view
      this.showFormConfigMode = false; // Do not show config panels immediately
    } else {
      this.clearFormData();
    }
    this.blockUpdated.emit(this.block);
  }

  /**
   * Clear form data when no form is selected
   */
  private clearFormData(): void {
    this.block.formName = undefined;
    this.block.webhookUrl = undefined;
    this.block.sendEmailNotification = undefined;
    this.block.notificationEmail = undefined;
    this.block.formFields = undefined;
    this.block.showAsInlineForm = false;
    this.block.renderFormResponses = false;
    this.block.successMessage = undefined; // Clear new properties
    this.block.redirectUrl = undefined;   // Clear new properties
  }

  /**
   * Sets up the component to display the form for creating a new conversational form
   */
  createNewFormBlock(): void {
    this.showNewFormForm = true; // Show the Form Builder
    this.showFormConfigMode = false; // Hide config panels
    this.expandedSection = 'builder'; // Expand the builder section
    this.block.formId = undefined; // Clear selected form ID for a new form
    this.block.formName = '';
    this.block.welcomeMessage = '';
    this.block.webhookUrl = '';
    this.block.sendEmailNotification = false;
    this.block.notificationEmail = '';
    this.block.formFields = [{
      name: '',
      type: 'text',
      required: false,
      promptPhrase: '',
      optionsText: ''
    }];
    this.block.showAsInlineForm = false;
    this.block.renderFormResponses = false;
    this.block.successMessage = ''; // Initialize new properties
    this.block.redirectUrl = '';   // Initialize new properties
    this.block.callApiWithResponseData = false; // <--- ALSO INITIALIZE HERE FOR NEW FORMS**
    this.block.apiUrl = ''; // Initialize for new forms
    this.block.apiMethod = 'POST'; // Initialize for new forms
    this.block.apiHeaders = []; // Initialize for new forms
     // Initialize new properties for a new form
    this.block.allowMultipleSubmission = true;
    this.block.multipleSubmissionMessage = 'You have already submitted this form.';
    this.block.allowExitForm = true;
    this.block.exitFormMessage = 'You have exited the form.';
// Initialize NEW ADVANCE SETTINGS PROPERTIES for new forms
    this.block.successResponseType = 'textMessage'; // Default for new forms
    this.block.successRedirectStoryId = ''; // Default empty for new forms
    this.block.allowMultipleSubmission = true; // Default for new forms
    this.block.multipleSubmissionMessage = 'You have already submitted this information.'; // Default for new forms
    this.block.allowExitForm = true; // Default for new forms
    this.block.exitFormMessage = 'You have exited the form.'; // Default for new forms

    this.blockUpdated.emit(this.block);
  }

  /**
   * Sets up the component to display the form for editing an existing conversational form
   * Used for "Edit Form" button and "Previous" button.
   */
  editExistingFormBlock(): void {
    this.showNewFormForm = true; // Show the Form Builder
    this.showFormConfigMode = false; // Hide the configuration panels
    this.expandedSection = 'builder'; // Ensure builder is expanded

    if (!this.block.formFields) {
      this.block.formFields = [];
    }

    // Ensure all fields have the optionsText property for editing
    this.processFieldOptions();

    this.blockUpdated.emit(this.block);
  }

  /**
   * Cancels the creation or editing of a form
   */
  cancelFormEdit(): void {
    this.showNewFormForm = false;
    this.showFormConfigMode = false; // Ensure config panels are hidden
    this.expandedSection = 'selection';

    if (!this.block.formId) {
      this.clearFormData();
    } else {
      // Reload the original form data if editing an existing form and canceling
      this.loadFormData(this.block.formId);
    }
    this.blockUpdated.emit(this.block);
  }

  /**
   * Save the current form configuration
   */

  getFieldNames(): string {
    return this.block.formFields?.map(f => f.name).join(', ') || '';
  }

  saveForm(): void {
    if (!this.block.formName || !this.block.formName.trim()) {
      alert('Please enter a form name');
      return;
    }

    // Process form fields to convert optionsText to options array
    if (this.block.formFields) {
      this.block.formFields.forEach(field => {
        if ((field.type === 'options' || field.type === 'multiple-options') && field.optionsText) {
          field.options = field.optionsText.split(',').map(option => option.trim()).filter(option => option);
        } else if ((field.type === 'options' || field.type === 'multiple-options') && !field.optionsText) {
          field.options = []; // Ensure options array is empty if optionsText is cleared
        }
      });
    }

    // Generate a new form ID if creating new form
    if (!this.block.formId) {
      this.block.formId = 'form-' + Date.now();

      // Add to available forms list
      const newForm: AvailableForm = {
        id: this.block.formId,
        name: this.block.formName,
        webhookUrl: this.block.webhookUrl || '',
        sendEmailNotification: this.block.sendEmailNotification || false,
        notificationEmail: this.block.notificationEmail || '',
        formFields: JSON.parse(JSON.stringify(this.block.formFields || [])),
        showAsInlineForm: this.block.showAsInlineForm || false,
        renderFormResponses: this.block.renderFormResponses || false
      };

      this.availableForms.push(newForm);
    }

    // After saving, return to the initial selection view, hiding builder and config.
    this.showNewFormForm = false;
    this.showFormConfigMode = false;
    this.expandedSection = 'selection';
    this.blockUpdated.emit(this.block);
  }

  /**
   * New method to transition from Form Builder to the configuration sections.
   */
  goToNextSection(): void {
    if (!this.block.formName || !this.block.formName.trim()) {
      // alert('Please enter a form name');
      return;
    }

    // Perform the "save" logic for form fields before moving on
    if (this.block.formFields) {
      this.block.formFields.forEach(field => {
        if ((field.type === 'options' || field.type === 'multiple-options') && field.optionsText) {
          field.options = field.optionsText.split(',').map(option => option.trim()).filter(option => option);
        } else if ((field.type === 'options' || field.type === 'multiple-options') && !field.optionsText) {
          field.options = [];
        }
      });
    }

    // Generate a new form ID if creating new form
    if (!this.block.formId) {
      this.block.formId = 'form-' + Date.now();

      // Add to available forms list
      const newForm: AvailableForm = {
        id: this.block.formId,
        name: this.block.formName,
        webhookUrl: this.block.webhookUrl || '',
        sendEmailNotification: this.block.sendEmailNotification || false,
        notificationEmail: this.block.notificationEmail || '',
        formFields: JSON.parse(JSON.stringify(this.block.formFields || [])),
        showAsInlineForm: this.block.showAsInlineForm || false,
        renderFormResponses: this.block.renderFormResponses || false
      };

      this.availableForms.push(newForm);
    }

    // Hide the form builder and show configuration sections
    this.showNewFormForm = false;
    this.showFormConfigMode = true; // IMPORTANT: Set this to true
    this.expandedSection = 'onFormSubmit'; // Set the first config section to be expanded
    this.blockUpdated.emit(this.block);
  }

  /**
   * Adds a new, empty form field to the list of form fields
   */
  addFormField(): void {
    if (!this.block.formFields) {
      this.block.formFields = [];
    }

    this.block.formFields.push({
      name: '',
      type: 'text',
      required: false,
      promptPhrase: '',
      optionsText: ''
    });
    this.onContentChange();
  }

  /**
   * Removes a form field at the specified index
   */
  removeFormField(index: number): void {
    if (this.block.formFields && this.block.formFields.length > 1) {
      this.block.formFields.splice(index, 1);
      this.onContentChange();
    }
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
   * Move field up in the list
   */
  moveFieldUp(index: number): void {
    if (this.block.formFields && index > 0) {
      const field = this.block.formFields[index];
      this.block.formFields[index] = this.block.formFields[index - 1];
      this.block.formFields[index - 1] = field;
      this.onContentChange();
    }
  }

  /**
   * Move field down in the list
   */
  moveFieldDown(index: number): void {
    if (this.block.formFields && index < this.block.formFields.length - 1) {
      const field = this.block.formFields[index];
      this.block.formFields[index] = this.block.formFields[index + 1];
      this.block.formFields[index + 1] = field;
      this.onContentChange();
    }
  }

  /**
   * Update field options when optionsText changes
   */
  updateFieldOptions(field: FormField): void {
    if (field.optionsText) {
      field.options = field.optionsText.split(',').map(option => option.trim()).filter(option => option);
    } else {
      field.options = [];
    }
    this.onContentChange();
  }

  /**
   * Retrieves the name of a form based on its ID from the availableForms list
   */
  getFormName(formId: string | undefined): string {
    const form = this.availableForms.find(f => f.id === formId);
    return form ? form.name : 'N/A';
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