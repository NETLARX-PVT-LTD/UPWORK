import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StoryService } from '../services/api.service';
import { StoryBlock } from '../../proto-gen/story_block';

export interface Story {
  id: string;
  name: string;
  createdDate: string;
  keywords?: string[];
  blocks?: any[];
  connections?: any[];
  category?: 'get-started' | 'default' | 'normal';
  isInConnedResponses?: boolean; // New property to track if story is in conned responses
  isDeactivated?: boolean; // New property to track if story is deactivated
}

// export interface Story : StoryBlock {
//   id: number;
//   name: string;             
//   createdDate: string;
//   rootBlockConnectionId: string; // use string to hold Guid
//   botId: number;
//   // keywords?: string[];
//   // category?: 'get-started' | 'default' | 'normal';
//   // isInConnedResponses?: boolean; // New property to track if story is in conned responses
//   // isDeactivated?: boolean; // New property to track if story is deactivated
// }

@Component({
  selector: 'app-manage-bot-stories',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule,
    FormsModule,
    MatSnackBarModule
  ],
  templateUrl: './manage-bot-stories.component.html',
  styleUrls: ['./manage-bot-stories.component.scss']
})
export class ManageBotStoriesComponent implements OnInit {
  selectedBotId = '3';
  searchTerm = '';
  selectedFilter = 'all';
  showSetAsStartedModal = false;
  showRemoveFromStartedModal = false;
  showSetAsDefaultModal = false;
  showRemoveFromDefaultModal = false;
  showAddToConnedModal = false; // New modal state
  showRemoveFromConnedModal = false; // New modal state
  showDeactivateModal = false; // New modal state for deactivate
  showActivateModal = false; // New modal state for activate
  selectedStoryForGetStarted: Story | null = null;
  selectedStoryForRemoval: Story | null = null;
  selectedStoryForDefault: Story | null = null;
  selectedStoryForDefaultRemoval: Story | null = null;
  selectedStoryForConned: Story | null = null; // New property for conned responses
  selectedStoryForDeactivate: Story | null = null; // New property for deactivate/activate
  selectedMessageType = 'All';
  
  stories: Story[] = [
    {
      id: 'story-1',
      name: 'Keyword combination',
      createdDate: '08/13/2025',
      keywords: ['hello', 'hi', 'heyuu'],
      category: 'normal',
      isInConnedResponses: false,
      isDeactivated: false
    }
  ];

  filteredStories: Story[] = [];

  get getStartedCount(): number {
    return this.stories.filter(story => story.category === 'get-started').length;
  }

  get defaultMessagesCount(): number {
    return this.stories.filter(story => story.category === 'default').length;
  }

  constructor(
    private router: Router, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private storyService: StoryService
  ) {}

  ngOnInit(): void {
    this.loadStoriesFromStorage();
    this.filterStories();
    this.loadStoriesFromApi();
  }
  
  private loadStoriesFromApi(): void {
    this.storyService.getAllStories().subscribe({
      next: (data) => {
        this.stories = data.map(story => ({
          ...story,
          isInConnedResponses: story.isInConnedResponses || false,
          isDeactivated: story.isDeactivated || false,
          category: story.category || 'normal'
        }));
        this.filterStories();
      },
      error: (err) => {
        console.error('Error fetching stories:', err);
        this.snackBar.open('Failed to load stories from server', 'Close', { duration: 3000 });
      }
    });
  }

  private loadStoriesFromStorage(): void {
    const savedStories = localStorage.getItem('botStories');
    if (savedStories) {
      this.stories = JSON.parse(savedStories);
      // Ensure all stories have the required properties
      this.stories = this.stories.map(story => ({
        ...story,
        isInConnedResponses: story.isInConnedResponses || false,
        isDeactivated: story.isDeactivated || false
      }));
    }
  }

  private saveStoriesToStorage(): void {
    localStorage.setItem('botStories', JSON.stringify(this.stories));
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  navigateToCreateStory(): void {
    this.router.navigate(['/create-story']);
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterStories();
  }

  filterStories(): void {
    let filtered = [...this.stories];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(story =>
        story.name.toLowerCase().includes(term) ||
        (story.keywords && story.keywords.some(keyword => 
          keyword.toLowerCase().includes(term)
        ))
      );
    }

    // Apply category filter
    switch (this.selectedFilter) {
      case 'get-started':
        filtered = filtered.filter(story => story.category === 'get-started');
        break;
      case 'default':
        filtered = filtered.filter(story => story.category === 'default');
        break;
      // 'all' shows everything
    }

    this.filteredStories = filtered;
  }

  // editStory(story: Story): void {
  //   this.router.navigate(['/create-story'], { 
  //     queryParams: { storyId: story.id } 
  //   });
  // }

