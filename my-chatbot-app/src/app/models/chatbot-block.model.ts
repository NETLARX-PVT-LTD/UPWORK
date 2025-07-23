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
  | 'shopify';

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
  // If your backend stores these properties with AvailableForm, you can add them here
  // webhookUrl?: string;
  // sendEmailNotification?: boolean;
  // notificationEmail?: string;
  // formFields?: FormField[];
  // showAsInlineForm?: boolean;
  // renderFormResponses?: boolean;
}

// 💥 IMPORTANT: This is the interface that needs to be updated 💥
export interface AvailableForm {
  id: string;
  name: string;
  // Add these properties to match what you are providing in the mock data
  // and what you are trying to access in conversational-form-block.component.ts
  webhookUrl?: string;
  sendEmailNotification?: boolean;
  notificationEmail?: string;
  formFields?: FormField[];
  showAsInlineForm?: boolean;
  renderFormResponses?: boolean;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'phone' | 'options' | 'image' | 'datetime' | 'currency' | 'url' | 'geocode' | 'file' | 'multiple-options'; // Ensure this matches the comprehensive list
  // Add other properties if they are used here, like promptPhrase or required
  promptPhrase?: string;
  required?: boolean;
  options?: string[];
}

export interface QuickReply {
  id: string;
  text: string;
}