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
import { ChatbotBlock, AvailableMedia, Button, AvailableStory, ImageSlide } from '../models/chatbot-block.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MediaService } from '../shared/services/media.service';

type ButtonIntegrationType = 'text_message' | 'media_block' | 'website_url' | 'direct_call' | 'start_story' | 'rss_feed' | 'json_api' | 'human_help' | 'conversational_form' | null;

export interface ApiHeader {
  key: string;
  value: string;
}

export interface ApiBlock {
  apiEndpoint?: string;
  requestType?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiHeaders?: ApiHeader[];
}

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
  selector: 'app-media-block-page',
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
    CdkTextareaAutosize
  ],
  templateUrl: './media-block-page.component.html',
  styleUrls: ['./media-block-page.component.scss'],
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
export class MediaBlockPageComponent implements OnInit {
  @Input() availableMedia: AvailableMedia[] = [];
  @Input() availableStories: AvailableStory[] = [];

  @Output() mediaUpdated = new EventEmitter<AvailableMedia[]>();
  @Output() mediaDeleted = new EventEmitter<string>();
  @Output() mediaDuplicated = new EventEmitter<AvailableMedia>();

  // Properties for editing media blocks
  selectedMedia: AvailableMedia | null = null;
  showEditSidebar: boolean = false;
  showNewMediaForm: boolean = false;
  showButtonTypeCard: boolean = false;
  showCommonIntegrationCard: boolean = false;
  
  // Media type data isolation
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

  // Upload modal properties
  activeMediaType: 'image' | 'video' | 'file' | null = null;
  showUploadModal: boolean = false;
  uploadedFileName: string = '';
  imageUrlInput: string = '';
  videoUrlInput: string = '';

  // Button management properties
  currentButton: Partial<Button> = {};
  currentButtonIndex: number = -1;

  // Info modal properties
  showInfoModal: boolean = false;
  private activeInputElementType: 'buttonTitle' | 'buttonTextMessage' | null = null;
  searchTerm: string = '';

  // Slide management
  currentSlideIndex: number = 0;

