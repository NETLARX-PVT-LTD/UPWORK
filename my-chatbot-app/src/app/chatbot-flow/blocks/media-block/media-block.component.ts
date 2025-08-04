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
import { ChatbotBlock, AvailableMedia, Button, AvailableStory,ImageSlide } from '../../../models/chatbot-block.model';
import { MatTabsModule } from '@angular/material/tabs'; 

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
    CdkTextareaAutosize
  ],
  templateUrl: './media-block.component.html',
  styleUrls: ['./media-block.component.scss'],
   // Add the animations metadata property here
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

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();
  @Output() closeSidebarEvent = new EventEmitter<void>();
  @Output() contentChange = new EventEmitter<void>();

  showNewMediaForm: boolean = false;
  showButtonTypeCard: boolean = false;
  showCommonIntegrationCard: boolean = false;
  videoUrlInput: string = '';
  
  // NEW: Property to control the visibility of the upload modal
  activeMediaType: 'image' | 'video' | 'file' | null = null;
  showUploadModal: boolean = false;
  uploadedFileName: string = '';
  imageUrlInput: string = '';
  
  // NEW: Temporary properties to manage the button being added or edited
  currentButton: Partial<Button> = {};
  currentButtonIndex: number = -1; // -1 for a new button, otherwise the index of the button being edited

  // --- NEW PROPERTIES FOR INFO MODAL ---
  showInfoModal: boolean = false;
  private activeInputElementType: 'buttonTitle' | 'buttonTextMessage' | null = null;
  searchTerm: string = '';

  // Add this property for tracking current slide
  currentSlideIndex: number = 0;

  // Add these missing properties for data isolation
  private singleImageData: { image: string; title: string; subtitle: string } = { image: '', title: '', subtitle: '' };
  private imageSliderData: ImageSlide[] = [{ image: '', title: '', subtitle: '' }];

   // New ViewChild for the file input
  @ViewChild('fileUploadInput') fileUploadInput!: ElementRef<HTMLInputElement>;
  // New ViewChild for the audio file input
  @ViewChild('audioUploadInput') audioUploadInput!: ElementRef<HTMLInputElement>;

  // New ViewChild for the video file input
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
  // --- END NEW PROPERTIES FOR INFO MODAL ---

  
  
  // Add this line to declare the activeTab property
  activeTab: 'upload' | 'url' = 'upload';

  constructor(private _snackBar: MatSnackBar) { }

  get hasContent(): boolean {
    return !!this.block.content ||
           !!this.block.mediaUrl ||
           (this.block.buttons?.length ?? 0) > 0;
  }


   // New method to trigger the hidden file input
  triggerFileUpload(): void {
    this.fileUploadInput.nativeElement.click();
  }

  // New method to handle the file upload
  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Create a temporary URL and store the file name
      this.block.mediaUrl = URL.createObjectURL(file);
      this.uploadedFileName = file.name;
      
      this.onContentChange();
      
      this._snackBar.open('File uploaded successfully!', 'Dismiss', { duration: 2000 });
      
      // Reset the input to allow uploading the same file again if needed
      event.target.value = null;
    }
  }

  // New method to remove the uploaded file
  removeFile(): void {
    this.block.mediaUrl = '';
    this.uploadedFileName = '';
    this.onContentChange();
    this._snackBar.open('File removed.', 'Dismiss', { duration: 2000 });
  }
  // New method to trigger the hidden file input
  triggerAudioUpload(): void {
    this.audioUploadInput.nativeElement.click();
  }

  // New method to handle the audio file upload
  onAudioUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // You can get the file name and URL here
      const audioUrl = URL.createObjectURL(file);
      
      // Update the block with the new audio URL
      this.block.mediaUrl = audioUrl;
      this.onContentChange(); // or emit a blockUpdated event
      
      this._snackBar.open('Audio uploaded successfully!', 'Dismiss', { duration: 2000 });
      
      // Reset the input to allow uploading the same file again if needed
      event.target.value = null;
    }
  }
  removeMedia(): void {
    if (this.block.mediaType === 'image') {
      this.block.mediaUrl = ''; // Clear the media URL
      this.contentChange.emit();
    }
  }

  // Method to open the upload modal
  openUploadModal(mediaType: 'image' | 'video' | 'file'): void {
    // Set the type of media we are about to upload
    this.activeMediaType = mediaType;
    
    // Reset previous state and open the modal
    this.showUploadModal = true;
    this.uploadedFileName = '';
    this.imageUrlInput = '';
    this.videoUrlInput = '';
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.activeMediaType = null;
  }

  // method for image upload
  openImageUploadModal(): void {
    // Assuming 'imageUploadInput' is a reference to the single image file input
    const fileInput = document.getElementById('imageUploadInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // NEW: Method to handle video file upload
  onVideoUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name;
      const videoUrl = URL.createObjectURL(file);
      this.block.mediaUrl = videoUrl;
      this.onContentChange();
      this.closeUploadModal();
      this._snackBar.open('Video uploaded successfully!', 'Dismiss', { duration: 2000 });
    }
  }

  // NEW: Method to handle video URL input
  uploadVideoUrl(): void {
    if (this.videoUrlInput) {
      this.block.mediaUrl = this.videoUrlInput;
      this.onContentChange();
      this.closeUploadModal();
      this._snackBar.open('Video URL added successfully!', 'Dismiss', { duration: 2000 });
    } else {
      this._snackBar.open('Please enter a valid video URL.', 'Dismiss', { duration: 2000 });
    }
  }
  
  // --- API HEADER METHODS ---
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

  // --- UPDATED BUTTON METHODS ---

  // REWRITTEN: This method now opens the card for editing a specific button
  onEditButtonClick(button: Button, index: number): void {
    this.showButtonTypeCard = false;
    this.showCommonIntegrationCard = true;
    this.currentButtonIndex = index;
    // Create a deep copy to prevent direct mutation of the original object
    this.currentButton = JSON.parse(JSON.stringify(button));
    this._snackBar.open(`Editing ${this.currentButton.type?.replace('_', ' ')}.`, 'Dismiss', { duration: 2000 });
  }

  // REWRITTEN: This method now deletes a specific button by its index
  onDeleteButtonClick(index: number): void {
    if (this.block.buttons) {
      this.block.buttons.splice(index, 1);
      this.blockUpdated.emit(this.block);
      this._snackBar.open('Button removed.', 'Dismiss', { duration: 2000 });
    }
  }

  ngOnInit(): void {
    
    // Initialize the 'slides' array if it doesn't exist
    if (this.block.slides === undefined || this.block.slides.length === 0) {
      this.block.slides = [{ image: '', title: '', subtitle: '' }]; // Start with one empty slide
    }
  
    // Initialize current slide index
    this.currentSlideIndex = 0;
    
    // Initialize the buttons array if it doesn't exist
    if (!this.block.buttons) {
      this.block.buttons = [];
    }

    if (!this.block.mediaType) {
      this.block.mediaType = 'text';
    }
    if (this.block.content === undefined) {
      this.block.content = '';
    }
    if (this.block.mediaUrl === undefined) {
      this.block.mediaUrl = '';
    }
    if (this.block.mediaName === undefined) {
      this.block.mediaName = '';
    }

    if (this.isSelected && this.block.mediaId) {
      const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
      if (selected) {
        this.block.mediaName = selected.name;
        this.block.mediaType = selected.type;
        this.block.content = selected.content;
        this.block.mediaUrl = selected.url;
      }
    }

    this.resetFilteredAttributes();
  }

  //  onContentChange(): void {
  //   // Update stored data based on current media type
  //   if (this.block.mediaType === 'image') {
  //     this.updateSingleImageData();
  //   } else if (this.block.mediaType === 'Image Slider') {
  //     this.updateImageSliderData();
  //   }
    
  //   this.blockUpdated.emit(this.block);
  // }

  // 7. Add methods for slide management that update stored data
  addNewSlide(): void {
    if (this.block.mediaType === 'Image Slider') {
      if (!this.block.slides) {
        this.block.slides = [];
      }
      this.block.slides.push({ image: '', title: '', subtitle: '' });
      this.currentSlideIndex = this.block.slides.length - 1;
      this.updateImageSliderData(); // Update stored data
      this.blockUpdated.emit(this.block);
      this._snackBar.open('New slide added.', 'Dismiss', { duration: 2000 });
    }
  }

  removeCurrentSlide(): void {
    if (this.block.mediaType === 'Image Slider' && this.block.slides && this.block.slides.length > 1) {
      this.block.slides.splice(this.currentSlideIndex, 1);
      if (this.currentSlideIndex >= this.block.slides.length) {
        this.currentSlideIndex = this.block.slides.length - 1;
      }
      this.updateImageSliderData(); // Update stored data
      this.blockUpdated.emit(this.block);
      this._snackBar.open('Slide removed successfully!', 'Dismiss', { duration: 2000 });
    } else if (this.block.mediaType === 'Image Slider' && this.block.slides && this.block.slides.length === 1) {
      this.block.slides[0] = { image: '', title: '', subtitle: '' };
      this.updateImageSliderData(); // Update stored data
      this.blockUpdated.emit(this.block);
      this._snackBar.open('Slide content reset.', 'Dismiss', { duration: 2000 });
    }
  }

  removeCurrentImage(index: number): void {
    if (this.block.slides && this.block.slides[index]) {
      this.block.slides[index].image = '';
      
      if (this.block.mediaType === 'image') {
        this.singleImageData.image = '';
        this.block.mediaUrl = '';
      } else if (this.block.mediaType === 'Image Slider') {
        this.updateImageSliderData();
      }
      
      this.blockUpdated.emit(this.block);
      this._snackBar.open('Image removed successfully!', 'Dismiss', { duration: 2000 });
    }
  }
  
  // Method to trigger the hidden file input
  triggerImageUpload(): void {
    this.imageUploadInput.nativeElement.click();
  }

  // Inside your MediaBlockComponent class
