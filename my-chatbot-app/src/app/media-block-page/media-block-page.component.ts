import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaBlockComponent } from '../chatbot-flow/blocks/media-block/media-block.component';
import { MatButtonModule } from '@angular/material/button';
import { ChatbotBlock, AvailableMedia, AvailableStory, ImageSlide } from '../models/chatbot-block.model';

@Component({
  selector: 'app-media-block-page',
  standalone: true,
  imports: [CommonModule, MediaBlockComponent, MatButtonModule],
  templateUrl: './media-block-page.component.html',
  styleUrls: ['./media-block-page.component.scss']
})
export class MediaBlockPageComponent {
  blocks: ChatbotBlock[] = [
    {
      id: '1',
      name: 'Media Block 6853',
      icon: 'mic', // Example icon
      type: 'mediaBlock', // Valid BlockType
      status: 'active', // Valid status
      x: 100, // X-coordinate
      y: 100, // Y-coordinate
      width: 200, // Example width
      height: 100, // Example height
      mediaType: 'audio', // Valid mediaType
      audioUrl: 'audio1.mp3',
      buttons: [], // Empty buttons array
      mediaId: 'm1'
    },
    {
      id: '2',
      name: 'Media Block 5983',
      icon: 'image', // Example icon
      type: 'mediaBlock', // Valid BlockType
      status: 'active', // Valid status
      x: 200, // X-coordinate
      y: 200, // Y-coordinate
      width: 200, // Example width
      height: 100, // Example height
      mediaType: 'Image Slider', // Valid mediaType
      slides: [{ image: 'slide1.jpg', title: 'Slide 1', subtitle: 'Sub 1' } as ImageSlide], // Type assertion for slides
      buttons: [], // Empty buttons array
      mediaId: 'm2'
    }
    // Add more blocks as needed
  ];
  selectedBlock: ChatbotBlock | null = null;
  isEditing: boolean = false;
  availableMedia: AvailableMedia[] = [
    {
      id: 'm1',
      name: 'Audio Media',
      type: 'audio', // Valid type
      content: '',
      url: 'audio1.mp3'
    },
    {
      id: 'm2',
      name: 'Slider Media',
      type: 'Image Slider', // Valid type
      content: '',
      slides: [{ image: 'slide1.jpg', title: 'Slide 1', subtitle: 'Sub 1' } as ImageSlide] // Type assertion for slides
    }
  ];
  availableStories: AvailableStory[] = [];

  onSelectBlock(block: ChatbotBlock): void {
    this.selectedBlock = block;
    this.isEditing = false; // Reset editing state on selection
  }

  onEditBlock(block: ChatbotBlock): void {
    this.selectedBlock = block;
    this.isEditing = true;
  }

  onBlockUpdated(updatedBlock: ChatbotBlock): void {
    const index = this.blocks.findIndex(b => b.id === updatedBlock.id);
    if (index !== -1) {
      this.blocks[index] = updatedBlock;
    }
    this.isEditing = false; // Reset after update
    this.selectedBlock = null; // Optional: Clear selection after update
  }

  onStartConnection(event: MouseEvent): void {
    // Handle connection start
  }

  onEndConnection(event: MouseEvent): void {
    // Handle connection end
  }

  onRemoveBlock(id: string): void {
    this.blocks = this.blocks.filter(b => b.id !== id);
    if (this.selectedBlock?.id === id) {
      this.selectedBlock = null;
      this.isEditing = false;
    }
  }

  onDuplicateBlock(block: ChatbotBlock): void {
    const newBlock = { ...block, id: `dup-${Date.now()}` };
    this.blocks.push(newBlock);
  }

  onCloseSidebar(): void {
    this.isEditing = false;
    this.selectedBlock = null;
  }

  onContentChange(): void {
    // Handle content change if needed
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedBlock = null;
  }
}