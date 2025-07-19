// src/app/models/chatbot-block.model.ts (Example - ensure this matches your actual model)
export interface ChatbotBlock {
  id: string;
  name: string;
  icon: string;
  type: string;
  status: string;
  x: number;
  y: number;
  subType?: string; // e.g., 'phrase', 'keywordGroup', 'anything'
  description?: string;
  width: number;
  height: number;
  content?: string; // This is crucial for storing the message
  keywords?: string[]; // For 'keywordGroup'
}

export interface Connection {
  id: string;
  fromBlockId: string;
  toBlockId: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
}