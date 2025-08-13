// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MatIconModule } from '@angular/material/icon';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatTabsModule } from '@angular/material/tabs';
// import { CdkTextareaAutosize } from '@angular/cdk/text-field';
// import { trigger, transition, style, animate } from '@angular/animations';
// import { ActivatedRoute, Router } from '@angular/router';
// import { AvailableMedia, AvailableStory, Button, ImageSlide } from '../../models/chatbot-block.model';

// type ButtonIntegrationType = 'text_message' | 'media_block' | 'website_url' | 'direct_call' | 'start_story' | 'rss_feed' | 'json_api' | 'human_help' | 'conversational_form' | null;

// export interface ApiHeader {
//   key: string;
//   value: string;
// }

// @Component({
//   selector: 'app-media-block-edit-page',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     MatIconModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatSelectModule,
//     MatButtonToggleModule,
//     MatSnackBarModule,
//     MatTabsModule,
//     CdkTextareaAutosize
//   ],
//   templateUrl: './media-block-edit-page.component.html',
//   styleUrls: ['./media-block-edit-page.component.scss'],
//   animations: [
//     trigger('slideAnimation', [
//       transition(':increment', [
//         style({ transform: 'translateX(100%)', opacity: 0 }),
//         animate('300ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 }))
//       ]),
//       transition(':decrement', [
//         style({ transform: 'translateX(-100%)', opacity: 0 }),
//         animate('300ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 }))
//       ]),
//     ])
//   ]
// })
// export class MediaBlockEditPageComponent implements OnInit {
//   selectedMedia: AvailableMedia | null = null;
//   availableMedia: AvailableMedia[] = [];
//   availableStories: AvailableStory[] = [];
//   showNewMediaForm: boolean = true;
//   showButtonTypeCard: boolean = false;
//   showCommonIntegrationCard: boolean = false;
//   isNew: boolean = false;

//   isolatedMediaData: {
//     text?: string;
//     image?: string;
//     video?: string;
//     audio?: string;
//     file?: string;
//     slides?: ImageSlide[];
//   } = {
//     text: '',
//     image: '',
//     video: '',
//     audio: '',
//     file: '',
//     slides: []
//   };

//   activeMediaType: 'image' | 'video' | 'file' | null = null;
//   showUploadModal: boolean = false;
//   uploadedFileName: string = '';
//   imageUrlInput: string = '';
//   videoUrlInput: string = '';

//   currentButton: Partial<Button> = {};
//   currentButtonIndex: number = -1;

//   showInfoModal: boolean = false;
//   private activeInputElementType: 'buttonTitle' | 'buttonTextMessage' | null = null;
//   searchTerm: string = '';

//   currentSlideIndex: number = 0;

//   @ViewChild('fileUploadInput') fileUploadInput!: ElementRef<HTMLInputElement>;
//   @ViewChild('audioUploadInput') audioUploadInput!: ElementRef<HTMLInputElement>;
//   @ViewChild('videoUploadInput') videoUploadInput!: ElementRef<HTMLInputElement>;
//   @ViewChild('imageUploadInput') imageUploadInput!: ElementRef<HTMLInputElement>;
//   @ViewChild('buttonTitleAutosize', { read: ElementRef }) buttonTitleAutosizeElement!: ElementRef<HTMLTextAreaElement>;
//   @ViewChild('buttonTextMessageAutosize', { read: ElementRef }) buttonTextMessageAutosizeElement!: ElementRef<HTMLTextAreaElement>;

//   generalAttributes: string[] = [
//     '{first_name}',
//     '{last_name}',
//     '{timezone}',
//     '{gender}',
//     '{last_user_msg}',
//     '{last_page}',
//     '{os}'
//   ];

//   formAttributes: string[] = [
//     '{user/last_user_message}',
//     '{user/last_bot_message}',
//     '{user/last_user_button}',
//     '{user/created_at}',
//     '{user/mens_watch}',
//     '{user/Range}',
//     '{user/Price}',
//     '{user/Name}'
//   ];

//   userAttributes: string[] = [
//     '{user/Gender}'
//   ];

//   filteredGeneralAttributes: string[] = [];
//   filteredFormAttributes: string[] = [];
//   filteredUserAttributes: string[] = [];

