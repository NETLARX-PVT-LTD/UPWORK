// components/forms-list/forms-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormService } from '../shared/services/form.service';
import { ConversationalForm } from '../models/form.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forms-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './forms-list.component.html'
  // styleUrls: ['./forms-list.component.scss']
})
export class FormsListComponent implements OnInit {
  forms: ConversationalForm[] = [];
  searchTerm: string = '';
  recordsPerPage: number = 20;

  // New properties for the copy functionality
  copiedStatus: string | null = null;
  copiedFormId: string | null = null;

  constructor(
    private formService: FormService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formService.getForms().subscribe(forms => {
      this.forms = forms;
    });
  }

  get filteredForms(): ConversationalForm[] {
    if (!this.searchTerm) {
      return this.forms;
    }
    return this.forms.filter(form => 
      form.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  createNewForm(): void {
    this.router.navigate(['/forms/create']);
  }

  editForm(formId: string): void {
    this.router.navigate(['/forms/edit', formId]);
  }

    // New copiedForm function
  async copiedForm(form: ConversationalForm): Promise<void> {
    try {
      // Stringify the form object to be copied
      const formData = JSON.stringify(form, null, 2);

      // Write the stringified data to the clipboard
      await navigator.clipboard.writeText(formData);

      // Set state to show a success message
      this.copiedStatus = 'Copied!';
      this.copiedFormId = form.id;

      // Clear the status message after 2 seconds
      setTimeout(() => {
        this.copiedStatus = null;
        this.copiedFormId = null;
      }, 2000);
      
    } catch (err) {
      // Set state to show a failure message
      console.error('Failed to copy form data to clipboard:', err);
      this.copiedStatus = 'Copy failed!';
      this.copiedFormId = form.id;
    }
  }
  
showCloneModal: boolean = false;
  formToClone: any | null = null;

  openDuplicateModal(form: any): void {
    this.formToClone = form;
    this.showCloneModal = true;
  }

  confirmDuplicate(): void {
    if (this.formToClone) {
      this.duplicateForm(this.formToClone);
      this.closeModal();
    }
  }

  closeModal(): void {
    this.showCloneModal = false;
    this.formToClone = null;
  }

  duplicateForm(form: ConversationalForm): void {
    const duplicatedForm: ConversationalForm = {
      ...form,
      id: Math.random().toString(36).substr(2, 9),
      name: `${form.name} (Copy)`,
      dateCreated: new Date().toLocaleDateString('en-US'),
      responses: 0
    };
    this.formService.createForm(duplicatedForm);
  }

  deleteForm(formId: string): void {
    if (confirm('Are you sure you want to delete this form?')) {
      this.formService.deleteForm(formId);
    }
  }
}