// Replace your existing onImageUpload method with this fixed version
onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageDataUrl = e.target.result as string;

      if (this.block.mediaType === 'image') {
        // For single image type - store in singleImageData and block.slides[0]
        this.singleImageData.image = imageDataUrl;
        this.block.slides = [{ ...this.singleImageData }];
        this.block.mediaUrl = imageDataUrl; // For backwards compatibility
        this.currentSlideIndex = 0;
        
      } else if (this.block.mediaType === 'Image Slider') {
        // For image slider type - store in imageSliderData and block.slides
        if (!this.imageSliderData || this.imageSliderData.length === 0) {
          this.imageSliderData = [{ image: '', title: '', subtitle: '' }];
          this.currentSlideIndex = 0;
        }
        this.imageSliderData[this.currentSlideIndex].image = imageDataUrl;
        this.block.slides = [...this.imageSliderData]; // Create new array
        this.block.mediaUrl = ''; // Clear mediaUrl for slider
      }
      
      this.contentChange.emit();
    };

    reader.readAsDataURL(file);
    this.closeUploadModal();
    this._snackBar.open('Image uploaded successfully!', 'Dismiss', { duration: 2000 });
  }

// Also update the uploadImageUrl method to fix the same issue
uploadImageUrl(): void {
    if (this.imageUrlInput) {
      if (this.block.mediaType === 'image') {
        // For single image type
        this.singleImageData.image = this.imageUrlInput;
        this.block.slides = [{ ...this.singleImageData }];
        this.block.mediaUrl = this.imageUrlInput;
        this.currentSlideIndex = 0;
        
      } else if (this.block.mediaType === 'Image Slider') {
        // For image slider type
        if (!this.imageSliderData || this.imageSliderData.length === 0) {
          this.imageSliderData = [{ image: '', title: '', subtitle: '' }];
          this.currentSlideIndex = 0;
        }
        this.imageSliderData[this.currentSlideIndex].image = this.imageUrlInput;
        this.block.slides = [...this.imageSliderData]; // Create new array
        this.block.mediaUrl = ''; // Clear mediaUrl for slider
      }
      
      this.onContentChange();
      this.closeUploadModal();
      this._snackBar.open('Image from URL added successfully!', 'Dismiss', { duration: 2000 });
    } else {
      this._snackBar.open('Please enter a valid image URL.', 'Dismiss', { duration: 2000 });
    }
  }

  
