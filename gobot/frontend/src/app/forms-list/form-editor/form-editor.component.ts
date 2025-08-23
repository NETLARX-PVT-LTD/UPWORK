import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../shared/services/form.service';
import { ConversationalForm, FormField } from '../../models/form.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss']
})
export class FormEditorComponent implements OnInit {
  form: ConversationalForm = {
    id: '',
    name: '',
    dateCreated: new Date().toLocaleDateString('en-US'),
    responses: 0,
    fields: [],
    settings: (arg0: string, settings: any): unknown => {
      // This is a placeholder; real settings logic would go here.
      return null;
    }
  };

  isEditMode: boolean = false;
 // Correcting the type of activeTab
  activeTab: 'fields' | 'settings' = 'fields'; 

  // Enhanced state object to manage settings panel and form settings data
  settingsState = {
    onFormSubmit: {
      expanded: false,
      action: 'api' // Default action: 'Call API'
    },
    basicSettings: {
      expanded: false,
      allowMultipleSubmissions: false,
      allowUserExit: false,
      exitMessage: ''
    },
    advanceSettings: {
      expanded: false,
      enableAnalytics: false,
      webhookUrl: '',
      responseType: 'text', // 'text' or 'story'
      textMessage: 'Thanks for the submission',
      selectedStory: ''
    }
  };

  inputTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'file', label: 'File' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService
  ) {}

  ngOnInit(): void {
    const formId = this.route.snapshot.params['id'];
    if (formId) {
      this.isEditMode = true;
      const existingForm = this.formService.getFormById(formId);
      if (existingForm) {
        this.form = { ...existingForm };
        // Load existing settings if available
        this.loadFormSettings();
      }
    } else {
      // Create mode - initialize with default field
      this.form = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Default Form ${Math.floor(Math.random() * 10000)}`,
        dateCreated: new Date().toLocaleDateString('en-US'),
        responses: 0,
        fields: [this.createDefaultField()],
        settings: (arg0: string, settings: any): unknown => {
          return null;
        }
      };
    }
  }

  loadFormSettings(): void {
    // Load settings from existing form if available
    // This would typically come from your form's settings property
    // For now, using default values
  }

  createDefaultField(): FormField {
    return {
      id: Math.random().toString(36).substr(2, 9),
      label: this.isEditMode ? 'Field' : 'Field Name',
      promptPhrase: this.isEditMode ? 'Enter the song' : 'How do you want to ask this question to your users?',
      inputType: this.isEditMode ? 'file' : 'text',
      required: true
    };
  }

 addField(): void {
  const newField: FormField = {
    id: Math.random().toString(36).substr(2, 9),
    label: 'New Field',
    promptPhrase: 'Enter your prompt here',
    inputType: 'text',
    required: false,
    // Add these new properties
    showSettings: false,
    validationErrorMessage: '',
    validationApiLink: ''
  };
  this.form.fields.push(newField);
}

  removeField(index: number): void {
    if (this.form.fields.length > 1) {
      this.form.fields.splice(index, 1);
    }
  }

  setActiveTab(tab: 'fields' | 'settings'): void {
    this.activeTab = tab;
  }

  toggleFieldSettings(index: number) {
    // Toggle the showSettings boolean for the field at the given index
    this.form.fields[index].showSettings = !this.form.fields[index].showSettings;
  }
  
  toggleSettingsSection(section: string): void {
    switch (section) {
      case 'onFormSubmit':
        this.settingsState.onFormSubmit.expanded = !this.settingsState.onFormSubmit.expanded;
        break;
      case 'basicSettings':
        this.settingsState.basicSettings.expanded = !this.settingsState.basicSettings.expanded;
        break;
      case 'advanceSettings':
        this.settingsState.advanceSettings.expanded = !this.settingsState.advanceSettings.expanded;
        break;
    }
  }

  setResponseType(type: 'text' | 'story'): void {
    this.settingsState.advanceSettings.responseType = type;
  }

  saveForm(): void {
    // If we're on the fields tab and this is a "Next" action, go to settings
    if (this.activeTab === 'fields') {
      this.setActiveTab('settings');
      return;
    }

    // If we're on settings tab or it's an "Update" action, save the form
    const formWithSettings = {
      ...this.form,
      formSettings: this.settingsState
    };

    if (this.isEditMode) {
      this.formService.updateForm(formWithSettings as ConversationalForm);
    } else {
      this.formService.createForm(formWithSettings as ConversationalForm);
    }
    this.router.navigate(['/forms']);
  }

  goToPrevious(): void {
    this.setActiveTab('fields');
  }

  cancel(): void {
    this.router.navigate(['/forms']);
  }
}