//   constructor(
//     private _snackBar: MatSnackBar,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.resetFilteredAttributes();
//     this.route.paramMap.subscribe(params => {
//       const mediaId = params.get('id');
//       const state = history.state;
//       console.log('Navigation state:', state);
//       if (state && state.media) {
//         this.selectedMedia = state.media;
//         this.isNew = state.isNew || false;
//         this.availableMedia = state.availableMedia || [];
//         this.availableStories = state.availableStories || [];
//         if (this.selectedMedia) {
//           this.initializeIsolatedStorageFromMedia(this.selectedMedia);
//         } else {
//           this.selectedMedia = { id: '', name: '', type: 'text', content: '', url: '', slides: [], buttons: [] };
//           console.error('No valid media found in state');
//           this.router.navigate(['/media-block']);
//         }
//       } else {
//         this.selectedMedia = { id: '', name: '', type: 'text', content: '', url: '', slides: [], buttons: [] };
//         console.error('No media state provided');
//         this.router.navigate(['/media-block']);
//       }
//     });
//   }

//   initializeIsolatedStorageFromMedia(media: AvailableMedia): void {
//     if (!this.selectedMedia) return;
//     switch (media.type) {
//       case 'text':
//         this.isolatedMediaData.text = media.content || '';
//         break;
//       case 'image':
//         this.isolatedMediaData.image = media.url || '';
//         break;
//       case 'Image Slider':
//         this.isolatedMediaData.slides = media.slides
//           ? JSON.parse(JSON.stringify(media.slides))
//           : [{ image: '', title: '', subtitle: '' }];
//         break;
//       case 'video':
//         this.isolatedMediaData.video = media.url || '';
//         break;
//       case 'audio':
//         this.isolatedMediaData.audio = media.url || '';
//         break;
//       case 'file':
//         this.isolatedMediaData.file = media.url || '';
//         break;
//     }
//   }

//   saveCurrentDataToIsolatedStorage(mediaType: string): void {
//     if (!this.selectedMedia) return;

//     switch (mediaType) {
//       case 'text':
//         this.isolatedMediaData.text = this.selectedMedia.content || '';
//         break;
//       case 'image':
//         this.isolatedMediaData.image = this.selectedMedia.url || '';
//         break;
//       case 'Image Slider':
//         this.isolatedMediaData.slides = this.selectedMedia.slides
//           ? JSON.parse(JSON.stringify(this.selectedMedia.slides))
//           : [{ image: '', title: '', subtitle: '' }];
//         break;
//       case 'video':
//         this.isolatedMediaData.video = this.selectedMedia.url || '';
//         break;
//       case 'audio':
//         this.isolatedMediaData.audio = this.selectedMedia.url || '';
//         break;
//       case 'file':
//         this.isolatedMediaData.file = this.selectedMedia.url || '';
//         break;
//     }
//   }

//   loadDataFromIsolatedStorage(mediaType: string): void {
//     if (!this.selectedMedia) return;

//     this.selectedMedia.content = '';
//     this.selectedMedia.url = '';
//     this.selectedMedia.slides = [];

//     switch (mediaType) {
//       case 'text':
//         this.selectedMedia.content = this.isolatedMediaData.text || '';
//         break;
//       case 'image':
//         this.selectedMedia.url = this.isolatedMediaData.image || '';
//         break;
//       case 'Image Slider':
//         this.selectedMedia.slides = this.isolatedMediaData.slides && this.isolatedMediaData.slides.length > 0
//           ? JSON.parse(JSON.stringify(this.isolatedMediaData.slides))
//           : [{ image: '', title: '', subtitle: '' }];
//         this.currentSlideIndex = Math.min(this.currentSlideIndex, (this.selectedMedia.slides?.length || 1) - 1);
//         break;
//       case 'video':
//         this.selectedMedia.url = this.isolatedMediaData.video || '';
//         break;
//       case 'audio':
//         this.selectedMedia.url = this.isolatedMediaData.audio || '';
//         break;
//       case 'file':
//         this.selectedMedia.url = this.isolatedMediaData.file || '';
//         break;
//     }
//   }

//   onMediaTypeChange(newMediaType: 'image' | 'video' | 'file' | 'text' | 'Image Slider' | 'audio'): void {
//     if (!this.selectedMedia) return;

//     const previousMediaType = this.selectedMedia.type || 'text';
//     this.saveCurrentDataToIsolatedStorage(previousMediaType);
//     this.selectedMedia.type = newMediaType;
//     this.loadDataFromIsolatedStorage(newMediaType);

//     if (newMediaType === 'Image Slider') {
//       if (!this.isolatedMediaData.slides || this.isolatedMediaData.slides.length === 0) {
//         this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
//       }
//       this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
//       this.currentSlideIndex = 0;
//     }
//   }

//   saveMedia(): void {
//     if (!this.selectedMedia) return;

//     const currentMediaType = this.selectedMedia.type || 'text';

//     if (!this.selectedMedia.name || this.selectedMedia.name.trim() === '') {
//       this._snackBar.open('Media Name cannot be empty.', 'Dismiss', { duration: 3000 });
//       return;
//     }

