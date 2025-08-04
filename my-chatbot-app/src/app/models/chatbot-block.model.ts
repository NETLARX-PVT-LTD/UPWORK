// src/app/models/chatbot-block.model.ts

// Define the structure for a chatbot block
export interface ChatbotBlock {
  id: string;
  name: string;
  icon: string;
  type: BlockType;
  imageUrl?: string;
  status: 'active' | 'error' | 'new' | 'disabled' | 'normal';
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
  
  // 💥 NEW: DEDICATED PROPERTIES FOR EACH MEDIA TYPE 💥
  // These replace the generic `mediaUrl` property to prevent conflicts.
  singleImageUrl?: string; // For a single 'image' media type
  videoUrl?: string; // For a single 'video' media type
  audioUrl?: string; // For a single 'audio' media type
  fileUrl?: string; // For a single 'file' media type
  
  // 💥 NOTE: Your `slides` property for Image Slider is already correctly defined.
  slides?: ImageSlide[]; // Array of slide objects
  
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

  // NEW: Properties for the text message button
  buttonTitle?: string;
  buttonTextMessage?: string;
  buttonType?: 'text_message' | 'media_block' | 'website_url' | 'direct_call' | 'start_story' | 'rss_feed' | 'json_api' | 'human_help' | 'conversational_form'; // NEW: Type of button action
  buttonLinkedMediaId?: string; // For 'media_block' button type
  buttonUrl?: string; // NEW: For 'website_url' button type
  // NEW: An array to hold multiple buttons
  buttons?: Button[];

  // This property is now deprecated and should be removed from your component's logic.
  // mediaUrl?: string; 
  // This property is now deprecated and should be removed.
  // imageSliderUrls?: string[];
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
  | 'quickReplyItem'
  | 'quickReply';      // Add this


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
  // Add Image Slider properties
  slideTitle?: string;
  slideSubtitle?: string;
  slideImages?: string[];
  slides?: ImageSlide[];
}

export interface AvailableStory {
  id: string;
  name: string;
  blocks? : ChatbotBlock[]
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

export interface Button {
  title: string;
  type: 'text_message' | 'media_block' | 'website_url' | 'direct_call' | 'start_story' | 'rss_feed' | 'json_api' | 'human_help' | 'conversational_form';
  textMessage?: string; // For 'text_message' type
  linkedMediaId?: string; // For 'media_block' type
  url?: string; // For 'website_url' type
  phoneNumber?: string;
  storyId?: string;
  rssUrl?: string; // New property for RSS Feed URL
  rssItemCount?: number; // New property for number of items
  rssButtonText?: string; // New property for button text
   jsonApiUrl?: string; // New property for JSON API URL
  jsonApiMethod?: 'GET' | 'POST'; // New property for HTTP method
  jsonApiHeaders?: string; // New property for headers
  jsonApiBody?: string; // New property for body
    apiEndpoint?: string; // New property for API Endpoint
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // New property for request type
  apiHeaders?: ApiHeader[]; // New property for API headers
  // Add the new properties for Human Help Integration
  messageAfterAction?: string;
  emailForNotification?: string;
  stopBotForUser?: boolean;
  // Add the new properties for Conversational Form Integration
  formId?: string;
  showInline?: boolean;
}
export interface ApiBlock {
  // ... other properties of your block (e.g., buttons, etc.)
  apiEndpoint?: string;
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiHeaders?: ApiHeader[];
}
// NEW: Interface for a single image slide
export interface ImageSlide {
  image?: string; // The base64 or URL of the image
  title?: string;
  subtitle?: string;
}