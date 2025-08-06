// media.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AvailableMedia, ChatbotBlock, ImageSlide } from '../../models/chatbot-block.model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private availableMediaSubject = new BehaviorSubject<AvailableMedia[]>([]);
  availableMedia$: Observable<AvailableMedia[]> = this.availableMediaSubject.asObservable();

  constructor() {
    // Mock data source (replace with actual model fetch logic)
    this.setAvailableMedia([
      { id: 'm1', name: 'Audio Media', type: 'audio', content: '', url: 'audio1.mp3' },
      { id: 'm2', name: 'Slider Media', type: 'Image Slider', content: '', slides: [{ image: 'slide1.jpg', title: 'Slide 1', subtitle: 'Sub 1' }] },
      { id: 'm3', name: 'Image Media', type: 'image', content: '', url: 'image1.jpg' },
      { id: 'm4', name: 'Video Media', type: 'video', content: '', url: 'video1.mp4' }
    ]);
  }

  setAvailableMedia(media: AvailableMedia[]): void {
    this.availableMediaSubject.next(media);
  }

  getAvailableMedia(): Observable<AvailableMedia[]> {
    return this.availableMedia$;
  }

  addMediaBlock(block: ChatbotBlock): void {
    // Type guard to ensure mediaType is valid, default to 'text' if undefined
    const validMediaTypes = ['audio', 'text', 'image', 'video', 'file', 'Image Slider'] as const;
    const mediaType = block.mediaType && validMediaTypes.includes(block.mediaType)
      ? block.mediaType
      : 'text'; // Default to 'text' if undefined or invalid

    const media: AvailableMedia = {
      id: `m-${Date.now()}`,
      name: block.mediaName || block.name || `Media Block ${Date.now()}`,
      type: mediaType as 'audio' | 'text' | 'image' | 'video' | 'file' | 'Image Slider',
      content: block.content || '',
      url: this.getUrlForMediaType(block),
      slides: block.slides ? [...block.slides] : undefined
    };
    const currentMedia = this.availableMediaSubject.value;
    this.setAvailableMedia([...currentMedia, media]);
  }

  updateMediaBlock(updatedMedia: AvailableMedia): void {
    const currentMedia = this.availableMediaSubject.value;
    const index = currentMedia.findIndex(m => m.id === updatedMedia.id);
    if (index !== -1) {
      currentMedia[index] = updatedMedia;
      this.setAvailableMedia([...currentMedia]);
    }
  }

  private getUrlForMediaType(block: ChatbotBlock): string {
    switch (block.mediaType) {
      case 'video':
        return block.videoUrl || '';
      case 'audio':
        return block.audioUrl || '';
      case 'file':
        return block.fileUrl || '';
      case 'image':
        return block.singleImageUrl || '';
      default:
        return '';
    }
  }
}