removeVideoMedia(): void {
  if (this.block.mediaType === 'video') {
    this.block.mediaUrl = ''; // Clear the video URL
    this.contentChange.emit();
    this._snackBar.open('Video removed successfully!', 'Dismiss', { duration: 2000 });
  }
}
  // Refactor `nextSlide`, `previousSlide`, and `goToSlide` to use the new slides array
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

  // --- EXISTING METHODS (no major changes needed) ---

  onMediaSelectionChange(): void {
    const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
    if (selected) {
      this.block.mediaName = selected.name;
      this.block.mediaType = selected.type;
      this.block.content = selected.content;
      this.block.mediaUrl = selected.url;
      this.block.slides = selected.slides ? JSON.parse(JSON.stringify(selected.slides)) : []; // Deep copy slides to avoid mutation
      
      // NEW: If the selected media is an image type, but slides are empty,
      // ensure there is at least one slide.
      if (selected.type === 'image' && (!this.block.slides || this.block.slides.length === 0)) {
          this.block.slides = [{ image: selected.url || '', title: '', subtitle: '' }];
      }
    } else {
      this.block.mediaName = '';
      this.block.mediaType = 'text';
      this.block.content = '';
      this.block.mediaUrl = '';
      this.block.slides = []; // Clear slides when no media is selected
    }
    this.blockUpdated.emit(this.block);
    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.closeCommonIntegrationCard();
  }

  createNewMediaBlock(): void {
    this.showNewMediaForm = true;
    this.block.mediaId = undefined;
    this.block.mediaName = this.generateDefaultMediaBlockName();
    this.block.mediaType = 'text';
    this.block.content = '';
    this.block.mediaUrl = '';
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

    // 1. Always validate the Media Name
    if (!this.block.mediaName || this.block.mediaName.trim() === '') {
      this._snackBar.open('Media Name cannot be empty.', 'Dismiss', { duration: 3000 });
      return;
    }

    // 2. Validate content and clean up unused data based on the selected Media Type
    switch (currentMediaType) {
      case 'text':
        if (!this.block.content || this.block.content.trim() === '') {
          this._snackBar.open('Text content cannot be empty for text media type.', 'Dismiss', { duration: 3000 });
          return;
        }
        // Clear other properties
        this.block.slides = [];
        this.block.mediaUrl = '';
        break;

      case 'image':
        // This is for a single image. It must have exactly one slide.
        if (!this.block.slides || this.block.slides.length === 0 || !this.block.slides[0].image) {
          this._snackBar.open('Please provide an image for the image block.', 'Dismiss', { duration: 3000 });
          return;
        }
        // --- FIX: Ensure only the first slide is kept for a single image ---
        this.block.slides = [this.block.slides[0]];
        // Clear unused properties
        this.block.mediaUrl = '';
        this.block.content = '';
        break;

      case 'Image Slider':
        // This is for a carousel.
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
        // Clear unused properties
        this.block.content = '';
        this.block.mediaUrl = '';
        break;

      case 'video':
      case 'audio':
      case 'file':
        if (!this.block.mediaUrl || this.block.mediaUrl.trim() === '') {
          this._snackBar.open(`Please provide a URL for ${currentMediaType} media.`, 'Dismiss', { duration: 3000 });
          return;
        }
        // Clear unused properties
        this.block.slides = [];
        this.block.content = '';
        break;
    }

    // 3. The rest of the saving logic remains the same
    const isNewMedia = !this.block.mediaId;
    if (isNewMedia) {
      const newMediaId = 'media-' + Date.now().toString();
      const newMedia: AvailableMedia = {
        id: newMediaId,
        name: this.block.mediaName,
        type: currentMediaType,
        content: this.block.content ?? '',
        url: this.block.mediaUrl ?? '',
        slides: this.block.slides ? JSON.parse(JSON.stringify(this.block.slides)) : [] // Deep copy to avoid reference sharing
      };
      this.availableMedia.push(newMedia);
      this.block.mediaId = newMediaId;
      this._snackBar.open('New Media Block content saved and linked!', 'Dismiss', { duration: 3000 });
    } else {
      const existingMediaIndex = this.availableMedia.findIndex(m => m.id === this.block.mediaId);
      if (existingMediaIndex > -1) {
        this.availableMedia[existingMediaIndex] = {
          ...this.availableMedia[existingMediaIndex],
          name: this.block.mediaName,
          type: currentMediaType,
          content: this.block.content ?? '',
          url: this.block.mediaUrl ?? '',
          slides: this.block.slides ? JSON.parse(JSON.stringify(this.block.slides)) : [] // Deep copy to avoid reference sharing
        };
        this._snackBar.open('Media Block content updated!', 'Dismiss', { duration: 3000 });
      } else {
        this._snackBar.open('Error: Could not find existing media to update.', 'Dismiss', { duration: 3000 });
      }
    }

    // 4. Final state changes
    this.showNewMediaForm = false;
    this.showButtonTypeCard = false;
    this.closeCommonIntegrationCard();
    this.blockUpdated.emit(this.block);
  }

  // Updated method to handle media type changes and clear data properly
 // Replace your existing onContentChange method with this updated version
