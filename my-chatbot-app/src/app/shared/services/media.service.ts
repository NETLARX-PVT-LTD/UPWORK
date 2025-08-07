import { Injectable } from '@angular/core';
import { AvailableMedia } from '../../models/chatbot-block.model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private availableMedia: AvailableMedia[] = [
    {
      id: 'media-1',
      name: 'Sample Text Block',
      type: 'text',
      content: 'This is a sample text block for demonstration purposes.',
      createdAt: new Date().toISOString(),
      buttons: [
        { type: 'text_message', title: 'Reply', value: 'Hello' },
        { type: 'website_url', title: 'Visit', value: 'https://example.com' }
      ]
    },
    {
      id: 'media-2',
      name: 'Sample Image Block',
      type: 'image',
      url: 'https://via.placeholder.com/300x200',
      createdAt: new Date().toISOString(),
      buttons: []
    },
    {
      id: 'media-3',
      name: 'Sample Slider Block',
      type: 'Image Slider',
      slides: [
        { image: 'https://via.placeholder.com/300x200', title: 'First Slide' },
        { image: 'https://via.placeholder.com/300x200', title: 'Second Slide' }
      ],
      createdAt: new Date().toISOString(),
      buttons: []
    }
  ];

  getMediaBlocks(): AvailableMedia[] {
    return JSON.parse(JSON.stringify(this.availableMedia)); // Return a deep copy
  }

  updateMediaBlock(updatedMedia: AvailableMedia): void {
    const index = this.availableMedia.findIndex(m => m.id === updatedMedia.id);
    if (index > -1) {
      this.availableMedia[index] = JSON.parse(JSON.stringify(updatedMedia)); // Deep copy
    } else {
      this.availableMedia.push(JSON.parse(JSON.stringify(updatedMedia)));
    }
  }

  deleteMediaBlock(mediaId: string): void {
    this.availableMedia = this.availableMedia.filter(m => m.id !== mediaId);
  }

  duplicateMediaBlock(media: AvailableMedia): AvailableMedia {
    const duplicatedMedia: AvailableMedia = {
      ...media,
      id: 'media-' + Date.now().toString(),
      name: media.name + ' (Copy)',
      slides: media.slides ? JSON.parse(JSON.stringify(media.slides)) : [],
      buttons: media.buttons ? JSON.parse(JSON.stringify(media.buttons)) : [],
      createdAt: new Date().toISOString()
    };
    this.availableMedia.push(duplicatedMedia);
    return duplicatedMedia;
  }
}