//     switch (currentMediaType) {
//       case 'text':
//         if (!this.selectedMedia.content || this.selectedMedia.content.trim() === '') {
//           this._snackBar.open('Text content cannot be empty for text media type.', 'Dismiss', { duration: 3000 });
//           return;
//         }
//         this.selectedMedia.slides = [];
//         this.selectedMedia.url = '';
//         break;

//       case 'image':
//         if (!this.selectedMedia.url || this.selectedMedia.url.trim() === '') {
//           this._snackBar.open('Please provide an image for the image block.', 'Dismiss', { duration: 3000 });
//           return;
//         }
//         break;

//       case 'Image Slider':
//         if (!this.selectedMedia.slides || this.selectedMedia.slides.length === 0) {
//           this._snackBar.open('Please add at least one slide for the Image Slider.', 'Dismiss', { duration: 3000 });
//           return;
//         }
//         for (const slide of this.selectedMedia.slides) {
//           if (!slide.image || slide.image.trim() === '') {
//             this._snackBar.open('Each slide must have an image.', 'Dismiss', { duration: 3000 });
//             return;
//           }
//           if (!slide.title || slide.title.trim() === '') {
//             this._snackBar.open('Each slide must have a title.', 'Dismiss', { duration: 3000 });
//             return;
//           }
//         }
//         this.selectedMedia.content = '';
//         this.selectedMedia.url = '';
//         break;

//       case 'video':
//       case 'audio':
//       case 'file':
//         if (!this.selectedMedia.url || this.selectedMedia.url.trim() === '') {
//           this._snackBar.open(`Please provide a URL for ${currentMediaType} media.`, 'Dismiss', { duration: 3000 });
//           return;
//         }
//         this.selectedMedia.slides = [];
//         this.selectedMedia.content = '';
//         break;
//     }

//     this.router.navigate(['/media-block'], {
//       state: {
//         media: this.selectedMedia,
//         isNew: this.isNew,
//         availableMedia: this.availableMedia
//       }
//     });
//     this._snackBar.open(this.isNew ? 'New Media Block created successfully!' : 'Media Block updated successfully!', 'Dismiss', { duration: 3000 });
//   }

//   cancelEdit(): void {
//     this.router.navigate(['/media-block']);
//   }

//   openUploadModal(mediaType: 'image' | 'video' | 'file'): void {
//     this.activeMediaType = mediaType;
//     this.showUploadModal = true;
//     this.uploadedFileName = '';
//     this.imageUrlInput = '';
//     this.videoUrlInput = '';
//   }

//   closeUploadModal(): void {
//     this.showUploadModal = false;
//     this.activeMediaType = null;
//   }

//   triggerFileUpload(): void {
//     this.fileUploadInput.nativeElement.click();
//   }

//   onFileUpload(event: any): void {
//     const file = event.target.files[0];
//     if (file && this.selectedMedia) {
//       const fileUrl = URL.createObjectURL(file);
//       this.uploadedFileName = file.name;
//       this.selectedMedia.url = fileUrl;
//       this._snackBar.open('File uploaded successfully!', 'Dismiss', { duration: 2000 });
//       event.target.value = null;
//     }
//   }

//   triggerAudioUpload(): void {
//     this.audioUploadInput.nativeElement.click();
//   }

//   onAudioUpload(event: any): void {
//     const file = event.target.files[0];
//     if (file && this.selectedMedia) {
//       const audioUrl = URL.createObjectURL(file);
//       this.selectedMedia.url = audioUrl;
//       this._snackBar.open('Audio uploaded successfully!', 'Dismiss', { duration: 2000 });
//       event.target.value = null;
//     }
//   }

//   onVideoUpload(event: any): void {
//     const file = event.target.files[0];
//     if (file && this.selectedMedia) {
//       this.uploadedFileName = file.name;
//       const videoUrl = URL.createObjectURL(file);
//       this.selectedMedia.url = videoUrl;
//       this.closeUploadModal();
//       this._snackBar.open('Video uploaded successfully!', 'Dismiss', { duration: 2000 });
//     }
//   }

//   uploadVideoUrl(): void {
//     if (this.videoUrlInput && this.selectedMedia) {
//       this.selectedMedia.url = this.videoUrlInput;
//       this.closeUploadModal();
//       this._snackBar.open('Video URL added successfully!', 'Dismiss', { duration: 2000 });
//     } else {
//       this._snackBar.open('Please enter a valid video URL.', 'Dismiss', { duration: 2000 });
//     }
//   }

//   triggerImageUpload(): void {
//     this.imageUploadInput.nativeElement.click();
//   }