    viewStorySchema(story: Story): void {
    this.storyService.getStorySchemaById(+story.id).subscribe({
      next: (response) => {
        console.log("Story schema response:", response);

        this.snackBar.open(`Schema loaded for "${story.name}"`, 'Close', { duration: 3000 });

        // ✅ Navigate with state
        this.router.navigate(['/create-story'], {
          state: {
            storyId: story.id,
            storyName: story.name,
            components: response.components
          }
        });
      },
      error: (err) => {
        console.error("Error fetching story schema:", err);
        this.snackBar.open("Failed to fetch story schema", "Close", { duration: 3000 });
      }
    });
  }



  // deleteStory(story: Story): void {
  //   if (confirm(`Are you sure you want to delete "${story.name}"?`)) {
  //     this.stories = this.stories.filter(s => s.id !== story.id);
  //     this.saveStoriesToStorage();
  //     this.filterStories();
  //   }
  // }
  
  deleteStory(story: Story): void {
    if (confirm(`Are you sure you want to delete "${story.name}"?`)) {
      this.storyService.deleteStory(+story.id).subscribe({
        next: () => {
          // Remove locally
          this.stories = this.stories.filter(s => s.id !== story.id);
          this.saveStoriesToStorage();
          this.filterStories();
          this.showSuccessMessage('Story deleted successfully.');
        },
        error: (err) => {
          console.error('Error deleting story:', err);
          this.snackBar.open('Failed to delete story from server', 'Close', { duration: 3000 });
        }
      });
    }
  }

