import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageMessageService, PageMessage } from '../../shared/services/page-message.service';
import { ChatbotFlowComponent } from '../../chatbot-flow/chatbot-flow.component';

export interface Story {
  id: string;
  name: string;
  blocks: StoryBlock[];
}

export interface StoryBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'card';
  content: any;
}

@Component({
  selector: 'app-page-message',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ChatbotFlowComponent
  ],
  templateUrl: './page-message.component.html',
  styleUrls: ['./page-message.component.scss']
})
export class PageMessageComponent implements OnInit {
  @Input() existingMessage?: PageMessage;
  @Input() availableStories: Story[] = [];
  @Output() onSave = new EventEmitter<PageMessage>();
  @Output() onCancel = new EventEmitter<void>();

  pageMessageForm: FormGroup;
  showStoryCreator = false;
  newStory: Story | null = null;
  isModal = false;
  messageId?: string;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private pageMessageService: PageMessageService
  ) {
    this.pageMessageForm = this.createForm();
    
    // Check if component is used as modal (has inputs) or standalone page
    this.isModal = this.existingMessage !== undefined;
  }

  ngOnInit(): void {
    if (!this.isModal) {
      // Get message ID from route if editing
      this.messageId = this.route.snapshot.paramMap.get('id') || undefined;
      
      if (this.messageId) {
        const message = this.pageMessageService.getPageMessageById(this.messageId);
        if (message) {
          this.existingMessage = message;
        }
      }
    }

    if (this.existingMessage) {
      this.loadExistingMessage();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      urls: this.fb.array([this.fb.control('', Validators.required)]),
      showAfterDelay: [true],
      showAfterScroll: [false],
      delay: [5, [Validators.required, Validators.min(1)]],
      messageType: ['text', Validators.required],
      textMessage: [''],
      selectedStoryId: ['']
    });
  }

  get urlsArray(): FormArray {
    return this.pageMessageForm.get('urls') as FormArray;
  }

  get messageType(): string {
    return this.pageMessageForm.get('messageType')?.value;
  }

  get showAfterDelay(): boolean {
    return this.pageMessageForm.get('showAfterDelay')?.value;
  }

  get showAfterScroll(): boolean {
    return this.pageMessageForm.get('showAfterScroll')?.value;
  }

  addUrl(): void {
    this.urlsArray.push(this.fb.control('', Validators.required));
  }

  removeUrl(index: number): void {
    if (this.urlsArray.length > 1) {
      this.urlsArray.removeAt(index);
    }
  }

  onDelayToggle(event: Event): void {
    const value = (event.target as HTMLInputElement)?.checked;
    if (value !== undefined) {
      this.pageMessageForm.patchValue({ showAfterDelay: value });
      if (!value && !this.showAfterScroll) {
        this.pageMessageForm.patchValue({ showAfterScroll: true });
      }
    }
  }

  onScrollToggle(event: Event): void {
    const value = (event.target as HTMLInputElement)?.checked;
    if (value !== undefined) {
      this.pageMessageForm.patchValue({ showAfterScroll: value });
      if (!value && !this.showAfterDelay) {
        this.pageMessageForm.patchValue({ showAfterDelay: true });
      }
    }
  }

  onMessageTypeChange(type: string): void {
    this.pageMessageForm.patchValue({ messageType: type });
    
    const textMessageControl = this.pageMessageForm.get('textMessage');
    const storyControl = this.pageMessageForm.get('selectedStoryId');
    
    if (type === 'text') {
      textMessageControl?.setValidators([Validators.required]);
      storyControl?.clearValidators();
    } else {
      storyControl?.setValidators([Validators.required]);
      textMessageControl?.clearValidators();
    }
    
    textMessageControl?.updateValueAndValidity();
    storyControl?.updateValueAndValidity();
  }

  createNewStory(): void {
    this.router.navigate(['/create-story']);
  }

  onStoryCreated(story: Story): void {
    this.availableStories.push(story);
    this.pageMessageForm.patchValue({ selectedStoryId: story.id });
    this.showStoryCreator = false;
    this.newStory = null;
  }

  onStoryCreationCanceled(): void {
    this.showStoryCreator = false;
    this.newStory = null;
  }

  save(): void {
    if (this.pageMessageForm.valid) {
      const formValue = this.pageMessageForm.value;
      const selectedStory = this.availableStories.find(s => s.id === formValue.selectedStoryId);

      const pageMessage: PageMessage = {
        id: this.existingMessage?.id || this.messageId,
        urls: formValue.urls.filter((url: string) => url.trim() !== ''),
        showAfterDelay: formValue.showAfterDelay,
        showAfterScroll: formValue.showAfterScroll,
        delay: formValue.delay,
        messageType: formValue.messageType,
        textMessage: formValue.messageType === 'text' ? formValue.textMessage : undefined,
        selectedStory: formValue.messageType === 'story' ? selectedStory : undefined
      };

      if (formValue.messageType === 'story' && !selectedStory) {
        console.error('No story selected for story message type.');
        return;
      }

      if (this.isModal) {
        // Component used as modal - emit event
        this.onSave.emit(pageMessage);
      } else {
        // Component used as standalone page - save via service and navigate
        this.pageMessageService.savePageMessage(pageMessage);
        this.router.navigate(['/page-messages']);
      }
    } else {
      console.log('Form is invalid. Cannot save.');
      this.markFormGroupTouched();
    }
  }

  cancel(): void {
    if (this.isModal) {
      this.onCancel.emit();
    } else {
      this.router.navigate(['/page-messages']);
    }
  }

  private loadExistingMessage(): void {
    const message = this.existingMessage!;
    
    while (this.urlsArray.length !== 0) {
      this.urlsArray.removeAt(0);
    }
    
    message.urls.forEach(url => {
      this.urlsArray.push(this.fb.control(url, Validators.required));
    });
    
    this.pageMessageForm.patchValue({
      showAfterDelay: message.showAfterDelay,
      showAfterScroll: message.showAfterScroll,
      delay: message.delay,
      messageType: message.messageType,
      textMessage: message.textMessage || '',
      selectedStoryId: message.selectedStory?.id || ''
    });
    
    this.onMessageTypeChange(message.messageType);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.pageMessageForm.controls).forEach(key => {
      const control = this.pageMessageForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pageMessageForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isUrlInvalid(index: number): boolean {
    const urlControl = this.urlsArray.at(index);
    return !!(urlControl && urlControl.invalid && (urlControl.dirty || urlControl.touched));
  }

  getSelectedStory(): Story | undefined {
    const storyId = this.pageMessageForm.get('selectedStoryId')?.value;
    return this.availableStories.find(story => story.id === storyId);
  }
}