//   onImageUpload(event: any): void {
//     const file = event.target.files[0];
//     if (!file || !this.selectedMedia) return;

//     const reader = new FileReader();
//     reader.onload = (e: any) => {
//       const imageDataUrl = e.target.result as string;

//       if (this.selectedMedia!.type === 'image') {
//         this.isolatedMediaData.image = imageDataUrl;
//         this.selectedMedia!.url = imageDataUrl;
//       } else if (this.selectedMedia!.type === 'Image Slider') {
//         if (!this.isolatedMediaData.slides) {
//           this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
//         }
//         if (!this.isolatedMediaData.slides[this.currentSlideIndex]) {
//           while (this.isolatedMediaData.slides.length <= this.currentSlideIndex) {
//             this.isolatedMediaData.slides.push({ image: '', title: '', subtitle: '' });
//           }
//         }
//         this.isolatedMediaData.slides[this.currentSlideIndex] = {
//           ...this.isolatedMediaData.slides[this.currentSlideIndex],
//           image: imageDataUrl
//         };
//         this.selectedMedia!.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
//       }

//       this._snackBar.open('Image uploaded successfully!', 'Dismiss', { duration: 2000 });
//     };

//     reader.readAsDataURL(file);
//     this.closeUploadModal();
//   }

//   uploadImageUrl(): void {
//     if (this.imageUrlInput && this.selectedMedia) {
//       if (this.selectedMedia.type === 'image') {
//         this.isolatedMediaData.image = this.imageUrlInput;
//         this.selectedMedia.url = this.imageUrlInput;
//       } else if (this.selectedMedia.type === 'Image Slider') {
//         if (!this.isolatedMediaData.slides || this.isolatedMediaData.slides.length === 0) {
//           this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
//           this.currentSlideIndex = 0;
//         }
//         this.isolatedMediaData.slides[this.currentSlideIndex].image = this.imageUrlInput;
//         this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
//       }

//       this.closeUploadModal();
//       this._snackBar.open('Image from URL added successfully!', 'Dismiss', { duration: 2000 });
//     } else {
//       this._snackBar.open('Please enter a valid image URL.', 'Dismiss', { duration: 2000 });
//     }
//   }

//   removeMedia(): void {
//     if (!this.selectedMedia) return;

//     if (this.selectedMedia.type === 'image') {
//       this.selectedMedia.url = '';
//       this.isolatedMediaData.image = '';
//     } else if (this.selectedMedia.type === 'Image Slider') {
//       this.removeCurrentSlide();
//     } else if (this.selectedMedia.type === 'video') {
//       this.selectedMedia.url = '';
//       this.isolatedMediaData.video = '';
//     } else if (this.selectedMedia.type === 'audio') {
//       this.selectedMedia.url = '';
//       this.isolatedMediaData.audio = '';
//     } else if (this.selectedMedia.type === 'file') {
//       this.selectedMedia.url = '';
//       this.isolatedMediaData.file = '';
//     } else if (this.selectedMedia.type === 'text') {
//       this.selectedMedia.content = '';
//       this.isolatedMediaData.text = '';
//     }
//   }

//   removeVideoMedia(): void {
//     if (this.selectedMedia && this.selectedMedia.type === 'video') {
//       this.selectedMedia.url = '';
//       this.isolatedMediaData.video = '';
//       this._snackBar.open('Video removed successfully!', 'Dismiss', { duration: 2000 });
//     }
//   }

//   removeAudioMedia(): void {
//     if (this.selectedMedia && this.selectedMedia.type === 'audio') {
//       this.selectedMedia.url = '';
//       this.isolatedMediaData.audio = '';
//       this._snackBar.open('Audio removed successfully!', 'Dismiss', { duration: 2000 });
//     }
//   }

//   removeFile(): void {
//     if (this.selectedMedia && this.selectedMedia.type === 'file') {
//       this.selectedMedia.url = '';
//       this.isolatedMediaData.file = '';
//       this.uploadedFileName = '';
//       this._snackBar.open('File removed.', 'Dismiss', { duration: 2000 });
//     }
//   }

//   addNewSlide(): void {
//     if (this.selectedMedia && this.selectedMedia.type === 'Image Slider') {
//       if (!this.isolatedMediaData.slides) {
//         this.isolatedMediaData.slides = [{ image: '', title: '', subtitle: '' }];
//       }
//       this.isolatedMediaData.slides.push({ image: '', title: '', subtitle: '' });
//       this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
//       this.currentSlideIndex = this.isolatedMediaData.slides.length - 1;
//       this._snackBar.open('New slide added.', 'Dismiss', { duration: 2000 });
//     }
//   }

