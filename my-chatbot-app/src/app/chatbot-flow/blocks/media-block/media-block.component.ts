import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { trigger, transition, style, animate } from '@angular/animations'; 
import { ChatbotBlock, AvailableMedia, Button, AvailableStory, ImageSlide, AvailableForm } from '../../../models/chatbot-block.model';
import { MatTabsModule } from '@angular/material/tabs'; 

import { MediaService } from '../../../shared/services/media.service';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';

type ButtonIntegrationType = 'text_message' | 'media_block' | 'website_url' | 'direct_call' | 'start_story' | 'rss_feed' | 'json_api' | 'human_help' | 'conversational_form' | null;

export interface ApiHeader {
  key: string;
  value: string;
}

export interface ApiBlock {
  // ... other properties
  apiEndpoint?: string;
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiHeaders?: ApiHeader[];
}

// Define interfaces for isolated data storage
interface SingleImageData {
  image: string;
  title: string;
  subtitle: string;
}

interface VideoData {
  url: string;
}

interface AudioData {
  url: string;
}

interface FileData {
  url: string;
  fileName: string;
}

@Component({
  selector: 'app-media-block',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    CdkTextareaAutosize,
    MatSlideToggleModule
  ],
  templateUrl: './media-block.component.html',
  styleUrls: ['./media-block.component.scss'],
  animations: [
    trigger('slideAnimation', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
    ])
  ]
})
export class MediaBlockComponent implements OnInit {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;
  @Input() availableMedia: AvailableMedia[] = [];
  @Input() availableStories : AvailableStory[] = [];
  @Input() availableForms : AvailableForm[] = [];

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();
  @Output() closeSidebarEvent = new EventEmitter<void>();
  @Output() contentChange = new EventEmitter<void>();
@Output() mediaUpdated = new EventEmitter<AvailableMedia[]>(); // New emitter for media updates


  showNewMediaForm: boolean = false;
  showButtonTypeCard: boolean = false;
  showCommonIntegrationCard: boolean = false;
  videoUrlInput: string = '';
  
  // Properties to control the visibility of the upload modal
  activeMediaType: 'image' | 'video' | 'file' | null = null;
  showUploadModal: boolean = false;
  uploadedFileName: string = '';
  imageUrlInput: string = '';
  
  // Temporary properties to manage the button being added or edited
  currentButton: Partial<Button> = {};
  currentButtonIndex: number = -1; // -1 for a new button, otherwise the index of the button being edited

  // Properties for info modal
  showInfoModal: boolean = false;
  private activeInputElementType: 'buttonTitle' | 'buttonTextMessage' | null = null;
  searchTerm: string = '';

  // Add this property for tracking current slide
  currentSlideIndex: number = 0;

  // FIXED: Add missing properties for data isolation
  singleImageData: SingleImageData = { image: '', title: '', subtitle: '' };
  imageSliderData: ImageSlide[] = [{ image: '', title: '', subtitle: '' }];
  videoData: VideoData = { url: '' };
  audioData: AudioData = { url: '' };
  fileData: FileData = { url: '', fileName: '' };

  // Complete data isolation with centralized storage
  private mediaTypeData = {
    text: { content: '' },
    image: { image: '', title: '', subtitle: '' },
    'Image Slider': [{ image: '', title: '', subtitle: '' }] as ImageSlide[],
    video: { url: '' },
    audio: { url: '' },
    file: { url: '', fileName: '' }
  };

  // ViewChild references
  @ViewChild('fileUploadInput') fileUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('audioUploadInput') audioUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoUploadInput') videoUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imageUploadInput') imageUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('buttonTitleAutosize', { read: ElementRef }) buttonTitleAutosizeElement!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('buttonTextMessageAutosize', { read: ElementRef }) buttonTextMessageAutosizeElement!: ElementRef<HTMLTextAreaElement>;

  generalAttributes: string[] = [
    '{first_name}',
    '{last_name}',
    '{timezone}',
    '{gender}',
    '{last_user_msg}',
    '{last_page}',
    '{os}'
  ];

  formAttributes: string[] = [
    '{user/last_user_message}',
    '{user/last_bot_message}',
    '{user/last_user_button}',
    '{user/created_at}',
    '{user/mens_watch}',
    '{user/Range}',
    '{user/Price}',
    '{user/Name}'
  ];

  userAttributes: string[] = [
    '{user/Gender}'
  ];

  filteredGeneralAttributes: string[] = [];
  filteredFormAttributes: string[] = [];
  filteredUserAttributes: string[] = [];
  
  activeTab: 'upload' | 'url' = 'upload';

  constructor(private _snackBar: MatSnackBar) { }

  // Create this new method to check for any media content