  duplicateStory(story: Story): void {
    const duplicatedStory: Story = {
      ...story,
      id: `${story.id}-copy-${Date.now()}`,
      name: `${story.name}`,
      createdDate: new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }),
      category: 'normal', // Reset category for duplicated story
      isInConnedResponses: false, // Reset conned responses status
      isDeactivated: false // Reset deactivation status
    };

    this.stories.push(duplicatedStory);
    this.saveStoriesToStorage();
    this.filterStories();
    this.showSuccessMessage('Story was successfully cloned.');
  }

  exportStory(story: Story): void {
    const dataStr = JSON.stringify(story, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Existing methods for the three dots menu functionality
  copyPayload(story: Story): void {
    navigator.clipboard.writeText(JSON.stringify(story)).then(() => {
      console.log('Payload copied to clipboard');
    });
     this.showSuccessMessage('Copied.');
  }

  cloneStory(story: Story): void {
    this.duplicateStory(story);
  }

  deactivateStory(story: Story): void {
    this.selectedStoryForDeactivate = story;
    this.showDeactivateModal = true;
  }

  activateStory(story: Story): void {
    this.selectedStoryForDeactivate = story;
    this.showActivateModal = true;
  }

  confirmDeactivateStory(): void {
    if (this.selectedStoryForDeactivate) {
      const storyIndex = this.stories.findIndex(s => s.id === this.selectedStoryForDeactivate!.id);
      if (storyIndex !== -1) {
        this.stories[storyIndex].isDeactivated = true;
        this.saveStoriesToStorage();
        this.filterStories();
        this.showSuccessMessage('Your story is now deactivated.');
      }
    }
    this.closeDeactivateModal();
  }

  confirmActivateStory(): void {
    if (this.selectedStoryForDeactivate) {
      const storyIndex = this.stories.findIndex(s => s.id === this.selectedStoryForDeactivate!.id);
      if (storyIndex !== -1) {
        this.stories[storyIndex].isDeactivated = false;
        this.saveStoriesToStorage();
        this.filterStories();
        this.showSuccessMessage('Your story is now activated.');
      }
    }
    this.closeActivateModal();
  }

  closeDeactivateModal(): void {
    this.showDeactivateModal = false;
    this.selectedStoryForDeactivate = null;
  }

  closeActivateModal(): void {
    this.showActivateModal = false;
    this.selectedStoryForDeactivate = null;
  }

  // Updated Conned Responses methods
  addToConnedResponses(story: Story): void {
    this.selectedStoryForConned = story;
    this.showAddToConnedModal = true;
  }

  removeFromConnedResponses(story: Story): void {
    this.selectedStoryForConned = story;
    this.showRemoveFromConnedModal = true;
  }

  confirmAddToConnedResponses(): void {
    if (this.selectedStoryForConned) {
      const storyIndex = this.stories.findIndex(s => s.id === this.selectedStoryForConned!.id);
      if (storyIndex !== -1) {
        this.stories[storyIndex].isInConnedResponses = true;
        this.saveStoriesToStorage();
        this.filterStories();
        this.showSuccessMessage('Story is now added to fix replies.');
      }
    }
    this.closeAddToConnedModal();
  }

  confirmRemoveFromConnedResponses(): void {
    if (this.selectedStoryForConned) {
      const storyIndex = this.stories.findIndex(s => s.id === this.selectedStoryForConned!.id);
      if (storyIndex !== -1) {
        this.stories[storyIndex].isInConnedResponses = false;
        this.saveStoriesToStorage();
        this.filterStories();
        this.showSuccessMessage('Story is now removed from fix replies.');
      }
    }
    this.closeRemoveFromConnedModal();
  }

  closeAddToConnedModal(): void {
    this.showAddToConnedModal = false;
    this.selectedStoryForConned = null;
  }

  closeRemoveFromConnedModal(): void {
    this.showRemoveFromConnedModal = false;
    this.selectedStoryForConned = null;
  }

  // Existing Get Started methods
  setAsGetStarted(story: Story): void {
    this.selectedStoryForGetStarted = story;
    this.showSetAsStartedModal = true;
  }

  removeFromGetStarted(story: Story): void {
    this.selectedStoryForRemoval = story;
    this.showRemoveFromStartedModal = true;
  }

  confirmRemoveFromGetStarted(): void {
    if (this.selectedStoryForRemoval) {
      const storyIndex = this.stories.findIndex(s => s.id === this.selectedStoryForRemoval!.id);
      if (storyIndex !== -1) {
        this.stories[storyIndex].category = 'normal';
        if (this.stories[storyIndex].name === 'Get Started Button') {
          this.stories[storyIndex].name = 'Keyword combination';
        }
        this.saveStoriesToStorage();
        this.filterStories();
      }
    }
    this.closeRemoveFromStartedModal();
  }

  closeRemoveFromStartedModal(): void {
    this.showRemoveFromStartedModal = false;
    this.selectedStoryForRemoval = null;
  }

  // Existing Default Message methods
  setAsDefaultMessage(story: Story): void {
    this.selectedStoryForDefault = story;
    this.selectedMessageType = 'All';
    this.showSetAsDefaultModal = true;
  }

  removeFromDefaultMessage(story: Story): void {
    this.selectedStoryForDefaultRemoval = story;
    this.showRemoveFromDefaultModal = true;
  }

  confirmSetAsDefaultMessage(): void {
    if (this.selectedStoryForDefault) {
      const existingDefault = this.stories.find(s => s.category === 'default');
      if (existingDefault) {
        existingDefault.category = 'normal';
      }

      const storyIndex = this.stories.findIndex(s => s.id === this.selectedStoryForDefault!.id);
      if (storyIndex !== -1) {
        this.stories[storyIndex].category = 'default';
        this.stories[storyIndex].name = 'Default Message';
        this.saveStoriesToStorage();
        this.filterStories();
      }
    }
    this.closeSetAsDefaultModal();
  }

  confirmRemoveFromDefaultMessage(): void {
    if (this.selectedStoryForDefaultRemoval) {
      const storyIndex = this.stories.findIndex(s => s.id === this.selectedStoryForDefaultRemoval!.id);
      if (storyIndex !== -1) {
        this.stories[storyIndex].category = 'normal';
        if (this.stories[storyIndex].name === 'Default Message') {
          this.stories[storyIndex].name = 'Keyword combination';
        }
        this.saveStoriesToStorage();
        this.filterStories();
      }
    }
    this.closeRemoveFromDefaultModal();
  }

  closeSetAsDefaultModal(): void {
    this.showSetAsDefaultModal = false;
    this.selectedStoryForDefault = null;
    this.selectedMessageType = 'All';
  }

  closeRemoveFromDefaultModal(): void {
    this.showRemoveFromDefaultModal = false;
    this.selectedStoryForDefaultRemoval = null;
  }

  confirmSetAsGetStarted(): void {
    if (this.selectedStoryForGetStarted) {
      const existingGetStarted = this.stories.find(s => s.category === 'get-started');
      if (existingGetStarted) {
        existingGetStarted.category = 'normal';
        existingGetStarted.name = existingGetStarted.name.replace(' - Get Started Button', '');
      }

      const storyIndex = this.stories.findIndex(s => s.id === this.selectedStoryForGetStarted!.id);
      if (storyIndex !== -1) {
        this.stories[storyIndex].category = 'get-started';
        if (!this.stories[storyIndex].name.includes('Get Started Button')) {
          this.stories[storyIndex].name = 'Get Started Button';
        }
        this.saveStoriesToStorage();
        this.filterStories();
      }
    }
    this.closeSetAsStartedModal();
  }

  closeSetAsStartedModal(): void {
    this.showSetAsStartedModal = false;
    this.selectedStoryForGetStarted = null;
  }

  addNewStory(story: Story): void {
    story.category = story.category || 'normal';
    story.isInConnedResponses = story.isInConnedResponses || false;
    story.isDeactivated = story.isDeactivated || false;
    this.stories.unshift(story);
    this.saveStoriesToStorage();
    this.filterStories();
  }
}