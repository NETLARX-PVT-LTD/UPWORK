import { Injectable } from '@angular/core';
import { ChatbotBlock, Connection } from '../models/chatbot-block.model';

export interface ChatbotFlow {
  blocks: ChatbotBlock[];
  connections: Connection[];
}

export interface ChatbotResponse {
  type: 'text' | 'media' | 'form' | 'delay';
  content: any;
  nextBlockId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotExecutionService {

  constructor() { }

  /**
   * Execute the chatbot flow based on user input
   */
  executeFlow(userMessage: string, flow: ChatbotFlow): ChatbotResponse[] {
    const responses: ChatbotResponse[] = [];
    
    // 1. Find the starting block (User Input that matches user message)
    const startingBlock = this.findMatchingInputBlock(userMessage, flow.blocks);
    
    if (!startingBlock) {
      return [{ type: 'text', content: 'Sorry, I did not understand that.' }];
    }

    // 2. Execute the flow starting from the matching block
    let currentBlock = startingBlock;
    
    while (currentBlock) {
      const response = this.executeBlock(currentBlock);
      if (response) {
        responses.push(response);
      }

      // 3. Find next block via connection
      currentBlock = this.findNextBlock(currentBlock.id, flow.connections, flow.blocks);
    }

    return responses;
  }

  /**
   * Find User Input block that matches the user message
   */
  private findMatchingInputBlock(userMessage: string, blocks: ChatbotBlock[]): ChatbotBlock | null {
    const userInputBlocks = blocks.filter(block => block.type === 'userInput');
    
    for (const block of userInputBlocks) {
      if (this.matchesUserInput(userMessage, block)) {
        return block;
      }
    }
    
    return null;
  }

  /**
   * Check if user message matches a User Input block
   */
  private matchesUserInput(userMessage: string, block: ChatbotBlock): boolean {
    const message = userMessage.toLowerCase().trim();
    
    switch (block.subType) {
      case 'keywordGroup':
        if (block.keywordGroups) {
          return block.keywordGroups.some(group => 
            group.some(keyword => 
              message.includes(keyword.toLowerCase())
            )
          );
        }
        break;
        
      case 'phrase':
        if (block.phraseText) {
          return message.includes(block.phraseText.toLowerCase());
        }
        break;
        
      case 'anything':
        return true; // Matches anything
    }
    
    return false;
  }

  /**
   * Execute a single block and return its response
   */
  private executeBlock(block: ChatbotBlock): ChatbotResponse | null {
    switch (block.type) {
      case 'userInput':
        // User Input blocks don't generate responses, they just match
        return null;
        
      case 'textResponse':
        return {
          type: 'text',
          content: block.content || 'No message configured'
        };
        
      case 'mediaBlock':
        return {
          type: 'media',
          content: {
            type: block.mediaType,
            url: block.mediaUrl,
            name: block.mediaName
          }
        };
        
      case 'typingDelay':
        return {
          type: 'delay',
          content: block.delaySeconds || 1
        };
        
      case 'conversationalForm':
        return {
          type: 'form',
          content: {
            formId: block.formId,
            fields: block.formFields,
            welcomeMessage: block.welcomeMessage
          }
        };
        
      default:
        return null;
    }
  }

  /**
   * Find the next block in the flow via connections
   */
  private findNextBlock(currentBlockId: string, connections: Connection[], blocks: ChatbotBlock[]): ChatbotBlock | null {
    // Find connection that starts from current block
    const connection = connections.find(conn => conn.fromBlockId === currentBlockId);
    
    if (!connection) {
      return null; // No next block
    }
    
    // Find the target block
    return blocks.find(block => block.id === connection.toBlockId) || null;
  }

  /**
   * Save flow data in the format you showed
   */
  saveFlowData(blocks: ChatbotBlock[], connections: Connection[]): any {
    return {
      blocks: blocks.map(block => ({
        id: block.id,
        type: block.type,
        keywords: block.keywordGroups?.flat() || [],
        message: block.content,
        mediaUrl: block.mediaUrl,
        connections: this.getBlockConnections(block.id, connections)
      })),
      connections: connections.map(conn => ({
        from: conn.fromBlockId,
        to: conn.toBlockId
      }))
    };
  }

  /**
   * Get all connections for a specific block
   */
  private getBlockConnections(blockId: string, connections: Connection[]): string[] {
    return connections
      .filter(conn => conn.fromBlockId === blockId)
      .map(conn => conn.toBlockId);
  }
} 