  // ViewChild references
  @ViewChild('fileUploadInput') fileUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('audioUploadInput') audioUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoUploadInput') videoUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imageUploadInput') imageUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('buttonTitleAutosize', { read: ElementRef }) buttonTitleAutosizeElement!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('buttonTextMessageAutosize', { read: ElementRef }) buttonTextMessageAutosizeElement!: ElementRef<HTMLTextAreaElement>;

  // Variable attributes for info modal
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

  constructor(private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.resetFilteredAttributes();
  }

  // Create new media block
  createNewMediaBlock(): void {
    const newMedia: AvailableMedia = {
      id: 'media-' + Date.now().toString(),
      name: this.generateDefaultMediaBlockName(),
      type: 'text',
      content: '',
      url: '',
      slides: [],
      buttons: []
    };
    
    this.selectedMedia = newMedia;
    this.showEditSidebar = true;
    this.showNewMediaForm = true;
    this.initializeIsolatedStorageFromMedia(newMedia);
  }

  // Select media block for editing
  selectMediaForEditing(media: AvailableMedia): void {
    this.selectedMedia = { ...media };
    this.showEditSidebar = true;
    this.showNewMediaForm = true;
    this.initializeIsolatedStorageFromMedia(this.selectedMedia);
    this.currentSlideIndex = 0;
  }

  // Duplicate media block
  duplicateMediaBlock(media: AvailableMedia): void {
    const duplicatedMedia: AvailableMedia = {
      ...media,
      id: 'media-' + Date.now().toString(),
      name: media.name + ' (Copy)',
      slides: media.slides ? JSON.parse(JSON.stringify(media.slides)) : [],
      buttons: media.buttons ? JSON.parse(JSON.stringify(media.buttons)) : []
    };
    
    this.availableMedia.push(duplicatedMedia);
    this.mediaUpdated.emit(this.availableMedia);
    this._snackBar.open('Media block duplicated successfully!', 'Dismiss', { duration: 2000 });
  }

  // Delete media block
  deleteMediaBlock(mediaId: string): void {
    const mediaIndex = this.availableMedia.findIndex(m => m.id === mediaId);
    if (mediaIndex > -1) {
      const deletedMedia = this.availableMedia[mediaIndex];
      this.availableMedia.splice(mediaIndex, 1);
      this.mediaDeleted.emit(mediaId);
      this.mediaUpdated.emit(this.availableMedia);
      this._snackBar.open(`"${deletedMedia.name}" deleted successfully!`, 'Dismiss', { duration: 2000 });
    }
  }

  // Get media type display name
  getMediaTypeDisplayName(type: string): string {
    switch (type) {
      case 'text': return 'Text Message';
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'file': return 'File';
      case 'Image Slider': return 'Slider';
      default: return type;
    }
  }

  // Get media type badge class
  getMediaTypeBadgeClass(type: string): string {
    switch (type) {
      case 'text': return 'bg-blue-500';
      case 'image': return 'bg-green-500';
      case 'video': return 'bg-purple-500';
      case 'audio': return 'bg-orange-500';
      case 'file': return 'bg-red-500';
      case 'Image Slider': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  }

  // Initialize isolated storage from media
  private initializeIsolatedStorageFromMedia(media: AvailableMedia): void {
    switch (media.type) {
      case 'text':
        this.isolatedMediaData.text = media.content || '';
        break;
      case 'image':
        this.isolatedMediaData.image = media.url || '';
        break;
      case 'Image Slider':
        this.isolatedMediaData.slides = media.slides
          ? JSON.parse(JSON.stringify(media.slides))
          : [{ image: '', title: '', subtitle: '' }];
        break;
      case 'video':
        this.isolatedMediaData.video = media.url || '';
        break;
      case 'audio':
        this.isolatedMediaData.audio = media.url || '';
        break;
      case 'file':
        this.isolatedMediaData.file = media.url || '';
        break;
    }
  }

  // Save current data to isolated storage
  saveCurrentDataToIsolatedStorage(mediaType: string): void {
    if (!this.selectedMedia) return;

    switch (mediaType) {
      case 'text':
        this.isolatedMediaData.text = this.selectedMedia.content || '';
        break;
      case 'image':
        this.isolatedMediaData.image = this.selectedMedia.url || '';
        break;
      case 'Image Slider':
        this.isolatedMediaData.slides = this.selectedMedia.slides
          ? JSON.parse(JSON.stringify(this.selectedMedia.slides))
          : [{ image: '', title: '', subtitle: '' }];
        break;
      case 'video':
        this.isolatedMediaData.video = this.selectedMedia.url || '';
        break;
      case 'audio':
        this.isolatedMediaData.audio = this.selectedMedia.url || '';
        break;
      case 'file':
        this.isolatedMediaData.file = this.selectedMedia.url || '';
        break;
    }
  }

  // Load data from isolated storage
  loadDataFromIsolatedStorage(mediaType: string): void {
    if (!this.selectedMedia) return;

    // Reset all media properties
    this.selectedMedia.content = '';
    this.selectedMedia.url = '';
    this.selectedMedia.slides = [];

    switch (mediaType) {
      case 'text':
        this.selectedMedia.content = this.isolatedMediaData.text || '';
        break;
      case 'image':
        this.selectedMedia.url = this.isolatedMediaData.image || '';
        break;
      case 'Image Slider':
        this.selectedMedia.slides = this.isolatedMediaData.slides && this.isolatedMediaData.slides.length > 0
          ? JSON.parse(JSON.stringify(this.isolatedMediaData.slides))
          : [{ image: '', title: '', subtitle: '' }];
        this.currentSlideIndex = Math.min(this.currentSlideIndex, (this.selectedMedia.slides?.length || 1) - 1);
        break;
      case 'video':
        this.selectedMedia.url = this.isolatedMediaData.video || '';
        break;
      case 'audio':
        this.selectedMedia.url = this.isolatedMediaData.audio || '';
        break;
      case 'file':
        this.selectedMedia.url = this.isolatedMediaData.file || '';
        break;
    }
  }

  // Handle media type change
  onMediaTypeChange(newMediaType: 'image' | 'video' | 'file' | 'text' | 'Image Slider' | 'audio'): void {
    if (!this.selectedMedia) return;

    const previousMediaType = this.selectedMedia.type || 'text';

    // Save current data to isolated storage
    this.saveCurrentDataToIsolatedStorage(previousMediaType);

    // Set new media type
    this.selectedMedia.type = newMediaType;

    // Load data for new media type
    this.loadDataFromIsolatedStorage(newMediaType);

    // Initialize slides for Image Slider
    if (newMediaType === 'Image Slider') {
      if (!this.isolatedMediaData.slides || this.isolatedMediaData.slides.length === 0) {
        this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
      }
      this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      this.currentSlideIndex = 0;
    }
  }

  // Save media block
  saveMedia(): void {
    if (!this.selectedMedia) return;

    const currentMediaType = this.selectedMedia.type || 'text';

    if (!this.selectedMedia.name || this.selectedMedia.name.trim() === '') {
      this._snackBar.open('Media Name cannot be empty.', 'Dismiss', { duration: 3000 });
      return;
    }

    // Validation based on media type
    switch (currentMediaType) {
      case 'text':
        if (!this.selectedMedia.content || this.selectedMedia.content.trim() === '') {
          this._snackBar.open('Text content cannot be empty for text media type.', 'Dismiss', { duration: 3000 });
          return;
        }
        this.selectedMedia.slides = [];
        this.selectedMedia.url = '';
        break;

      case 'image':
        if (!this.selectedMedia.url || this.selectedMedia.url.trim() === '') {
          this._snackBar.open('Please provide an image for the image block.', 'Dismiss', { duration: 3000 });
          return;
        }
        break;

      case 'Image Slider':
        if (!this.selectedMedia.slides || this.selectedMedia.slides.length === 0) {
          this._snackBar.open('Please add at least one slide for the Image Slider.', 'Dismiss', { duration: 3000 });
          return;
        }
        for (const slide of this.selectedMedia.slides) {
          if (!slide.image || slide.image.trim() === '') {
            this._snackBar.open('Each slide must have an image.', 'Dismiss', { duration: 3000 });
            return;
          }
          if (!slide.title || slide.title.trim() === '') {
            this._snackBar.open('Each slide must have a title.', 'Dismiss', { duration: 3000 });
            return;
          }
        }
        this.selectedMedia.content = '';
        this.selectedMedia.url = '';
        break;

      case 'video':
      case 'audio':
      case 'file':
        if (!this.selectedMedia.url || this.selectedMedia.url.trim() === '') {
          this._snackBar.open(`Please provide a URL for ${currentMediaType} media.`, 'Dismiss', { duration: 3000 });
          return;
        }
        this.selectedMedia.slides = [];
        this.selectedMedia.content = '';
        break;
    }

    // Check if this is a new media block or existing one
    const existingIndex = this.availableMedia.findIndex(m => m.id === this.selectedMedia!.id);
    
    if (existingIndex > -1) {
      // Update existing media
      this.availableMedia[existingIndex] = { ...this.selectedMedia };
      this._snackBar.open('Media Block updated successfully!', 'Dismiss', { duration: 3000 });
    } else {
      // Add new media
      this.availableMedia.push({ ...this.selectedMedia });
      this._snackBar.open('New Media Block created successfully!', 'Dismiss', { duration: 3000 });
    }

    this.mediaUpdated.emit(this.availableMedia);
    this.closeSidebar();
  }

  // Close sidebar
  closeSidebar(): void {
    this.showEditSidebar = false;
    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.showCommonIntegrationCard = false;
    this.selectedMedia = null;
    this.currentSlideIndex = 0;
  }

  // Generate default media block name
  private generateDefaultMediaBlockName(): string {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    return `Media Block ${randomNumber}`;
  }

  // Upload modal methods
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

  // File upload methods
  triggerFileUpload(): void {
    this.fileUploadInput.nativeElement.click();
  }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file && this.selectedMedia) {
      const fileUrl = URL.createObjectURL(file);
      this.uploadedFileName = file.name;
      this.selectedMedia.url = fileUrl;
      this._snackBar.open('File uploaded successfully!', 'Dismiss', { duration: 2000 });
      event.target.value = null;
    }
  }

  // Audio upload methods
  triggerAudioUpload(): void {
    this.audioUploadInput.nativeElement.click();
  }

  onAudioUpload(event: any): void {
    const file = event.target.files[0];
    if (file && this.selectedMedia) {
      const audioUrl = URL.createObjectURL(file);
      this.selectedMedia.url = audioUrl;
      this._snackBar.open('Audio uploaded successfully!', 'Dismiss', { duration: 2000 });
      event.target.value = null;
    }
  }

  // Video upload methods
  onVideoUpload(event: any): void {
    const file = event.target.files[0];
    if (file && this.selectedMedia) {
      this.uploadedFileName = file.name;
      const videoUrl = URL.createObjectURL(file);
      this.selectedMedia.url = videoUrl;
      this.closeUploadModal();
      this._snackBar.open('Video uploaded successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  uploadVideoUrl(): void {
    if (this.videoUrlInput && this.selectedMedia) {
      this.selectedMedia.url = this.videoUrlInput;
      this.closeUploadModal();
      this._snackBar.open('Video URL added successfully!', 'Dismiss', { duration: 2000 });
    } else {
      this._snackBar.open('Please enter a valid video URL.', 'Dismiss', { duration: 2000 });
    }
  }

  // Image upload methods
  triggerImageUpload(): void {
    this.imageUploadInput.nativeElement.click();
  }

  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.selectedMedia) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageDataUrl = e.target.result as string;

      if (this.selectedMedia!.type === 'image') {
        this.isolatedMediaData.image = imageDataUrl;
        this.selectedMedia!.url = imageDataUrl;
      } else if (this.selectedMedia!.type === 'Image Slider') {
        if (!this.isolatedMediaData.slides) {
          this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
        }
        if (!this.isolatedMediaData.slides[this.currentSlideIndex]) {
          while (this.isolatedMediaData.slides.length <= this.currentSlideIndex) {
            this.isolatedMediaData.slides.push({ image: '', title: '', subtitle: '' });
          }
        }
        this.isolatedMediaData.slides[this.currentSlideIndex] = {
          ...this.isolatedMediaData.slides[this.currentSlideIndex],
          image: imageDataUrl
        };
        this.selectedMedia!.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      }

      this._snackBar.open('Image uploaded successfully!', 'Dismiss', { duration: 2000 });
    };

    reader.readAsDataURL(file);
    this.closeUploadModal();
  }

  uploadImageUrl(): void {
    if (this.imageUrlInput && this.selectedMedia) {
      if (this.selectedMedia.type === 'image') {
        this.isolatedMediaData.image = this.imageUrlInput;
        this.selectedMedia.url = this.imageUrlInput;
      } else if (this.selectedMedia.type === 'Image Slider') {
        if (!this.isolatedMediaData.slides || this.isolatedMediaData.slides.length === 0) {
          this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
          this.currentSlideIndex = 0;
        }
        this.isolatedMediaData.slides[this.currentSlideIndex].image = this.imageUrlInput;
        this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      }

      this.closeUploadModal();
      this._snackBar.open('Image from URL added successfully!', 'Dismiss', { duration: 2000 });
    } else {
      this._snackBar.open('Please enter a valid image URL.', 'Dismiss', { duration: 2000 });
    }
  }

  // Remove media methods
  removeMedia(): void {
    if (!this.selectedMedia) return;

    if (this.selectedMedia.type === 'image') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.image = '';
    } else if (this.selectedMedia.type === 'Image Slider') {
      this.removeCurrentSlide();
    } else if (this.selectedMedia.type === 'video') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.video = '';
    } else if (this.selectedMedia.type === 'audio') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.audio = '';
    } else if (this.selectedMedia.type === 'file') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.file = '';
    } else if (this.selectedMedia.type === 'text') {
      this.selectedMedia.content = '';
      this.isolatedMediaData.text = '';
    }
  }

  removeVideoMedia(): void {
    if (this.selectedMedia && this.selectedMedia.type === 'video') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.video = '';
      this._snackBar.open('Video removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  removeAudioMedia(): void {
    if (this.selectedMedia && this.selectedMedia.type === 'audio') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.audio = '';
      this._snackBar.open('Audio removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  removeFile(): void {
    if (this.selectedMedia && this.selectedMedia.type === 'file') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.file = '';
      this.uploadedFileName = '';
      this._snackBar.open('File removed.', 'Dismiss', { duration: 2000 });
    }
  }

  // Slide management methods
  addNewSlide(): void {
    if (this.selectedMedia && this.selectedMedia.type === 'Image Slider') {
      if (!this.isolatedMediaData.slides) {
        this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
      }
      this.isolatedMediaData.slides.push({ image: '', title: '', subtitle: '' });
      this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      this.currentSlideIndex = this.isolatedMediaData.slides.length - 1;
      this._snackBar.open('New slide added.', 'Dismiss', { duration: 2000 });
    }
  }

  removeCurrentSlide(): void {
    if (this.selectedMedia && this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && this.isolatedMediaData.slides.length > 1) {
      this.isolatedMediaData.slides.splice(this.currentSlideIndex, 1);
      if (this.currentSlideIndex >= this.isolatedMediaData.slides.length) {
        this.currentSlideIndex = this.isolatedMediaData.slides.length - 1;
      }
      this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      this._snackBar.open('Slide removed successfully!', 'Dismiss', { duration: 2000 });
    } else if (this.selectedMedia && this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && this.isolatedMediaData.slides.length === 1) {
      this.isolatedMediaData.slides[0] = { image: '', title: '', subtitle: '' };
      this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      this._snackBar.open('Slide content reset.', 'Dismiss', { duration: 2000 });
    }
  }

  removeCurrentImage(index: number): void {
    if (this.selectedMedia && this.selectedMedia.slides && this.selectedMedia.slides[index]) {
      if (this.selectedMedia.type === 'image') {
        this.selectedMedia.url = '';
      } else if (this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides) {
        this.isolatedMediaData.slides[index].image = '';
        this.selectedMedia.slides[index].image = '';
      }
      this._snackBar.open('Image removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  // Slide navigation methods
  nextSlide(): void {
    if (this.selectedMedia && this.selectedMedia.slides && this.currentSlideIndex < this.selectedMedia.slides.length - 1) {
      this.currentSlideIndex++;
    }
  }

  previousSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
  }

  goToSlide(index: number): void {
    if (this.selectedMedia && this.selectedMedia.slides && index >= 0 && index < this.selectedMedia.slides.length) {
      this.currentSlideIndex = index;
    }
  }

  // Button methods
  onAddNewButton(): void {
    this.showButtonTypeCard = true;
    this.showCommonIntegrationCard = false;
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

    // Initialize button properties based on type
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

  onEditButtonClick(button: Button, index: number): void {
    this.showButtonTypeCard = false;
    this.showCommonIntegrationCard = true;
    this.currentButtonIndex = index;
    this.currentButton = JSON.parse(JSON.stringify(button));
    this._snackBar.open(`Editing ${this.currentButton.type?.replace('_', ' ')}.`, 'Dismiss', { duration: 2000 });
  }

  onDeleteButtonClick(index: number): void {
    if (this.selectedMedia && this.selectedMedia.buttons) {
      this.selectedMedia.buttons.splice(index, 1);
      this._snackBar.open('Button removed.', 'Dismiss', { duration: 2000 });
    }
  }

  saveCommonIntegrationCard(): void {
    if (!this.currentButton.title || this.currentButton.title.trim() === '') {
      this._snackBar.open('Button Title cannot be empty.', 'Dismiss', { duration: 3000 });
      return;
    }

    // Validation based on button type
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

    if (!this.selectedMedia) return;

    // Initialize buttons array if it doesn't exist
    if (!this.selectedMedia.buttons) {
      this.selectedMedia.buttons = [];
    }

    if (this.currentButtonIndex === -1) {
      // Add new button
      this.selectedMedia.buttons.push(this.currentButton as Button);
      this._snackBar.open('New button added successfully!', 'Dismiss', { duration: 3000 });
    } else {
      // Update existing button
      if (this.selectedMedia.buttons[this.currentButtonIndex]) {
        this.selectedMedia.buttons[this.currentButtonIndex] = this.currentButton as Button;
        this._snackBar.open('Button updated successfully!', 'Dismiss', { duration: 3000 });
      }
    }

    this.closeCommonIntegrationCard();
  }

  closeCommonIntegrationCard(): void {
    this.showCommonIntegrationCard = false;
    this.currentButtonIndex = -1;
    this.currentButton = {};
  }

  // API header methods for JSON API buttons
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

  // Helper methods
  hasMediaContent(): boolean {
  if (!this.selectedMedia) {
    return false;
  }
  // This uses optional chaining to safely access 'url' and 'slides'.
  // The '!!' operator then converts the result to a strict boolean.
  return !!this.selectedMedia.url || !!this.selectedMedia.slides?.length;
}

  get hasContent(): boolean {
  if (!this.selectedMedia) {
    return false;
  }
  // We use optional chaining and the '!!' operator to ensure each check
  // returns a strict boolean value before combining them.
  return !!this.selectedMedia.content ||
    !!this.selectedMedia.url ||
    !!this.selectedMedia.slides?.length ||
    !!this.selectedMedia.buttons?.length;
}

  getButtonTypeTags(buttons: Button[] | undefined): string[] {
    if (!buttons || buttons.length === 0) return [];
    
    const uniqueTypes = [...new Set(buttons.map(button => {
      switch (button.type) {
        case 'text_message': return 'text';
        case 'media_block': return 'media';
        case 'website_url': return 'url';
        case 'direct_call': return 'call';
        case 'start_story': return 'story';
        case 'rss_feed': return 'rss';
        case 'json_api': return 'api';
        case 'human_help': return 'help';
        case 'conversational_form': return 'form';
        default: return 'button';
      }
    }))];
    
    return uniqueTypes.slice(0, 2); // Show max 2 tags to avoid clutter
  }

  getFormattedDate(dateString?: string): string {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    return new Date(dateString).toLocaleDateString('en-GB');
  }
}