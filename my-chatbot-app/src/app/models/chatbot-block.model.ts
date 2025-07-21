// src/app/models/chatbot-block.model.ts
export interface ChatbotBlock {
  id: string;
  name: string;
  icon: string;
  type: string;
  status: string;
  x: number;
  y: number;
  width?: number; // Optional, will be set after rendering
  height?: number; // Optional, will be set after rendering
  description?: string;
  subType?: 'phrase' | 'keywordGroup' | 'anything'; // For userInput blocks
  content?: string; // For textResponse or other simple content blocks
  keywords?: string[]; // For userInput keywordGroup
  phraseText?: string; // For userInput phrase
  customMessage?: string; // For userInput anything
}

export interface Connection {
  id: string;
  fromBlockId: string;
  toBlockId: string;
  fromPoint: { x: number; y: number; };
  toPoint: { x: number; y: number; };
}