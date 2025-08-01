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

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() startConnection = new EventEmitter<MouseEvent>();
  @Output() endConnection = new EventEmitter<MouseEvent>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();
  @Output() closeSidebarEvent = new EventEmitter<void>();

  showNewMediaForm: boolean = false;
  showButtonTypeCard: boolean = false;
  showCommonIntegrationCard: boolean = false;
 // NEW: Property to control the visibility of the upload modal
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

// Add ViewChild for file input
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

  public availableStories: AvailableStory[] = [
    { id: 'story1', name: '(hello,hi,hey),' },
    { id: 'story2', name: '(Hii),' },
    { id: 'story3', name: 'Report Incident' },
    { id: 'story4', name: 'Process for setting up shop' },
    // Add more stories as needed
  ];
// Add this line to declare the activeTab property
  activeTab: 'upload' | 'url' = 'upload';


  constructor(private _snackBar: MatSnackBar) { }

  get hasContent(): boolean {
    return !!this.block.content ||
           !!this.block.mediaUrl ||
           (this.block.buttons?.length ?? 0) > 0;
  }

  // Method to open the upload modal
  openUploadModal(): void {
    this.showUploadModal = true;
  }

  // method for image upload
  openImageUploadModal(): void {
    this.showUploadModal = true;
  }

  // Method to close the upload modal
  closeUploadModal(): void {
    this.showUploadModal = false;
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

   // NEW: Method to add a new slide to the carousel
  addNewSlide(): void {
    if (!this.block.slides) {
      this.block.slides = [];
    }
    this.block.slides.push({ image: '', title: '', subtitle: '' });
    this.currentSlideIndex = this.block.slides.length - 1; // Switch to the new slide
    this.onContentChange();
    this._snackBar.open('New slide added.', 'Dismiss', { duration: 2000 });
  }

  // NEW: Method to remove the current slide
  removeCurrentSlide(): void {
    if (this.block.slides && this.block.slides.length > 1) {
      this.block.slides.splice(this.currentSlideIndex, 1);
      // Adjust current slide index
      if (this.currentSlideIndex >= this.block.slides.length) {
        this.currentSlideIndex = this.block.slides.length - 1;
      }
      this.onContentChange();
      this._snackBar.open('Slide removed successfully!', 'Dismiss', { duration: 2000 });
    } else {
      // If only one slide is left, just reset its content
      if (this.block.slides && this.block.slides.length === 1) {
        this.block.slides[0] = { image: '', title: '', subtitle: '' };
        this.onContentChange();
        this._snackBar.open('Slide content reset.', 'Dismiss', { duration: 2000 });
      }
    }
  }

// Add this method to your MediaBlockComponent class
removeCurrentImage(index: number): void {
  if (this.block.slides && this.block.slides[index]) {
    this.block.slides[index].image = ''; // Set the image property to an empty string
    this.onContentChange(); // Notify that the block has been updated
    this._snackBar.open('Image removed successfully!', 'Dismiss', { duration: 2000 });
  }
}
  // Method to trigger the hidden file input
  triggerImageUpload(): void {
    this.imageUploadInput.nativeElement.click();
  }

 onImageUpload(event: any): void {
  const file = event.target.files[0];
  if (file) {
    // Capture the file name
    this.uploadedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      if (this.block.slides && this.block.slides.length > 0) {
        this.block.slides[this.currentSlideIndex].image = reader.result as string;
        this.onContentChange();
      }
    };
    reader.readAsDataURL(file);

    // Close the modal after a successful upload
    this.closeUploadModal();
  }
}