hasMediaContent(): boolean {
  return (
    !!this.block.singleImageUrl ||
    !!this.block.videoUrl ||
    !!this.block.audioUrl ||
    !!this.block.fileUrl ||
    (this.block.slides && this.block.slides.length > 0)
  ) ?? false; // <-- Add this to ensure a boolean is always returned
}

 get hasContent(): boolean {
    return !!this.block.content ||
           !!this.block.singleImageUrl ||
           !!this.block.videoUrl ||
           !!this.block.audioUrl ||
           !!this.block.fileUrl ||
           (this.block.slides && this.block.slides.length > 0) ||
           (this.block.buttons?.length ?? 0) > 0;
  }

  // FIXED: Complete rewrite of onMediaTypeChange method
onMediaTypeChange(newMediaType: 'image' | 'video' | 'file' | 'text' | 'Image Slider' | 'audio'): void {
  const previousMediaType = this.block.mediaType || 'text';

  // Step 1: Save current block data to the isolated storage
  this.saveCurrentDataToIsolatedStorage(previousMediaType);

  // Step 2: Set the new media type on the block
  this.block.mediaType = newMediaType;

  // Step 3: Load data for the new media type from isolated storage
  this.loadDataFromIsolatedStorage(newMediaType);

  // Step 4: Ensure slides are properly initialized for Image Slider
  if (newMediaType === 'Image Slider') {
    if (!this.isolatedMediaData.slides || this.isolatedMediaData.slides.length === 0) {
      this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
    }
    this.block.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
    this.currentSlideIndex = 0;
  }

  this.onContentChange();
}

  // Method to save current block data to isolated storage
 // Add a property to your component to hold the isolated data
isolatedMediaData: {
  text?: string;
  image?: string;
  video?: string;
  audio?: string;
  file?: string;
  slides?: ImageSlide[];
} = {
  text: '',
  image: '',
  video: '',
  audio: '',
  file: '',
  slides: []
};

saveCurrentDataToIsolatedStorage(mediaType: string): void {
  switch (mediaType) {
    case 'text':
      this.isolatedMediaData.text = this.block.content || '';
      break;
    case 'image':
      this.isolatedMediaData.image = this.block.singleImageUrl || '';
      break;
    case 'Image Slider':
      this.isolatedMediaData.slides = this.block.slides
        ? JSON.parse(JSON.stringify(this.block.slides))
        : [{ image: '', title: '', subtitle: '' }];
      break;
    case 'video':
      this.isolatedMediaData.video = this.block.videoUrl || '';
      break;
    case 'audio':
      this.isolatedMediaData.audio = this.block.audioUrl || '';
      break;
    case 'file':
      this.isolatedMediaData.file = this.block.fileUrl || '';
      break;
  }
}

  // Method to load data from isolated storage to block
loadDataFromIsolatedStorage(mediaType: string): void {
  // Reset all media properties on the main block object
  this.block.content = '';
  this.block.singleImageUrl = '';
  this.block.videoUrl = '';
  this.block.audioUrl = '';
  this.block.fileUrl = '';
  this.block.slides = [];

  switch (mediaType) {
    case 'text':
      this.block.content = this.isolatedMediaData.text || '';
      break;
    case 'image':
      this.block.singleImageUrl = this.isolatedMediaData.image || '';
      break;
    case 'Image Slider':
      this.block.slides = this.isolatedMediaData.slides && this.isolatedMediaData.slides.length > 0
        ? JSON.parse(JSON.stringify(this.isolatedMediaData.slides))
        : [{ image: '', title: '', subtitle: '' }];
      this.currentSlideIndex = Math.min(this.currentSlideIndex, (this.block.slides?.length || 1) - 1);
      break;
    case 'video':
      this.block.videoUrl = this.isolatedMediaData.video || '';
      break;
    case 'audio':
      this.block.audioUrl = this.isolatedMediaData.audio || '';
      break;
    case 'file':
      this.block.fileUrl = this.isolatedMediaData.file || '';
      break;
  }
}
  // Initialize isolated storage from current block data
