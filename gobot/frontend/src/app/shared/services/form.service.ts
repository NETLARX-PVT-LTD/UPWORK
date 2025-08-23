// services/form.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConversationalForm, FormField } from '../../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private formsSubject = new BehaviorSubject<ConversationalForm[]>([
    {
        id: '5198',
        name: 'Default Form 5198',
        dateCreated: '08/08/2025',
        responses: 0,
        fields: [{ id: '1', label: 'Field', promptPhrase: '', inputType: 'text', required: false }],
        settings: function (arg0: string, settings: any): unknown {
            throw new Error('Function not implemented.');
        }
    },
    {
        id: '6376',
        name: 'Form',
        dateCreated: '08/08/2025',
        responses: 3,
        fields: [
            { id: '1', label: 'Name', promptPhrase: '', inputType: 'text', required: false },
            { id: '2', label: 'Email', promptPhrase: '', inputType: 'email', required: false },
            { id: '3', label: 'File Upload', promptPhrase: '', inputType: 'file', required: false }
        ],
        settings: function (arg0: string, settings: any): unknown {
            throw new Error('Function not implemented.');
        }
    },
    {
        id: '7605',
        name: 'Default Form 7605',
        dateCreated: '08/05/2025',
        responses: 2,
        fields: [
            { id: '1', label: 'Name', promptPhrase: '', inputType: 'text', required: false },
            { id: '2', label: 'Email', promptPhrase: '', inputType: 'email', required: false }
        ],
        settings: function (arg0: string, settings: any): unknown {
            throw new Error('Function not implemented.');
        }
    }
  ]);

  getForms(): Observable<ConversationalForm[]> {
    return this.formsSubject.asObservable();
  }

  getFormById(id: string): ConversationalForm | undefined {
    return this.formsSubject.value.find(form => form.id === id);
  }

  createForm(form: ConversationalForm): void {
    const currentForms = this.formsSubject.value;
    this.formsSubject.next([...currentForms, form]);
  }

  updateForm(updatedForm: ConversationalForm): void {
    const currentForms = this.formsSubject.value;
    const index = currentForms.findIndex(form => form.id === updatedForm.id);
    if (index > -1) {
      currentForms[index] = updatedForm;
      this.formsSubject.next([...currentForms]);
    }
  }

  deleteForm(id: string): void {
    const currentForms = this.formsSubject.value.filter(form => form.id !== id);
    this.formsSubject.next(currentForms);
  }
}