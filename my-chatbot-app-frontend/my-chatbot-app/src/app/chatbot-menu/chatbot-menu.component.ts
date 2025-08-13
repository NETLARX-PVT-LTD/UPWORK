// src/app/chatbot-menu/chatbot-menu.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatbotMenuService, MenuValidationResult } from '../shared/services/chatbot-menu.service';
import { MenuButton } from '../models/menu-button.model'; // Correct import path

@Component({
  selector: 'app-chatbot-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot-menu.component.html',
  styleUrls: ['./chatbot-menu.component.scss']
})
export class ChatbotMenuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  botId: string = 'bot-3';

  menuButtons: MenuButton[] = [];
  currentMenu: MenuButton[] = [];

  currentParentId: string | null = null;
  navigationHistory: { parentId: string | null; title: string }[] = [];

  buttonLabel: string = '';
  selectedButtonType: 'action' | 'submenu' | 'weblink' = 'action';
  textMessage: string = '';
  selectedStory: string | null = null;
  selectedTemplate: string | null = null;
  selectedPlugin: string | null = null;
  buttonUrl: string = '';
  
  validationErrors: string[] = [];
  isLoading: boolean = false;
  hasUnsavedChanges: boolean = false;
  
  draggedButton: MenuButton | null = null;
  dragOverIndex: number = -1;
  
  availableStories: string[] = [];
  availableTemplates: string[] = [];
  availablePlugins: string[] = [];

  selectedTab: 'message' | 'story' | 'template' | 'plugin' = 'message';

  constructor(private chatbotMenuService: ChatbotMenuService) {}

  ngOnInit(): void {
    this.chatbotMenuService.getMenuConfiguration(this.botId).pipe(takeUntil(this.destroy$)).subscribe(config => {
        this.menuButtons = config.buttons;
        this.updateCurrentMenu();
    });

    this.chatbotMenuService.getAvailableStories(this.botId).pipe(takeUntil(this.destroy$)).subscribe(stories => this.availableStories = stories);
    this.chatbotMenuService.getAvailableTemplates(this.botId).pipe(takeUntil(this.destroy$)).subscribe(templates => this.availableTemplates = templates);
    this.chatbotMenuService.getAvailablePlugins(this.botId).pipe(takeUntil(this.destroy$)).subscribe(plugins => this.availablePlugins = plugins);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // --- UI and Navigation Logic ---
  
  navigateToSubmenu(button: MenuButton): void {
    if (button.type === 'submenu') {
      this.navigationHistory.push({
        parentId: this.currentParentId,
        title: this.getCurrentMenuTitle()
      });
      
      this.currentParentId = button.id;
      this.updateCurrentMenu();
    }
  }

  navigateBack(): void {
    if (this.navigationHistory.length > 0) {
      const lastState = this.navigationHistory.pop()!;
      this.currentParentId = lastState.parentId;
      this.updateCurrentMenu();
    }
  }
  
  canGoBack(): boolean {
    return this.navigationHistory.length > 0;
  }
  
  getCurrentMenuTitle(): string {
    if (!this.currentParentId) {
      return 'Chat Menu';
    }
    const parentButton = this.chatbotMenuService.findButtonById(this.menuButtons, this.currentParentId);
    return parentButton?.label || 'Submenu';
  }

  getMenuBreadcrumb(): string[] {
      const path = this.chatbotMenuService.findButtonPath(this.menuButtons, this.currentParentId!);
      const breadcrumbs = path.map(b => b.label);
      return ['Chat Menu', ...breadcrumbs];
  }
  
  private updateCurrentMenu(): void {
    if (this.currentParentId === null) {
      this.currentMenu = this.menuButtons;
    } else {
      const parentButton = this.chatbotMenuService.findButtonById(this.menuButtons, this.currentParentId);
      this.currentMenu = parentButton?.children || [];
    }
  }
  
  // --- Form Logic ---
  
  onButtonTypeChange(): void {
    this.textMessage = '';
    this.selectedStory = null;
    this.selectedTemplate = null;
    this.selectedPlugin = null;
    this.buttonUrl = '';
    this.selectedTab = 'message';
  }

  onTabChange(tab: 'message' | 'story' | 'template' | 'plugin'): void {
    this.selectedTab = tab;
  }
  
  isFormValid(): boolean {
    if (!this.buttonLabel?.trim()) return false;
    
    if (this.selectedButtonType === 'weblink') {
      return this.chatbotMenuService.isValidUrl(this.buttonUrl);
    }
    
    if (this.selectedButtonType === 'action') {
      switch (this.selectedTab) {
        case 'message': return !!this.textMessage.trim();
        case 'story': return !!this.selectedStory;
        case 'template': return !!this.selectedTemplate;
        case 'plugin': return !!this.selectedPlugin;
        default: return false;
      }
    }
    
    return true;
  }
  
  // --- Menu Operations (calling service methods) ---
  
  addButton(): void {
    const newButton: MenuButton = {
      id: this.generateId(),
      label: this.buttonLabel,
      type: this.selectedButtonType,
      parentId: this.currentParentId || undefined,
      isActive: true,
      order: this.currentMenu.length + 1,
      message: this.selectedButtonType === 'action' && this.selectedTab === 'message' ? this.textMessage : undefined,
      story: this.selectedButtonType === 'action' && this.selectedTab === 'story' ? this.selectedStory! : undefined,
      template: this.selectedButtonType === 'action' && this.selectedTab === 'template' ? this.selectedTemplate! : undefined,
      plugin: this.selectedButtonType === 'action' && this.selectedTab === 'plugin' ? this.selectedPlugin! : undefined,
      url: this.selectedButtonType === 'weblink' ? this.buttonUrl : undefined,
      children: this.selectedButtonType === 'submenu' ? [] : undefined,
      metadata: {} // Added this line to fix the error
    };
    
    const updatedMenu = this.chatbotMenuService.addButton(this.menuButtons, newButton, this.currentParentId ?? undefined);
    this.menuButtons = updatedMenu;
    this.updateCurrentMenu();
    this.hasUnsavedChanges = true;
    this.resetForm();
  }

  removeButton(buttonId: string, event: Event): void {
      event.stopPropagation();
      const updatedMenu = this.chatbotMenuService.removeButton(this.menuButtons, buttonId);
      this.menuButtons = updatedMenu;
      this.updateCurrentMenu();
      this.hasUnsavedChanges = true;
  }

  toggleButtonStatus(button: MenuButton, event: Event): void {
      event.stopPropagation();
      button.isActive = !button.isActive;
      const updatedMenu = this.chatbotMenuService.updateButton(this.menuButtons, button);
      this.menuButtons = updatedMenu;
      this.hasUnsavedChanges = true;
  }

  saveMenu(): void {
      this.isLoading = true;
      this.chatbotMenuService.saveMenuConfiguration(this.botId, this.menuButtons).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
              this.isLoading = false;
              this.hasUnsavedChanges = false;
              alert('Menu saved successfully!');
          },
          error: (err) => {
              this.isLoading = false;
              console.error('Save failed:', err);
              alert('Failed to save menu. Please check the console for errors.');
          }
      });
  }
  
  // --- Drag and Drop Logic ---
  
  onDragStart(event: DragEvent, index: number): void {
    if (this.currentMenu[index]) {
      this.draggedButton = this.currentMenu[index];
      event.dataTransfer?.setData('text/plain', JSON.stringify(this.draggedButton));
      event.dataTransfer!.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    if (this.draggedButton && this.draggedButton !== this.currentMenu[index]) {
      this.dragOverIndex = index;
    }
  }

  onDragLeave(): void {
    this.dragOverIndex = -1;
  }
  
  onDrop(event: DragEvent, dropIndex: number): void {
      event.preventDefault();
      this.dragOverIndex = -1;

      if (this.draggedButton) {
          const oldIndex = this.currentMenu.findIndex(b => b.id === this.draggedButton!.id);
          
          if (oldIndex !== -1) {
              const reorderedButtons = [...this.currentMenu];
              const [movedItem] = reorderedButtons.splice(oldIndex, 1);
              reorderedButtons.splice(dropIndex, 0, movedItem);

              const newOrder = reorderedButtons.map(b => b.id);
              
              const updatedMenu = this.chatbotMenuService.reorderButtons(this.menuButtons, this.currentParentId, newOrder);
              this.menuButtons = updatedMenu;
              this.updateCurrentMenu();
              this.hasUnsavedChanges = true;
          }
      }
      this.draggedButton = null;
  }
  
  // --- Utility methods ---
  
  private generateId(): string {
    return 'button-' + Math.random().toString(36).substring(2, 9);
  }
  
  private resetForm(): void {
    this.buttonLabel = '';
    this.textMessage = '';
    this.selectedStory = null;
    this.selectedTemplate = null;
    this.selectedPlugin = null;
    this.buttonUrl = '';
  }
  
  getCurrentLevel(): number {
      return this.navigationHistory.length + 1;
  }
  
  getMaxButtonsForLevel(): number {
      const currentLevel = this.getCurrentLevel();
      const maxButtonsPerLevel = this.chatbotMenuService.getMaxButtonsPerLevel();
      return maxButtonsPerLevel[currentLevel] || 5;
  }
  
  getRemainingSlots(): number {
      const maxButtons = this.getMaxButtonsForLevel();
      const currentButtons = this.currentMenu.length;
      return Math.max(0, maxButtons - currentButtons);
  }
  
  getFilteredCurrentMenu(): MenuButton[] {
      return this.currentMenu;
  }

  editButton(button: MenuButton, event: Event): void {
    event.stopPropagation();
    console.log('Edit button clicked:', button);
  }

  duplicateButton(button: MenuButton, event: Event): void {
    event.stopPropagation();
    console.log('Duplicate button clicked:', button);
  }
}