onContentChange(): void {
  // Only initialize data if it doesn't exist, don't overwrite existing data
  if (this.block.mediaType === 'text') {
    if (!this.block.slides || this.block.slides.length > 0) {
      this.block.slides = [];
    }
    this.block.mediaUrl = '';
  } else if (this.block.mediaType === 'image') {
    this.block.content = '';
    // Keep mediaUrl for single image (for backwards compatibility)
    // Only initialize if slides don't exist at all
    if (!this.block.slides) {
      this.block.slides = [{ image: '', title: '', subtitle: '' }];
      this.currentSlideIndex = 0;
    }
  } else if (this.block.mediaType === 'Image Slider') {
    this.block.content = '';
    this.block.mediaUrl = ''; // Clear mediaUrl for image slider to avoid cross-contamination
    // Only initialize if slides don't exist at all
    if (!this.block.slides) {
      this.block.slides = [{ image: '', title: '', subtitle: '' }];
      this.currentSlideIndex = 0;
    }
  } else if (this.block.mediaType === 'video' || this.block.mediaType === 'audio' || this.block.mediaType === 'file') {
    if (!this.block.slides || this.block.slides.length > 0) {
      this.block.slides = [];
    }
    this.block.content = '';
    // Keep mediaUrl for video/audio/file types
  }
  
  this.blockUpdated.emit(this.block);
}

  // Add a new method to handle media type switching with proper data isolation
