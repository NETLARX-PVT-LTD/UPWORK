// src/app/models/chatbot-block.model.ts

// Define the structure for a chatbot block
export interface ChatbotBlock {
  id: string;
  name: string;
  icon: string;
  type: BlockType;
  status: 'active' | 'error' | 'new' | 'disabled';
  x: number; // X-coordinate on the canvas
  y: number; // Y-coordinate on the canvas
  width: number; // Actual width of the rendered block
  height: number; // Actual height of the rendered block
  description?: string; // Optional description for the block
  content?: string; // For TextResponse, MediaBlock (text type, and potentially 'mark' type if you add it)
  subType?: UserInputSubType; // For UserInput blocks (phrase, keywordGroup, anything)
  keywords?: string[]; // For UserInput (keywordGroup)
  keywordGroups?: string[][];
  phraseText?: string; // For UserInput (phrase)
  customMessage?: string; // For UserInput (anything)
  delaySeconds?: number; // For TypingDelay
  mediaId?: string; // For MediaBlock (selected media ID)
  mediaType?: 'text' | 'image' | 'video' | 'file' | 'Image Slider' | 'audio'; // For MediaBlock (type of media)
  mediaUrl?: string; // For MediaBlock (URL of image/video/file/audio, for single media)
  imageSliderUrls?: string[]; // For Image Slider mediaType
  mediaName?: string; // For MediaBlock (name of selected media)
  linkStoryId?: string; // For LinkStory (selected story ID)
  linkStoryName?: string; // For LinkStory (name of selected story)
  formId?: string; // For ConversationalForm (selected form ID)
  formName?: string; // For ConversationalForm (name of selected form)
  webhookUrl?: string; // For ConversationalForm
  sendEmailNotification?: boolean; // For ConversationalForm
  notificationEmail?: string; // For ConversationalForm
  formFields?: FormField[]; // For ConversationalForm
  showAsInlineForm?: boolean; // For ConversationalForm
  renderFormResponses?: boolean; // For ConversationalForm
  datastoreVariable?: string; // For UserInput (variable mode)
  alternateResponses?: string[]; // For TextResponse
  quickReplies?: QuickReply[]; // For TextResponse
  welcomeMessage?: string; // Added to ChatbotBlock, and used by component
  // Validation settings
  validateEmail?: boolean; // Used by component
  validatePhone?: boolean; // Used by component
  spamProtection?: boolean; // Used by component
  // Display and behavior settings
  requireCompletion?: boolean; // Used by component
  successMessage?: string; // Used for text message success response
  redirectUrl?: string; // Existing, might be for a general redirect, keep separate from story redirect
  callApiWithResponseData?: boolean;
  // API CONFIGURATION
  apiUrl?: string;
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  // Form Submission Behavior - new properties
  allowMultipleSubmission?: boolean;
  multipleSubmissionMessage?: string;
  allowExitForm?: boolean;
  exitFormMessage?: string;

  // NEW ADVANCE SETTINGS FOR FORM SUBMISSION RESPONSE
  successResponseType?: 'textMessage' | 'story'; // 'Text Message' or 'Story'
  successRedirectStoryId?: string; // ID of the story to redirect to if 'story' is selected
  // JSON API Integration specific properties (New ones causing errors)
  apiEndpoint?: string;
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiHeaders?: ApiHeader[]; // Array of API headers
   similarPhrases?: string;

   // Quick Reply related properties - ADD THESE
  // quickReplies?: QuickReply[];
  parentId?: string; // For quick reply children blocks to reference their parent
  quickReplyIndex?: number; // For individual quick reply blocks to know their index
  text?: string; // <--- ADD THIS LINE for quick reply blocks if they are ChatbotBlock type
  value?: string; // <--- ADD THIS LINE if needed for quick reply blocks

  buttonTextMessage?: string;
  
}

// Define possible types of chatbot blocks
export type BlockType =
  | 'userInput'
  | 'textResponse'
  | 'typingDelay'
  | 'mediaBlock'
  | 'linkStory'
  | 'notifyAgent'
  | 'conversationalForm'
  | 'conditionalRedirect'
  | 'rssFeed'
  | 'jsonApi'
  | 'shopify'
  | 'noQuickReply'        // Add this
  | 'quickRepliesMain'     // Add this
  | 'quickReplyItem';      // Add this