uploadImageUrl(): void {
  if (this.imageUrlInput) {
    if (this.block.slides && this.block.slides.length > 0) {
      this.block.slides[this.currentSlideIndex].image = this.imageUrlInput;
      this.onContentChange();
      this.closeUploadModal();
      this._snackBar.open('Image from URL added successfully!', 'Dismiss', { duration: 2000 });
    }
  } else {
    this._snackBar.open('Please enter a valid image URL.', 'Dismiss', { duration: 2000 });
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

// Method to remove current image
// removeCurrentImage(): void {
//   if (this.block.slideImages && this.block.slideImages.length > 0) {
//     // Remove the current image
//     this.block.slideImages.splice(this.currentSlideIndex, 1);
    
//     // Adjust current slide index
//     if (this.currentSlideIndex >= this.block.slideImages.length) {
//       this.currentSlideIndex = Math.max(0, this.block.slideImages.length - 1);
//     }
    
//     this.onContentChange();
//     this._snackBar.open('Image removed successfully!', 'Dismiss', { duration: 2000 });
//   }
// }

// Method to remove all images
// removeAllImages(): void {
//   if (this.block.slideImages) {
//     this.block.slideImages = [];
//     this.currentSlideIndex = 0;
//     this.onContentChange();
//     this._snackBar.open('All images removed!', 'Dismiss', { duration: 2000 });
//   }
// }
  // --- EXISTING METHODS (no major changes needed) ---

  onMediaSelectionChange(): void {
    const selected = this.availableMedia.find(m => m.id === this.block.mediaId);
    if (selected) {
      this.block.mediaName = selected.name;
      this.block.mediaType = selected.type;
      this.block.content = selected.content;
      this.block.mediaUrl = selected.url;
    } else {
      this.block.mediaName = '';
      this.block.mediaType = 'text';
      this.block.content = '';
      this.block.mediaUrl = '';
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
    if (!this.block.mediaName || this.block.mediaName.trim() === '') {
      this._snackBar.open('Media Name cannot be empty.', 'Dismiss', { duration: 3000 });
      return;
    }
    if (currentMediaType === 'text' && (!this.block.content || this.block.content.trim() === '')) {
      this._snackBar.open('Text content cannot be empty for text media type.', 'Dismiss', { duration: 3000 });
      return;
    }

     if (this.block.mediaType === 'Image Slider') {
      if (!this.block.slides || this.block.slides.length === 0) {
        this._snackBar.open('Please add at least one slide for the Image Slider.', 'Dismiss', { duration: 3000 });
        return;
      }
      // Further validation for each slide if needed
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
    }
    // Add Image Slider validation
  // if (currentMediaType === 'Image Slider') {
  //   if (!this.block.slideImages || this.block.slideImages.length === 0) {
  //     this._snackBar.open('Please add at least one image for the Image Slider.', 'Dismiss', { duration: 3000 });
  //     return;
  //   }
  //   if (!this.block.slideTitle || this.block.slideTitle.trim() === '') {
  //     this._snackBar.open('Slide Title cannot be empty for Image Slider.', 'Dismiss', { duration: 3000 });
  //     return;
  //   }
  // }
    if (['image', 'video', 'file', 'audio'].includes(currentMediaType) && (!this.block.mediaUrl || this.block.mediaUrl.trim() === '')) {
      this._snackBar.open(`Please provide a URL for ${currentMediaType} media.`, 'Dismiss', { duration: 3000 });
      return;
    }
    const isNewMedia = !this.block.mediaId;
    if (isNewMedia) {
      const newMediaId = 'media-' + Date.now().toString();
      const newMedia: AvailableMedia = {
        id: newMediaId,
        name: this.block.mediaName,
        type: currentMediaType,
        content: this.block.content ?? '',
        url: this.block.mediaUrl ?? '',
         // Add Image Slider specific properties
      // slideTitle: this.block.slideTitle,
      // slideSubtitle: this.block.slideSubtitle,
      // slideImages: this.block.slideImages
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
          // Add Image Slider specific properties
        // slideTitle: this.block.slideTitle,
        // slideSubtitle: this.block.slideSubtitle,
        // slideImages: this.block.slideImages
        };
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

  onContentChange(): void {
    this.blockUpdated.emit(this.block);
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