onMediaTypeChange(newMediaType: 'image' | 'video' | 'file' | 'text' | 'Image Slider' | 'audio'): void {
    const previousMediaType = this.block.mediaType;
    
    // Save current data before switching
   if (previousMediaType === 'image' && this.block.slides && this.block.slides[0]) {
        const slide = this.block.slides[0];
        // Provide a default empty string if any property is undefined
        this.singleImageData = { 
            image: slide.image || '', 
            title: slide.title || '', 
            subtitle: slide.subtitle || '' 
        };
    }
    
    // Set new media type
    this.block.mediaType = newMediaType;
    
    // Initialize data for new media type
    if (newMediaType === 'image') {
      // Load single image data
      this.block.slides = [{ ...this.singleImageData }];
      this.block.mediaUrl = this.singleImageData.image;
      this.block.content = '';
      this.currentSlideIndex = 0;
      
    } else if (newMediaType === 'Image Slider') {
      // Load image slider data
      this.block.slides = JSON.parse(JSON.stringify(this.imageSliderData));
      this.block.mediaUrl = '';
      this.block.content = '';
      this.currentSlideIndex = 0;
      
    } else if (newMediaType === 'text') {
      this.block.slides = [];
      this.block.mediaUrl = '';
      this.block.content = '';
      
    } else if (newMediaType === 'video' || newMediaType === 'audio' || newMediaType === 'file') {
      this.block.slides = [];
      this.block.content = '';
      // Keep existing mediaUrl if it's appropriate for this media type
    }
    
    this.onContentChange();
  }

  updateSingleImageData(): void {
  if (this.block.mediaType === 'image' && this.block.slides && this.block.slides[0]) {
    const slide = this.block.slides[0];
    // Provide a default empty string if any property is undefined
    this.singleImageData = { 
        image: slide.image || '', 
        title: slide.title || '', 
        subtitle: slide.subtitle || '' 
    };
  }
}

  updateImageSliderData(): void {
    if (this.block.mediaType === 'Image Slider' && this.block.slides) {
      this.imageSliderData = JSON.parse(JSON.stringify(this.block.slides));
    }
  }

  cancelMediaEdit(): void {
    if (!this.block.mediaId) {
      this.block.mediaId = undefined;
      this.block.mediaName = '';
      this.block.mediaType = 'text';
      this.block.content = '';
      this.block.mediaUrl = '';
    } else {
      const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
      if (selected) {
        this.block.mediaName = selected.name;
        this.block.mediaType = selected.type;
        this.block.content = selected.content;
        this.block.mediaUrl = selected.url;
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

  // REWRITTEN: This method now just opens the card to select a button type
  onAddNewButton(): void {
    this.showButtonTypeCard = true;
    this.closeCommonIntegrationCard();
    this._snackBar.open('Select a button type.', 'Dismiss', { duration: 2000 });
  }

  closeButtonTypeCard(): void {
    this.showButtonTypeCard = false;
  }
  
  // NEW: A single method to handle opening the common card for any new button type
  openCommonCardForNewButton(type: ButtonIntegrationType): void {
    this.showButtonTypeCard = false;
    this.showCommonIntegrationCard = true;
    this.currentButtonIndex = -1; // -1 indicates a new button
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
      this.currentButton.rssItemCount = 5; // Set a default value
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
      this.currentButton.formId = ''; // Initialize with an empty string or a default form ID
      this.currentButton.showInline = false;
    }
  }

  // REWRITTEN: Common method to save a new or existing button
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
        // You may add a more specific phone number validation regex here
        break;

      // Add validation for Start Story
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
        // You may want to add URL validation here.
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
        // You may want to add validation for the headers here as well
        break;

      case 'human_help':
        if (!this.currentButton.messageAfterAction || this.currentButton.messageAfterAction.trim() === '') {
          this._snackBar.open('Message After Help Action cannot be empty.', 'Dismiss', { duration: 3000 });
          return;
        }
        // You can add an optional email validation if needed
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

  // REWRITTEN: Common method to close any integration card and reset state
  closeCommonIntegrationCard(): void {
    this.showCommonIntegrationCard = false;
    this.currentButtonIndex = -1;
    this.currentButton = {};
  }

  // --- UPDATED INFO MODAL METHODS ---
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