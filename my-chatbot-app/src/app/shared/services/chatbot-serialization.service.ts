import { Injectable } from '@angular/core';
import { ChatbotBlock, Connection, BlockType } from '../../models/chatbot-block.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotSerializationService {

  constructor() { }

  /**
   * Serializes the entire chatbot flow into a storable JSON object.
   * This object can be saved to a database and later used by the client-side widget.
   */
  serializeFlow(blocks: ChatbotBlock[], connections: Connection[]): any {
    const serializedBlocks = blocks.map(block => {
      const blockData: any = { ...block };

      // Append connection data to each block.
      // This is crucial for the widget to know where to go next.
      blockData.outputs = connections
        .filter(conn => conn.fromBlockId === block.id)
        .map(conn => ({
          toBlockId: conn.toBlockId
        }));
      
      // For quick replies, we need a special case to map each reply to a block.
      if (block.type === 'textResponse' && block.quickReplies && block.quickReplies.length > 0) {
        blockData.quickReplyOutputs = connections
            .filter(conn => conn.fromBlockId.startsWith(block.id + '-qr-'))
            .map(conn => {
                const qrIndex = parseInt(conn.fromBlockId.split('-qr-')[1], 10);
                return {
                    quickReplyIndex: qrIndex,
                    toBlockId: conn.toBlockId
                };
            });
      }

      return blockData;
    });

    return {
      name: 'Published Bot',
      welcomeMessage: 'Hello! How can I help you today?', // Or from a setting
      blocks: serializedBlocks
    };
  }
}