// Define subtypes for UserInput blocks
export type UserInputSubType = 'phrase' | 'keywordGroup' | 'anything';

// Define the structure for connections between blocks
export interface Connection {
  id: string;
  fromBlockId: string;
  toBlockId: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
}

// Mock interfaces for external data (replace with actual models from your backend)
export interface AvailableMedia {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'file' | 'Image Slider' | 'audio';
  content?: string;
  url?: string;
  imageUrls?: string[];
}

export interface AvailableStory {
  id: string;
  name: string;
  // Add other properties if your story objects have them (e.g., description, blocks)
}

// 💥 IMPORTANT: This is the interface that needs to be updated 💥
export interface AvailableForm {
  id: string;
  name: string;
  webhookUrl?: string;
  sendEmailNotification?: boolean;
  notificationEmail?: string;
  formFields?: FormField[];
  showAsInlineForm?: boolean;
  renderFormResponses?: boolean;
  welcomeMessage?: string;
  validateEmail?: boolean;
  validatePhone?: boolean;
  spamProtection?: boolean;
  requireCompletion?: boolean;

  // If your available forms will also have predefined values for these, add them here:
  allowMultipleSubmission?: boolean;
  multipleSubmissionMessage?: string;
  allowExitForm?: boolean;
  exitFormMessage?: string;
  successResponseType?: 'textMessage' | 'story';
  successRedirectStoryId?: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'phone' | 'date' | 'datetime' | 'options' | 'multiple-options' | 'file' | 'image' | 'url' | 'currency' | 'geocode';
  required: boolean;
  promptPhrase: string;
  options?: string[]; // For choice fields
  optionsText?: string; // For editing choice fields (comma-separated)
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface QuickReply {
  id: string;
  text: string;
  value?: string; // Optional value different from display text
}

export interface FormSubmission {
  id: string;
  formId: string;
  blockId: string;
  userId?: string;
  sessionId: string;
  responses: { [fieldName: string]: any };
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  status: 'pending' | 'processed' | 'failed';
}

export interface FormValidationRule {
  fieldName: string;
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    phone?: boolean;
    url?: boolean;
    number?: {
      min?: number;
      max?: number;
      integer?: boolean;
    };
    date?: {
      min?: Date;
      max?: Date;
    };
    file?: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      maxFiles?: number;
    };
  };
  errorMessage?: string;
}

export interface FormIntegration {
  id: string;
  formId: string;
  type: 'webhook' | 'email' | 'database' | 'api';
  configuration: {
    webhook?: {
      url: string;
      method: 'POST' | 'PUT' | 'PATCH';
      headers?: { [key: string]: string };
      retryAttempts?: number;
      timeout?: number;
    };
    email?: {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      template?: string;
      attachResponses?: boolean;
    };
    database?: {
      table: string;
      mapping: { [fieldName: string]: string };
    };
    api?: {
      endpoint: string;
      authentication?: {
        type: 'bearer' | 'basic' | 'api-key';
        credentials: { [key: string]: string };
      };
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Utility types for form builder
export type FormFieldType = FormField['type'];
export type FormStatus = 'draft' | 'published' | 'archived';
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
};

// Form builder configuration
export interface FormBuilderConfig {
  maxFields: number;
  allowedFieldTypes: FormFieldType[];
  validationRules: {
    enforceRequiredFields: boolean;
    maxFieldNameLength: number;
    maxPromptLength: number;
    allowDuplicateFieldNames: boolean;
  };
  integrationLimits: {
    maxWebhooks: number;
    maxEmailRecipients: number;
    webhookTimeout: number;
  };
}

// Theme and styling for forms
export interface FormTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    error: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: string;
  shadows: {
    light: string;
    medium: string;
    heavy: string;
  };
}

// NEW INTERFACE for API Headers
export interface ApiHeader {
  key: string;
  value: string;
}