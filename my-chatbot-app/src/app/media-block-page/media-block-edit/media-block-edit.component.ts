import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChatbotBlock, AvailableMedia, Button, AvailableStory, ImageSlide } from '../../models/chatbot-block.model';
import { MediaService } from '../../shared/services/media.service';

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

@Component({
  selector: 'app-media-block-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    CdkTextareaAutosize,
    RouterModule
  ],
  templateUrl: './media-block-edit.component.html',
  styleUrls: ['./media-block-edit.component.scss'],
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
export class MediaBlockEditComponent implements OnInit {
  selectedMedia: AvailableMedia = {
    id: '',
    name: '',
    type: 'text',
    content: '',
    url: '',
    slides: [],
    buttons: []
  };
  availableMedia: AvailableMedia[] = [];
  availableStories: AvailableStory[] = [];

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

  showButtonTypeCard: boolean = false;
  showCommonIntegrationCard: boolean = false;

  constructor(
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private mediaService: MediaService
  ) { }

  ngOnInit(): void {
    this.resetFilteredAttributes();
    this.availableMedia = this.mediaService.getMediaBlocks();
    this.route.paramMap.subscribe(params => {
      const mediaId = params.get('id');
      if (mediaId && mediaId !== 'new') {
        // Load existing media block
        const media = this.availableMedia.find(m => m.id === mediaId);
        if (media) {
          this.selectedMedia = JSON.parse(JSON.stringify(media)); // Deep copy
          this.initializeIsolatedStorageFromMedia(this.selectedMedia);
        } else {
          this._snackBar.open('Media block not found.', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/media-blocks']);
        }
      } else {
        this.createNewMediaBlock();
      }
    });
  }

  // Create new media block
  createNewMediaBlock(): void {
    this.selectedMedia = {
      id: 'media-' + Date.now().toString(),
      name: this.generateDefaultMediaBlockName(),
      type: 'text',
      content: '',
      url: '',
      slides: [],
      buttons: [],
      createdAt: new Date().toISOString()
    };
    this.initializeIsolatedStorageFromMedia(this.selectedMedia);
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
    const previousMediaType = this.selectedMedia.type || 'text';
    this.saveCurrentDataToIsolatedStorage(previousMediaType);
    this.selectedMedia.type = newMediaType;
    this.loadDataFromIsolatedStorage(newMediaType);

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
    const currentMediaType = this.selectedMedia.type || 'text';

    if (!this.selectedMedia.name || this.selectedMedia.name.trim() === '') {
      this._snackBar.open('Media Name cannot be empty.', 'Dismiss', { duration: 3000 });
      return;
    }

    // Sync isolatedMediaData with selectedMedia before saving
    this.saveCurrentDataToIsolatedStorage(currentMediaType);

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
        this.selectedMedia.content = '';
        this.selectedMedia.slides = [];
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

    // Ensure createdAt is set
    if (!this.selectedMedia.createdAt) {
      this.selectedMedia.createdAt = new Date().toISOString();
    }

    // Update media block via service
    this.mediaService.updateMediaBlock(this.selectedMedia);
    this._snackBar.open(
      this.route.snapshot.paramMap.get('id') === 'new' ? 'New Media Block created successfully!' : 'Media Block updated successfully!',
      'Dismiss',
      { duration: 3000 }
    );

    this.router.navigate(['/media-blocks']);
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
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      this.uploadedFileName = file.name;
      this.selectedMedia.url = fileUrl;
      this.isolatedMediaData.file = fileUrl;
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
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      this.selectedMedia.url = audioUrl;
      this.isolatedMediaData.audio = audioUrl;
      this._snackBar.open('Audio uploaded successfully!', 'Dismiss', { duration: 2000 });
      event.target.value = null;
    }
  }

  // Video upload methods
  onVideoUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name;
      const videoUrl = URL.createObjectURL(file);
      this.selectedMedia.url = videoUrl;
      this.isolatedMediaData.video = videoUrl;
      this.closeUploadModal();
      this._snackBar.open('Video uploaded successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  uploadVideoUrl(): void {
    if (this.videoUrlInput) {
      this.selectedMedia.url = this.videoUrlInput;
      this.isolatedMediaData.video = this.videoUrlInput;
      this.closeUploadModal();
      this._snackBar.open('Video URL added successfully!', 'Dismiss', { duration: 2000 });
    } else {
      this._snackBar.open('Please enter a valid video URL.', 'Dismiss', { duration: 2000 });
    }
  }

  // Image upload methods
  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageDataUrl = e.target.result as string;

      if (this.selectedMedia.type === 'image') {
        this.isolatedMediaData.image = imageDataUrl;
        this.selectedMedia.url = imageDataUrl;
      } else if (this.selectedMedia.type === 'Image Slider') {
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
        this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      }

      this._snackBar.open('Image uploaded successfully!', 'Dismiss', { duration: 2000 });
    };

    reader.readAsDataURL(file);
    this.closeUploadModal();
  }

  uploadImageUrl(): void {
    if (this.imageUrlInput) {
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
    if (this.selectedMedia.type === 'video') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.video = '';
      this._snackBar.open('Video removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  removeAudioMedia(): void {
    if (this.selectedMedia.type === 'audio') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.audio = '';
      this._snackBar.open('Audio removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  removeFile(): void {
    if (this.selectedMedia.type === 'file') {
      this.selectedMedia.url = '';
      this.isolatedMediaData.file = '';
      this.uploadedFileName = '';
      this._snackBar.open('File removed.', 'Dismiss', { duration: 2000 });
    }
  }

  // Slide management methods
  addNewSlide(): void {
    if (this.selectedMedia.type === 'Image Slider') {
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
    if (this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && this.isolatedMediaData.slides.length > 1) {
      this.isolatedMediaData.slides.splice(this.currentSlideIndex, 1);
      if (this.currentSlideIndex >= this.isolatedMediaData.slides.length) {
        this.currentSlideIndex = this.isolatedMediaData.slides.length - 1;
      }
      this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      this._snackBar.open('Slide removed successfully!', 'Dismiss', { duration: 2000 });
    } else if (this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && this.isolatedMediaData.slides.length === 1) {
      this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
      this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      this.currentSlideIndex = 0;
      this._snackBar.open('Last slide reset.', 'Dismiss', { duration: 2000 });
    }
  }

  removeCurrentImage(slideIndex: number): void {
    if (this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && this.isolatedMediaData.slides[slideIndex]) {
      this.isolatedMediaData.slides[slideIndex].image = '';
      this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
      this._snackBar.open('Image removed from slide.', 'Dismiss', { duration: 2000 });
    }
  }

  previousSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
  }

  nextSlide(): void {
    if (this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && this.currentSlideIndex < this.isolatedMediaData.slides.length - 1) {
      this.currentSlideIndex++;
    }
  }

  goToSlide(index: number): void {
    if (this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && index >= 0 && index < this.isolatedMediaData.slides.length) {
      this.currentSlideIndex = index;
    }
  }

  // Button management methods
  onAddNewButton(): void {
    this.showButtonTypeCard = true;
  }

  onEditButtonClick(button: Button, index: number): void {
    this.currentButton = JSON.parse(JSON.stringify(button)); // Deep copy
    this.currentButtonIndex = index;
    this.showCommonIntegrationCard = true;
  }

  onDeleteButtonClick(index: number): void {
    if (this.selectedMedia.buttons) {
      this.selectedMedia.buttons.splice(index, 1);
      this._snackBar.open('Button deleted successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  openCommonCardForNewButton(type: ButtonIntegrationType): void {
    this.currentButton = { type };
    this.currentButtonIndex = -1;
    this.showButtonTypeCard = false;
    this.showCommonIntegrationCard = true;
  }

  closeButtonTypeCard(): void {
    this.showButtonTypeCard = false;
  }

  closeCommonIntegrationCard(): void {
    this.showCommonIntegrationCard = false;
    this.currentButton = {};
    this.currentButtonIndex = -1;
  }

  saveCommonIntegrationCard(): void {
    if (!this.currentButton.title || this.currentButton.title.trim() === '') {
      this._snackBar.open('Button title is required.', 'Dismiss', { duration: 2000 });
      return;
    }

    switch (this.currentButton.type) {
      case 'text_message':
        if (!this.currentButton.textMessage || this.currentButton.textMessage.trim() === '') {
          this._snackBar.open('Text message content is required.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = this.currentButton.textMessage;
        break;
      case 'media_block':
        if (!this.currentButton.linkedMediaId) {
          this._snackBar.open('Please select a media block.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = this.currentButton.linkedMediaId;
        break;
      case 'website_url':
        if (!this.currentButton.url || this.currentButton.url.trim() === '') {
          this._snackBar.open('Website URL is required.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = this.currentButton.url;
        break;
      case 'direct_call':
        if (!this.currentButton.phoneNumber || this.currentButton.phoneNumber.trim() === '') {
          this._snackBar.open('Phone number is required.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = this.currentButton.phoneNumber;
        break;
      case 'start_story':
        if (!this.currentButton.storyId) {
          this._snackBar.open('Please select a story.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = this.currentButton.storyId;
        break;
      case 'rss_feed':
        if (!this.currentButton.rssUrl || !this.currentButton.rssItemCount || !this.currentButton.rssButtonText) {
          this._snackBar.open('All RSS fields are required.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = JSON.stringify({
          rssUrl: this.currentButton.rssUrl,
          rssItemCount: this.currentButton.rssItemCount,
          rssButtonText: this.currentButton.rssButtonText
        });
        break;
      case 'json_api':
        if (!this.currentButton.apiEndpoint || !this.currentButton.requestType) {
          this._snackBar.open('API endpoint and request type are required.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = JSON.stringify({
          apiEndpoint: this.currentButton.apiEndpoint,
          requestType: this.currentButton.requestType,
          apiHeaders: this.currentButton.apiHeaders
        });
        break;
      case 'human_help':
        if (!this.currentButton.messageAfterAction) {
          this._snackBar.open('Message after action is required.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = JSON.stringify({
          messageAfterAction: this.currentButton.messageAfterAction,
          emailForNotification: this.currentButton.emailForNotification,
          stopBotForUser: this.currentButton.stopBotForUser
        });
        break;
      case 'conversational_form':
        if (!this.currentButton.formId) {
          this._snackBar.open('Please select a form.', 'Dismiss', { duration: 2000 });
          return;
        }
        this.currentButton.value = JSON.stringify({
          formId: this.currentButton.formId,
          showInline: this.currentButton.showInline
        });
        break;
    }

    if (!this.selectedMedia.buttons) {
      this.selectedMedia.buttons = [];
    }

    if (this.currentButtonIndex === -1) {
      this.selectedMedia.buttons.push(JSON.parse(JSON.stringify(this.currentButton)) as Button);
      this._snackBar.open('Button added successfully!', 'Dismiss', { duration: 2000 });
    } else {
      this.selectedMedia.buttons[this.currentButtonIndex] = JSON.parse(JSON.stringify(this.currentButton)) as Button;
      this._snackBar.open('Button updated successfully!', 'Dismiss', { duration: 2000 });
    }

    this.closeCommonIntegrationCard();
  }

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
    this.activeInputElementType = inputType;
    this.showInfoModal = true;
    this.searchTerm = '';
    this.filterVariables();
  }

  closeInfoModal(): void {
    this.showInfoModal = false;
    this.searchTerm = '';
    this.resetFilteredAttributes();
  }

  filterVariables(): void {
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredGeneralAttributes = this.generalAttributes.filter(attr => attr.toLowerCase().includes(searchLower));
    this.filteredFormAttributes = this.formAttributes.filter(attr => attr.toLowerCase().includes(searchLower));
    this.filteredUserAttributes = this.userAttributes.filter(attr => attr.toLowerCase().includes(searchLower));
  }

  resetFilteredAttributes(): void {
    this.filteredGeneralAttributes = [...this.generalAttributes];
    this.filteredFormAttributes = [...this.formAttributes];
    this.filteredUserAttributes = [...this.userAttributes];
  }

  selectVariable(variable: string): void {
    if (this.activeInputElementType === 'buttonTitle') {
      this.currentButton.title = (this.currentButton.title || '') + variable;
      this.buttonTitleAutosizeElement?.nativeElement.focus();
    } else if (this.activeInputElementType === 'buttonTextMessage') {
      this.currentButton.textMessage = (this.currentButton.textMessage || '') + variable;
      this.buttonTextMessageAutosizeElement?.nativeElement.focus();
    }
    this.closeInfoModal();
  }
}