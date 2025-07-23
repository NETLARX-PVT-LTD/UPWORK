// src/app/models/chatbot-block.model.ts

export interface ChatbotBlock {
  id: string;
  name: string;
  icon: string;
  type: string; // e.g., 'userInput', 'textResponse', 'typingDelay'
  status: string; // e.g., 'active', 'error', 'new', 'disabled'
  x: number;
  y: number;
  width: number; // Actual width after rendering
  height: number; // Actual height after rendering
  description?: string; // Optional description for left sidebar blocks

  // Properties specific to 'userInput' blocks
  subType?: 'keywordGroup' | 'phrase' | 'anything';
  keywords?: string[];
  phraseText?: string;
  customMessage?: string;

  // Properties specific to 'textResponse' blocks
  content?: string; // Main text content for textResponse, or delay for typingDelay
  alternateResponses?: string[]; // For textResponse block
  quickReplies?: string[]; // For textResponse block

  // Properties specific to 'typingDelay' blocks
  delaySeconds?: number; // For typingDelay block
}

export interface Connection {
  id: string;
  fromBlockId: string;
  toBlockId: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
}