private initializeIsolatedStorageFromBlock(): void {
  const mediaType = this.block.mediaType;

  switch (mediaType) {
    case 'text':
      this.isolatedMediaData.text = this.block.content || '';
      break;

    case 'image':
      this.isolatedMediaData.image = this.block.singleImageUrl || '';
      break;

    case 'Image Slider':
      this.isolatedMediaData.slides = this.block.slides
        ? JSON.parse(JSON.stringify(this.block.slides))
        : [{ image: '', title: '', subtitle: '' }];
      break;

    case 'video':
      this.isolatedMediaData.video = this.block.videoUrl || '';
      break;

    case 'audio':
      this.isolatedMediaData.audio = this.block.audioUrl || '';
      break;

    case 'file':
      this.isolatedMediaData.file = this.block.fileUrl || '';
      break;
  }
}

  // File upload methods
  triggerFileUpload(): void {
    this.fileUploadInput.nativeElement.click();
  }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      this.uploadedFileName = file.name;
      
      this.mediaTypeData.file = {
        url: fileUrl,
        fileName: file.name
      };
      this.block.fileUrl = fileUrl;
      
      this.onContentChange();
      this._snackBar.open('File uploaded successfully!', 'Dismiss', { duration: 2000 });
      
      event.target.value = null;
    }
  }

  triggerAudioUpload(): void {
    this.audioUploadInput.nativeElement.click();
  }

  onAudioUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      
      this.mediaTypeData.audio.url = audioUrl;
      this.block.audioUrl = audioUrl;
      
      this.onContentChange();
      this._snackBar.open('Audio uploaded successfully!', 'Dismiss', { duration: 2000 });
      
      event.target.value = null;
    }
  }

  // Remove methods
  removeAudioMedia(): void {
    if (this.block.mediaType === 'audio') {
      this.mediaTypeData.audio.url = '';
      this.block.audioUrl = '';
      this.contentChange.emit();
      this._snackBar.open('Audio removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  removeVideoMedia(): void {
    if (this.block.mediaType === 'video') {
      this.mediaTypeData.video.url = '';
      this.block.videoUrl = '';
      this.contentChange.emit();
      this._snackBar.open('Video removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  removeFile(): void {
    this.mediaTypeData.file = { url: '', fileName: '' };
    this.block.fileUrl = '';
    this.uploadedFileName = '';
    this.onContentChange();
    this._snackBar.open('File removed.', 'Dismiss', { duration: 2000 });
  }

  removeMedia(): void {
  if (this.block.mediaType === 'image') {
    this.block.singleImageUrl = '';
    this.isolatedMediaData.image = '';
  } else if (this.block.mediaType === 'Image Slider') {
    this.removeCurrentSlide();
  } else if (this.block.mediaType === 'video') {
    this.block.videoUrl = '';
    this.isolatedMediaData.video = '';
  } else if (this.block.mediaType === 'audio') {
    this.block.audioUrl = '';
    this.isolatedMediaData.audio = '';
  } else if (this.block.mediaType === 'file') {
    this.block.fileUrl = '';
    this.isolatedMediaData.file = '';
  } else if (this.block.mediaType === 'text') {
    this.block.content = '';
    this.isolatedMediaData.text = '';
  }

  this.onContentChange();
}

  // Modal methods
  openUploadModal(mediaType: 'image' | 'video' | 'file'): void {
    this.activeMediaType = mediaType;
    this.showUploadModal = true;
    this.uploadedFileName = '';
    this.imageUrlInput = '';
    this.videoUrlInput = '';
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.activeMediaType = null;
  }

  openImageUploadModal(): void {
    const fileInput = document.getElementById('imageUploadInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Video upload methods
  onVideoUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name;
      const videoUrl = URL.createObjectURL(file);
      
      this.mediaTypeData.video.url = videoUrl;
      this.block.videoUrl = videoUrl;
      
      this.onContentChange();
      this.closeUploadModal();
      this._snackBar.open('Video uploaded successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  uploadVideoUrl(): void {
    if (this.videoUrlInput) {
      this.mediaTypeData.video.url = this.videoUrlInput;
      this.block.videoUrl = this.videoUrlInput;
      
      this.onContentChange();
      this.closeUploadModal();
      this._snackBar.open('Video URL added successfully!', 'Dismiss', { duration: 2000 });
    } else {
      this._snackBar.open('Please enter a valid video URL.', 'Dismiss', { duration: 2000 });
    }
  }
  
  // API header methods
  addApiHeader(): void {
    if (!this.currentButton.apiHeaders) {
      this.currentButton.apiHeaders = [];
    }
    this.currentButton.apiHeaders.push({ key: '', value: '' });
  }

  removeApiHeader(index: number): void {
    if (this.currentButton.apiHeaders) {
      this.currentButton.apiHeaders.splice(index, 1);
    }
  }

  // Button methods
  onEditButtonClick(button: Button, index: number): void {
    this.showButtonTypeCard = false;
    this.showCommonIntegrationCard = true;
    this.currentButtonIndex = index;
    this.currentButton = JSON.parse(JSON.stringify(button));
    this._snackBar.open(`Editing ${this.currentButton.type?.replace('_', ' ')}.`, 'Dismiss', { duration: 2000 });
  }

  onDeleteButtonClick(index: number): void {
    if (this.block.buttons) {
      this.block.buttons.splice(index, 1);
      this.blockUpdated.emit(this.block);
      this._snackBar.open('Button removed.', 'Dismiss', { duration: 2000 });
    }
  }

  // FIXED: Initialize component
ngOnInit(): void {
  if (this.block.mediaType) {
    this.initializeIsolatedStorageFromBlock();
  }

  if (!this.block.buttons) {
    this.block.buttons = [];
  }

  if (!this.block.mediaType) {
    this.block.mediaType = 'text';
  }
  if (this.block.content === undefined) {
    this.block.content = '';
  }
  // FIXED: Remove mediaUrl references, use specific media type properties
  if (this.block.mediaName === undefined) {
    this.block.mediaName = '';
  }

  if (this.block.mediaType === 'image' || this.block.mediaType === 'Image Slider') {
    if (!this.block.slides || this.block.slides.length === 0) {
      this.block.slides = [{ image: '', title: '', subtitle: '' }];
    }
  }

  this.currentSlideIndex = 0;

  if (this.isSelected && this.block.mediaId) {
    const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
    if (selected) {
      this.block.mediaName = selected.name;
      this.block.mediaType = selected.type;
      this.block.content = selected.content;
      // FIXED: Use specific properties instead of mediaUrl
      this.setMediaUrlFromSelected(selected);
      this.block.slides = selected.slides ? JSON.parse(JSON.stringify(selected.slides)) : [];
      
      this.initializeIsolatedStorageFromBlock();
    }
  }

  this.resetFilteredAttributes();
}

private setMediaUrlFromSelected(selected: AvailableMedia): void {
  switch (selected.type) {
    case 'video':
      this.block.videoUrl = selected.url;
      break;
    case 'audio':
      this.block.audioUrl = selected.url;
      break;
    case 'file':
      this.block.fileUrl = selected.url;
      break;
    case 'image':
      this.block.singleImageUrl = selected.url;
      break;
    // Image Slider uses slides array, not a direct URL
  }
}

  // FIXED: Updated onContentChange method (remove duplicate)
  onContentChange(): void {
    if (this.block.mediaType) {
      this.saveCurrentDataToIsolatedStorage(this.block.mediaType);
    }
    this.blockUpdated.emit(this.block);
  }

  // Slide management methods
  addNewSlide(): void {
  if (this.block.mediaType === 'Image Slider') {
    // Ensure slides array exists
    if (!this.isolatedMediaData.slides) {
      this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
    }
    // Add a new slide to isolatedMediaData.slides
    this.isolatedMediaData.slides.push({ image: '', title: '', subtitle: '' });
    // Sync block.slides with isolatedMediaData.slides
    this.block.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
    // Move to the new slide
    this.currentSlideIndex = this.isolatedMediaData.slides.length - 1;
    
    this.blockUpdated.emit(this.block);
    this._snackBar.open('New slide added.', 'Dismiss', { duration: 2000 });
  }
}

  removeCurrentSlide(): void {
    if (this.block.mediaType === 'Image Slider' && this.mediaTypeData['Image Slider'].length > 1) {
      this.mediaTypeData['Image Slider'].splice(this.currentSlideIndex, 1);
      if (this.currentSlideIndex >= this.mediaTypeData['Image Slider'].length) {
        this.currentSlideIndex = this.mediaTypeData['Image Slider'].length - 1;
      }
      this.block.slides = JSON.parse(JSON.stringify(this.mediaTypeData['Image Slider']));
      
      this.blockUpdated.emit(this.block);
      this._snackBar.open('Slide removed successfully!', 'Dismiss', { duration: 2000 });
    } else if (this.block.mediaType === 'Image Slider' && this.mediaTypeData['Image Slider'].length === 1) {
      this.mediaTypeData['Image Slider'][0] = { image: '', title: '', subtitle: '' };
      this.block.slides = JSON.parse(JSON.stringify(this.mediaTypeData['Image Slider']));
      
      this.blockUpdated.emit(this.block);
      this._snackBar.open('Slide content reset.', 'Dismiss', { duration: 2000 });
    }
  }

  removeCurrentImage(index: number): void {
    if (this.block.slides && this.block.slides[index]) {
      if (this.block.mediaType === 'image') {
        this.mediaTypeData.image.image = '';
        this.block.slides[index].image = '';
        this.block.singleImageUrl = '';
      } else if (this.block.mediaType === 'Image Slider') {
        this.mediaTypeData['Image Slider'][index].image = '';
        this.block.slides[index].image = '';
      }
      
      this.blockUpdated.emit(this.block);
      this._snackBar.open('Image removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }
  
  triggerImageUpload(): void {
    this.imageUploadInput.nativeElement.click();
  }

// Method to handle image uploads
onImageUpload(event: any): void {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const imageDataUrl = e.target.result as string;

    if (this.block.mediaType === 'image') {
      this.isolatedMediaData.image = imageDataUrl;
      this.block.singleImageUrl = imageDataUrl;
    } else if (this.block.mediaType === 'Image Slider') {
      // Ensure slides array exists and is initialized
      if (!this.isolatedMediaData.slides) {
        this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
      }
      // Ensure the current slide index is valid
      if (!this.isolatedMediaData.slides[this.currentSlideIndex]) {
        // Pad the array with empty slides if necessary
        while (this.isolatedMediaData.slides.length <= this.currentSlideIndex) {
          this.isolatedMediaData.slides.push({ image: '', title: '', subtitle: '' });
        }
      }
      // Update only the current slide's image
      this.isolatedMediaData.slides[this.currentSlideIndex] = {
        ...this.isolatedMediaData.slides[this.currentSlideIndex],
        image: imageDataUrl
      };
      // Sync block.slides with isolatedMediaData.slides
      this.block.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
    }

    this.contentChange.emit();
    this._snackBar.open('Image uploaded successfully!', 'Dismiss', { duration: 2000 });
  };

  reader.readAsDataURL(file);
  this.closeUploadModal();
}

uploadImageUrl(): void {
  if (this.imageUrlInput) {
    if (this.block.mediaType === 'image') {
      this.isolatedMediaData.image = this.imageUrlInput;
      this.block.singleImageUrl = this.imageUrlInput;
    } else if (this.block.mediaType === 'Image Slider') {
      if (!this.isolatedMediaData.slides || this.isolatedMediaData.slides.length === 0) {
        this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
        this.currentSlideIndex = 0;
      }
      this.isolatedMediaData.slides[this.currentSlideIndex].image = this.imageUrlInput;
      this.block.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
    }

    this.onContentChange();
    this.closeUploadModal();
    this._snackBar.open('Image from URL added successfully!', 'Dismiss', { duration: 2000 });
  } else {
    this._snackBar.open('Please enter a valid image URL.', 'Dismiss', { duration: 2000 });
  }
}
  // Slide navigation methods
  nextSlide(): void {
    if (this.block.slides && this.currentSlideIndex < this.block.slides.length - 1) {
      this.currentSlideIndex++;
    }
  }

  previousSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
  }

  goToSlide(index: number): void {
    if (this.block.slides && index >= 0 && index < this.block.slides.length) {
      this.currentSlideIndex = index;
    }
  }

  // Media selection and management methods
 onMediaSelectionChange(): void {
  const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
  if (selected) {
    this.block.mediaName = selected.name;
    this.block.mediaType = selected.type;
    this.block.content = selected.content;
    // FIXED: Use helper method instead of direct mediaUrl assignment
    this.setMediaUrlFromSelected(selected);
    this.block.slides = selected.slides ? JSON.parse(JSON.stringify(selected.slides)) : [];

    if (selected.type === 'image' && (!this.block.slides || this.block.slides.length === 0)) {
      this.block.slides = [{ image: selected.url || '', title: '', subtitle: '' }];
    }

    this.initializeIsolatedStorageFromBlock();
  } else {
    this.block.mediaName = '';
    this.block.mediaType = 'text';
    this.block.content = '';
    // FIXED: Clear all media URLs instead of just mediaUrl
    this.clearAllMediaUrls();
    this.block.slides = [];
  }
  this.blockUpdated.emit(this.block);
  this.showNewMediaForm = false;
  this.showButtonTypeCard = false;
  this.closeCommonIntegrationCard();
}

 private clearAllMediaUrls(): void {
  this.block.singleImageUrl = '';
  this.block.videoUrl = '';
  this.block.audioUrl = '';
  this.block.fileUrl = '';
}

// FIXED: Updated createNewMediaBlock method
createNewMediaBlock(): void {
  this.showNewMediaForm = true;
  this.block.mediaId = undefined;
  this.block.mediaName = this.generateDefaultMediaBlockName();
  this.block.mediaType = 'text';
  this.block.content = '';
  // FIXED: Clear all media URLs instead of just mediaUrl
  this.clearAllMediaUrls();
  this.blockUpdated.emit(this.block);
  this.showButtonTypeCard = false;
  this.closeCommonIntegrationCard();
  this._snackBar.open('Ready to create a new media block. Fill in the details.', 'Dismiss', { duration: 3000 });
}

  editExistingMediaBlock(): void {
    if (this.block.mediaId) {
      this.showNewMediaForm = true;
      this.onContentChange();
      this.showButtonTypeCard = false;
      this.closeCommonIntegrationCard();
      this._snackBar.open(`Editing Media Block: ${this.getMediaName(this.block.mediaId)}`, 'Dismiss', { duration: 3000 });
    } else {
      this._snackBar.open('Please select a media block to edit first.', 'Dismiss', { duration: 3000 });
    }
  }

  saveMedia(): void {
  const currentMediaType = this.block.mediaType || 'text';

  if (!this.block.mediaName || this.block.mediaName.trim() === '') {
    this._snackBar.open('Media Name cannot be empty.', 'Dismiss', { duration: 3000 });
    return;
  }

  switch (currentMediaType) {
    case 'text':
      if (!this.block.content || this.block.content.trim() === '') {
        this._snackBar.open('Text content cannot be empty for text media type.', 'Dismiss', { duration: 3000 });
        return;
      }
      this.block.slides = [];
      // FIXED: Clear all media URLs instead of just mediaUrl
      this.clearAllMediaUrls();
      break;

   case 'image':
      if (!this.block.singleImageUrl || this.block.singleImageUrl.trim() === '') {
        this._snackBar.open('Please provide an image for the image block.', 'Dismiss', { duration: 3000 });
        return;
      }
      break;

    case 'Image Slider':
      if (!this.block.slides || this.block.slides.length === 0) {
        this._snackBar.open('Please add at least one slide for the Image Slider.', 'Dismiss', { duration: 3000 });
        return;
      }
      for (const slide of this.block.slides) {
        if (!slide.image || slide.image.trim() === '') {
          this._snackBar.open('Each slide must have an image.', 'Dismiss', { duration: 3000 });
          return;
        }
        if (!slide.title || slide.title.trim() === '') {
          this._snackBar.open('Each slide must have a title.', 'Dismiss', { duration: 3000 });
          return;
        }
      }
      this.block.content = '';
      // Clear single image URL for slider
      this.block.singleImageUrl = '';
      break;

    case 'video':
      if (!this.block.videoUrl || this.block.videoUrl.trim() === '') {
        this._snackBar.open('Please provide a URL for video media.', 'Dismiss', { duration: 3000 });
        return;
      }
      this.block.slides = [];
      this.block.content = '';
      break;

    case 'audio':
      if (!this.block.audioUrl || this.block.audioUrl.trim() === '') {
        this._snackBar.open('Please provide a URL for audio media.', 'Dismiss', { duration: 3000 });
        return;
      }
      this.block.slides = [];
      this.block.content = '';
      break;

    case 'file':
      if (!this.block.fileUrl || this.block.fileUrl.trim() === '') {
        this._snackBar.open('Please provide a URL for file media.', 'Dismiss', { duration: 3000 });
        return;
      }
      this.block.slides = [];
      this.block.content = '';
      break;
  }

  const isNewMedia = !this.block.mediaId;
  if (isNewMedia) {
    const newMediaId = 'media-' + Date.now().toString();
    const newMedia: AvailableMedia = {
      id: newMediaId,
      name: this.block.mediaName,
      type: currentMediaType,
      content: this.block.content ?? '',
      // FIXED: Use appropriate URL property based on media type
      url: this.getUrlForMediaType(currentMediaType),
      slides: this.block.slides ? JSON.parse(JSON.stringify(this.block.slides)) : []
    };
    this.availableMedia.push(newMedia);
    this.block.mediaId = newMediaId;
    this.mediaUpdated.emit(this.availableMedia); // Emit updated media list
    this._snackBar.open('New Media Block content saved and linked!', 'Dismiss', { duration: 3000 });
  } else {
    const existingMediaIndex = this.availableMedia.findIndex(m => m.id === this.block.mediaId);
    if (existingMediaIndex > -1) {
      this.availableMedia[existingMediaIndex] = {
        ...this.availableMedia[existingMediaIndex],
        name: this.block.mediaName,
        type: currentMediaType,
        content: this.block.content ?? '',
        // FIXED: Use appropriate URL property based on media type
        url: this.getUrlForMediaType(currentMediaType),
        slides: this.block.slides ? JSON.parse(JSON.stringify(this.block.slides)) : []
      };
      this.mediaUpdated.emit(this.availableMedia); // Emit updated media list
      this._snackBar.open('Media Block content updated!', 'Dismiss', { duration: 3000 });
    } else {
      this._snackBar.open('Error: Could not find existing media to update.', 'Dismiss', { duration: 3000 });
    }
  }

  this.showNewMediaForm = false;
  this.showButtonTypeCard = false;
  this.closeCommonIntegrationCard();
  this.blockUpdated.emit(this.block);
}

// FIXED: Helper method to get URL for media type
private getUrlForMediaType(mediaType: string): string {
  switch (mediaType) {
    case 'video':
      return this.block.videoUrl || '';
    case 'audio':
      return this.block.audioUrl || '';
    case 'file':
      return this.block.fileUrl || '';
    case 'image':
      return this.block.singleImageUrl || '';
    default:
      return '';
  }
}

// FIXED: Updated cancelMediaEdit method
cancelMediaEdit(): void {
  if (!this.block.mediaId) {
    this.block.mediaId = undefined;
    this.block.mediaName = '';
    this.block.mediaType = 'text';
    this.block.content = '';
    // FIXED: Clear all media URLs instead of just mediaUrl
    this.clearAllMediaUrls();
  } else {
    const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
    if (selected) {
      this.block.mediaName = selected.name;
      this.block.mediaType = selected.type;
      this.block.content = selected.content;
      // FIXED: Use helper method to set appropriate URL
      this.setMediaUrlFromSelected(selected);
    }
  }
  this.showNewMediaForm = false;
  this.showButtonTypeCard = false;
  this.closeCommonIntegrationCard();
  this.blockUpdated.emit(this.block);
  this._snackBar.open('Media editing/creation canceled.', 'Dismiss', { duration: 2000 });
}

  getMediaName(mediaId: string | undefined): string {
    const media = this.availableMedia.find(m => m.id === mediaId);
    return media ? media.name : 'No media selected';
  }

  onSelectBlock(): void {
    this.selectBlock.emit(this.block);
    this.showButtonTypeCard = false;
    this.closeCommonIntegrationCard();
  }

  onStartConnection(event: MouseEvent): void {
    this.startConnection.emit(event);
  }

  onEndConnection(event: MouseEvent): void {
    this.endConnection.emit(event);
  }

  onRemoveBlock(): void {
    this.removeBlock.emit(this.block.id);
  }

  onDuplicateBlock(): void {
    this.duplicateBlock.emit(this.block);
  }

  onEditBlock(): void {
    this.editBlock.emit(this.block);
  }

  closeSidebar(): void {
    this.closeSidebarEvent.emit();
    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.closeCommonIntegrationCard();
  }

  private generateDefaultMediaBlockName(): string {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    return `Media Block ${randomNumber}`;
  }

  onAddNewButton(): void {
    this.showButtonTypeCard = true;
    this.closeCommonIntegrationCard();
    this._snackBar.open('Select a button type.', 'Dismiss', { duration: 2000 });
  }

  closeButtonTypeCard(): void {
    this.showButtonTypeCard = false;
  }
  
  openCommonCardForNewButton(type: ButtonIntegrationType): void {
    this.showButtonTypeCard = false;
    this.showCommonIntegrationCard = true;
    this.currentButtonIndex = -1;
    this.currentButton = {
      title: '',
      type: type as any
    };

    if (type === 'text_message') {
      this.currentButton.textMessage = '';
    } else if (type === 'media_block') {
      this.currentButton.linkedMediaId = undefined;
    } else if (type === 'website_url') {
      this.currentButton.url = '';
    } else if (type === 'direct_call') {
      this.currentButton.phoneNumber = '';
    } else if (type === 'start_story') {
      this.currentButton.storyId = undefined;
    } else if (type === 'rss_feed') {
      this.currentButton.rssUrl = '';
      this.currentButton.rssItemCount = 5;
      this.currentButton.rssButtonText = '';
    } else if (type === 'json_api') {
      this.currentButton.apiEndpoint = '';
      this.currentButton.requestType = 'GET';
      this.currentButton.apiHeaders = [{ key: '', value: '' }];
    } else if (type === 'human_help') {
      this.currentButton.messageAfterAction = '';
      this.currentButton.emailForNotification = '';
      this.currentButton.stopBotForUser = false;
    } else if (type === 'conversational_form') {
      this.currentButton.formId = '';
      this.currentButton.showInline = false;
    }
  }

  saveCommonIntegrationCard(): void {
    if (!this.currentButton.title || this.currentButton.title.trim() === '') {
      this._snackBar.open('Button Title cannot be empty.', 'Dismiss', { duration: 3000 });
      return;
    }

    switch (this.currentButton.type) {
      case 'text_message':
        if (!this.currentButton.textMessage || this.currentButton.textMessage.trim() === '') {
          this._snackBar.open('Bot says message cannot be empty.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'media_block':
        if (!this.currentButton.linkedMediaId) {
          this._snackBar.open('Please select a media block.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'website_url':
        if (!this.currentButton.url || this.currentButton.url.trim() === '') {
          this._snackBar.open('Website URL cannot be empty.', 'Dismiss', { duration: 3000 });
          return;
        }
        if (!this.currentButton.url.startsWith('http://') && !this.currentButton.url.startsWith('https://')) {
          this._snackBar.open('Please enter a valid URL (e.g., https://example.com).', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'direct_call':
        if (!this.currentButton.phoneNumber || this.currentButton.phoneNumber.trim() === '') {
          this._snackBar.open('Phone number cannot be empty.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'start_story':
        if (!this.currentButton.storyId) {
          this._snackBar.open('Please select a story to initiate.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'rss_feed':
        if (!this.currentButton.rssUrl || this.currentButton.rssUrl.trim() === '') {
          this._snackBar.open('RSS Feed URL cannot be empty.', 'Dismiss', { duration: 3000 });
          return;
        }
        if (!this.currentButton.rssItemCount || this.currentButton.rssItemCount <= 0) {
          this._snackBar.open('Number of items must be a positive number.', 'Dismiss', { duration: 3000 });
          return;
        }
        if (!this.currentButton.rssButtonText || this.currentButton.rssButtonText.trim() === '') {
          this._snackBar.open('Button Text cannot be empty.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'json_api':
        if (!this.currentButton.apiEndpoint || this.currentButton.apiEndpoint.trim() === '') {
          this._snackBar.open('API Endpoint cannot be empty.', 'Dismiss', { duration: 3000 });
          return;
        }
        if (!this.currentButton.requestType) {
          this._snackBar.open('Please select an API request type.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'human_help':
        if (!this.currentButton.messageAfterAction || this.currentButton.messageAfterAction.trim() === '') {
          this._snackBar.open('Message After Help Action cannot be empty.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'conversational_form':
        if (!this.currentButton.formId) {
          this._snackBar.open('Please select a conversational form.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      default:
        this._snackBar.open('Unknown button type. Cannot save.', 'Dismiss', { duration: 3000 });
        return;
    }

    if (this.currentButtonIndex === -1) {
      this.block.buttons?.push(this.currentButton as Button);
      this._snackBar.open('New button added successfully!', 'Dismiss', { duration: 3000 });
    } else {
      if (this.block.buttons && this.block.buttons[this.currentButtonIndex]) {
        this.block.buttons[this.currentButtonIndex] = this.currentButton as Button;
        this._snackBar.open('Button updated successfully!', 'Dismiss', { duration: 3000 });
      }
    }

    this.closeCommonIntegrationCard();
    this.blockUpdated.emit(this.block);
  }

  closeCommonIntegrationCard(): void {
    this.showCommonIntegrationCard = false;
    this.currentButtonIndex = -1;
    this.currentButton = {};
  }

  // Info modal methods
  openInfoModal(inputType: 'buttonTitle' | 'buttonTextMessage'): void {
    this.showInfoModal = true;
    this.activeInputElementType = inputType;
    this.searchTerm = '';
    this.resetFilteredAttributes();
  }

  closeInfoModal(): void {
    this.showInfoModal = false;
    this.searchTerm = '';
    this.resetFilteredAttributes();
    this.activeInputElementType = null;
  }

  selectVariable(variable: string): void {
    let targetTextarea: HTMLTextAreaElement | null = null;
    let targetModelProperty: 'title' | 'textMessage' | null = null;

    if (this.activeInputElementType === 'buttonTitle' && this.buttonTitleAutosizeElement) {
      targetTextarea = this.buttonTitleAutosizeElement.nativeElement;
      targetModelProperty = 'title';
    } else if (this.activeInputElementType === 'buttonTextMessage' && this.buttonTextMessageAutosizeElement) {
      targetTextarea = this.buttonTextMessageAutosizeElement.nativeElement;
      targetModelProperty = 'textMessage';
    }

    if (targetTextarea && targetModelProperty) {
      const start = targetTextarea.selectionStart;
      const end = targetTextarea.selectionEnd;
      const currentValue = targetTextarea.value;
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);

      if (targetModelProperty === 'title') {
        this.currentButton.title = newValue;
      } else if (targetModelProperty === 'textMessage') {
        this.currentButton.textMessage = newValue;
      }
      
      targetTextarea.value = newValue;
      targetTextarea.selectionStart = targetTextarea.selectionEnd = start + variable.length;
      this.onContentChange();
    }
    this.closeInfoModal();
  }

  filterVariables(): void {
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredGeneralAttributes = this.generalAttributes.filter(attr =>
      attr.toLowerCase().includes(searchLower)
    );
    this.filteredFormAttributes = this.formAttributes.filter(attr =>
      attr.toLowerCase().includes(searchLower)
    );
    this.filteredUserAttributes = this.userAttributes.filter(attr =>
      attr.toLowerCase().includes(searchLower)
    );
  }

  resetFilteredAttributes(): void {
    this.filteredGeneralAttributes = [...this.generalAttributes];
    this.filteredFormAttributes = [...this.formAttributes];
    this.filteredUserAttributes = [...this.userAttributes];
  }
}