//   removeCurrentSlide(): void {
//     if (this.selectedMedia && this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && this.isolatedMediaData.slides.length > 1) {
//       this.isolatedMediaData.slides.splice(this.currentSlideIndex, 1);
//       if (this.currentSlideIndex >= this.isolatedMediaData.slides.length) {
//         this.currentSlideIndex = this.isolatedMediaData.slides.length - 1;
//       }
//       this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
//       this._snackBar.open('Slide removed successfully!', 'Dismiss', { duration: 2000 });
//     } else if (this.selectedMedia && this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides && this.isolatedMediaData.slides.length === 1) {
//       this.isolatedMediaData.slides[0] = { image: '', title: '', subtitle: '' };
//       this.selectedMedia.slides = JSON.parse(JSON.stringify(this.isolatedMediaData.slides));
//       this._snackBar.open('Slide content reset.', 'Dismiss', { duration: 2000 });
//     }
//   }

//   removeCurrentImage(index: number): void {
//     if (this.selectedMedia && this.selectedMedia.slides && this.selectedMedia.slides[index]) {
//       if (this.selectedMedia.type === 'image') {
//         this.selectedMedia.url = '';
//       } else if (this.selectedMedia.type === 'Image Slider' && this.isolatedMediaData.slides) {
//         this.isolatedMediaData.slides[index].image = '';
//         this.selectedMedia.slides[index].image = '';
//       }
//       this._snackBar.open('Image removed successfully!', 'Dismiss', { duration: 2000 });
//     }
//   }

//   nextSlide(): void {
//     if (this.selectedMedia?.slides && this.currentSlideIndex < this.selectedMedia.slides.length - 1) {
//       this.currentSlideIndex++;
//     }
//   }

//   previousSlide(): void {
//     if (this.currentSlideIndex > 0) {
//       this.currentSlideIndex--;
//     }
//   }

//   goToSlide(index: number): void {
//     if (this.selectedMedia?.slides && index >= 0 && index < this.selectedMedia.slides.length) {
//       this.currentSlideIndex = index;
//     }
//   }

//   updateSlideProperty(property: 'title' | 'subtitle', value: string): void {
//     if (this.selectedMedia && this.selectedMedia.slides && this.selectedMedia.slides[this.currentSlideIndex]) {
//       this.selectedMedia.slides[this.currentSlideIndex][property] = value;
//       this.isolatedMediaData.slides = this.selectedMedia.slides
//         ? JSON.parse(JSON.stringify(this.selectedMedia.slides))
//         : [{ image: '', title: '', subtitle: '' }];
//     }
//   }

//   resetFilteredAttributes(): void {
//     this.filteredGeneralAttributes = [...this.generalAttributes];
//     this.filteredFormAttributes = [...this.formAttributes];
//     this.filteredUserAttributes = [...this.userAttributes];
//   }

//   onAddNewButton(): void {
//     this.showButtonTypeCard = true;
//     this.currentButton = {};
//   }

//   closeButtonTypeCard(): void {
//     this.showButtonTypeCard = false;
//   }

//   openCommonCardForNewButton(type: ButtonIntegrationType): void {
//     this.currentButton.type = type;
//     this.showButtonTypeCard = false;
//     this.showCommonIntegrationCard = true;
//   }

//   closeCommonIntegrationCard(): void {
//     this.showCommonIntegrationCard = false;
//   }

//   onEditButtonClick(button: Button, index: number): void {
//     this.currentButton = { ...button };
//     this.currentButtonIndex = index;
//     this.showCommonIntegrationCard = true;
//   }

//   onDeleteButtonClick(index: number): void {
//     if (this.selectedMedia?.buttons) {
//       this.selectedMedia.buttons.splice(index, 1);
//       this._snackBar.open('Button removed.', 'Dismiss', { duration: 2000 });
//     }
//   }

//   addApiHeader(): void {
//     if (!this.currentButton.apiHeaders) {
//       this.currentButton.apiHeaders = [];
//     }
//     this.currentButton.apiHeaders.push({ key: '', value: '' });
//   }

//   removeApiHeader(index: number): void {
//     if (this.currentButton.apiHeaders && this.currentButton.apiHeaders.length > 1) {
//       this.currentButton.apiHeaders.splice(index, 1);
//     }
//   }

//   openInfoModal(inputType: 'buttonTitle' | 'buttonTextMessage'): void {
//     this.activeInputElementType = inputType;
//     this.showInfoModal = true;
//   }

//   closeInfoModal(): void {
//     this.showInfoModal = false;
//     this.activeInputElementType = null;
//   }
// }