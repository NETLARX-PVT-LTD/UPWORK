// models/form.model.ts
export interface FormField {
  id: string;
  label: string;
  promptPhrase: string;
  inputType: 'text' | 'email' | 'file' | 'number' | 'date';
  required: boolean;
   // New properties
  showSettings?: boolean;
  validationErrorMessage?: string;
  validationApiLink?: string;
}

export interface ConversationalForm {
  settings(arg0: string, settings: any): unknown;
  id: string;
  name: string;
  dateCreated: string;
  responses: number;
  fields: FormField[];
}