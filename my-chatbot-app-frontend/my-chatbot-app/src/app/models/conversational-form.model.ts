// src/app/models/conversational-form.model.ts

import { FormField } from './chatbot-block.model'; // Assuming FormField is still in chatbot-block.model.ts

export interface ConversationalFormSettings {
  formId?: string;
  formName?: string;
  webhookUrl?: string;
  sendEmailNotification?: boolean;
  notificationEmail?: string;
  formFields?: FormField[]; // This still depends on FormField
  showAsInlineForm?: boolean;
  renderFormResponses?: boolean;
  welcomeMessage?: string;
  validateEmail?: boolean;
  validatePhone?: boolean;
  spamProtection?: boolean;
  requireCompletion?: boolean;
  successMessage?: string;
  redirectUrl?: string;
  callApiWithResponseData?: boolean;
  apiUrl?: string;
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiHeaders?: ApiHeader[];
}

export interface ApiHeader {
  key: string;
  value: string;
}