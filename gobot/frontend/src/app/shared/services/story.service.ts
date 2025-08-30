import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Story {
  id: string;
  name: string;
  createdDate: string;
  keywords?: string[];
  blocks?: any[];
  description?: string;
  connections?: any;
}

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly STORAGE_KEY = 'botStories';
  private storiesSubject = new BehaviorSubject<Story[]>([]);

  constructor() {
    this.loadStoriesFromStorage();
  }

  get stories$(): Observable<Story[]> {
    return this.storiesSubject.asObservable();
  }

  get stories(): Story[] {
    return this.storiesSubject.value;
  }

  private loadStoriesFromStorage(): void {
    try {
      const savedStories = localStorage.getItem(this.STORAGE_KEY);
      if (savedStories) {
        const parsedStories = JSON.parse(savedStories);
        this.storiesSubject.next(parsedStories);
      } else {
        // Initialize with default stories if none exist
        const defaultStories: Story[] = [
          {
            id: 'story-default-1',
            name: 'Keyword combination',
            createdDate: '08/13/2025',
            keywords: ['hello', 'hi', 'heyuu'],
            description: 'Default greeting story'
          }
        ];
        this.storiesSubject.next(defaultStories);
        this.saveToStorage(defaultStories);
      }
    } catch (error) {
      console.error('Error loading stories from storage:', error);
      this.storiesSubject.next([]);
    }
  }

  private saveToStorage(stories: Story[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stories));
    } catch (error) {
      console.error('Error saving stories to storage:', error);
    }
  }

  addStory(story: Omit<Story, 'id' | 'createdDate'>): Story {
    const newStory: Story = {
      ...story,
      id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      })
    };

    const currentStories = this.stories;
    const updatedStories = [newStory, ...currentStories];
    
    this.storiesSubject.next(updatedStories);
    this.saveToStorage(updatedStories);
    
    return newStory;
  }

  updateStory(storyId: string, updates: Partial<Story>): Story | null {
    const currentStories = this.stories;
    const storyIndex = currentStories.findIndex(s => s.id === storyId);
    
    if (storyIndex === -1) {
      console.error(`Story with id ${storyId} not found`);
      return null;
    }

    const updatedStory = { ...currentStories[storyIndex], ...updates };
    const updatedStories = [...currentStories];
    updatedStories[storyIndex] = updatedStory;

    this.storiesSubject.next(updatedStories);
    this.saveToStorage(updatedStories);

    return updatedStory;
  }

  deleteStory(storyId: string): boolean {
    const currentStories = this.stories;
    const filteredStories = currentStories.filter(s => s.id !== storyId);
    
    if (filteredStories.length === currentStories.length) {
      console.error(`Story with id ${storyId} not found`);
      return false;
    }

    this.storiesSubject.next(filteredStories);
    this.saveToStorage(filteredStories);
    
    return true;
  }

  getStoryById(storyId: string): Story | null {
    return this.stories.find(s => s.id === storyId) || null;
  }

  duplicateStory(storyId: string): Story | null {
    const originalStory = this.getStoryById(storyId);
    if (!originalStory) {
      console.error(`Story with id ${storyId} not found`);
      return null;
    }

    const duplicatedStory = this.addStory({
      name: `${originalStory.name} (Copy)`,
      keywords: [...(originalStory.keywords || [])],
      blocks: originalStory.blocks ? JSON.parse(JSON.stringify(originalStory.blocks)) : [],
      description: originalStory.description
    });

    return duplicatedStory;
  }

 // Method to extract story data from your create-story flow
createStoryFromFlow(flowData: any): Story {
  // Extract keywords from the first userInput block with keywordGroups
  const keywords: string[] = [];
  if (flowData.canvasBlocks) {
    flowData.canvasBlocks.forEach((block: any) => {
      if (block.type === 'userInput' && block.keywordGroups) {
        block.keywordGroups.forEach((group: string[]) => {
          keywords.push(...group);
        });
      }
    });
  }

  // Create story name based on first block content or default
  let storyName = 'New Story';
  if (keywords.length > 0) {
    storyName = 'Keyword combination';
  } else if (flowData.canvasBlocks && flowData.canvasBlocks.length > 0) {
    const firstBlock = flowData.canvasBlocks[0];
    if (firstBlock.content) {
      storyName = firstBlock.content.substring(0, 30) + (firstBlock.content.length > 30 ? '...' : '');
    }
  }

  return this.addStory({
    name: storyName,
    keywords: keywords.length > 0 ? keywords : undefined,
    blocks: flowData.canvasBlocks || [],
    connections: flowData.connections || [], // Store connections data
    description: `Story created with ${flowData.canvasBlocks?.length || 0} blocks`
  });
}
}