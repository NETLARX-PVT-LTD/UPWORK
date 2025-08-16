// src/app/chatbot-menu/chatbot-menu.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatbotMenuService, MenuValidationResult } from '../shared/services/chatbot-menu.service';
import { MenuButton } from '../models/menu-button.model';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chatbot-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot-menu.component.html',
  styleUrls: ['./chatbot-menu.component.scss']
})
export class ChatbotMenuComponent implements OnInit, OnDestroy {
  @ViewChild('textMessageInput', { static: false }) textMessageInput!: ElementRef<HTMLTextAreaElement>;
  
  private destroy$ = new Subject<void>();
  botId: string = 'bot-3';
  
  // Add these new properties for edit functionality
  editingButtonId: string | null = null;
  isEditMode: boolean = false;

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

  // New properties for enhanced functionality
  showCreateStoryModal: boolean = false;
  newStoryName: string = '';
  isCreatingStory: boolean = false;

  // Variable functionality properties
  showVariableDropdown: boolean = false;
  searchVariable: string = '';
  availableVariables = [
    { category: 'General Attributes', variables: [
      { name: 'first_name', display: '{first_name}' },
      { name: 'last_name', display: '{last_name}' },
      { name: 'timezone', display: '{timezone}' },
      { name: 'gender', display: '{gender}' },
      { name: 'last_user_msg', display: '{last_user_msg}' },
      { name: 'last_page', display: '{last_page}' },
      { name: 'os', display: '{os}' }
    ]},
    { category: 'Form Attributes', variables: [
      { name: 'user/last_user_message', display: '{user/last_user_message}' },
      { name: 'user/last_bot_message', display: '{user/last_bot_message}' },
      { name: 'user/created_at', display: '{user/created_at}' }
    ]}
  ];

  constructor(
    private chatbotMenuService: ChatbotMenuService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadMenuConfiguration();
    this.loadAvailableOptions();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.variable-dropdown-container')) {
      this.showVariableDropdown = false;
    }
  }

  // Variable functionality methods
  toggleVariableDropdown(event: Event): void {
    event.stopPropagation();
    this.showVariableDropdown = !this.showVariableDropdown;
    this.searchVariable = '';
  }

  insertVariable(variable: { name: string; display: string }, event: Event): void {
    event.stopPropagation();
    
    const textarea = this.textMessageInput?.nativeElement;
    if (textarea) {
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      
      // Insert variable at cursor position
      const textBefore = this.textMessage.substring(0, startPos);
      const textAfter = this.textMessage.substring(endPos);
      this.textMessage = textBefore + variable.display + textAfter;
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        const newCursorPos = startPos + variable.display.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    } else {
      // Fallback: append to end
      this.textMessage += variable.display;
    }
    
    this.showVariableDropdown = false;
    this.searchVariable = '';
  }

  getFilteredVariables() {
    if (!this.searchVariable.trim()) {
      return this.availableVariables;
    }
    
    const search = this.searchVariable.toLowerCase();
    return this.availableVariables.map(category => ({
      ...category,
      variables: category.variables.filter(variable => 
        variable.name.toLowerCase().includes(search) ||
        variable.display.toLowerCase().includes(search)
      )
    })).filter(category => category.variables.length > 0);
  }

  onVariableSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchVariable = input.value;
  }

  // Existing methods remain the same...
  private loadMenuConfiguration(): void {
    this.chatbotMenuService.getMenuConfiguration(this.botId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.menuButtons = config.buttons;
        this.updateCurrentMenu();
      });
  }

  private loadAvailableOptions(): void {
    this.chatbotMenuService.getAvailableStories(this.botId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(stories => this.availableStories = stories);
    
    this.chatbotMenuService.getAvailableTemplates(this.botId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(templates => this.availableTemplates = templates);
    
    this.chatbotMenuService.getAvailablePlugins(this.botId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(plugins => this.availablePlugins = plugins);
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
    this.clearValidationErrors();
  }

  onTabChange(tab: 'message' | 'story' | 'template' | 'plugin'): void {
    this.selectedTab = tab;
    this.clearValidationErrors();
    this.showVariableDropdown = false; // Close dropdown when switching tabs
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

  private validateForm(): boolean {
    this.validationErrors = [];

    if (!this.buttonLabel?.trim()) {
      this.validationErrors.push('Menu button label is required');
    }

    if (this.selectedButtonType === 'weblink') {
      if (!this.buttonUrl?.trim()) {
        this.validationErrors.push('Web URL is required for weblink buttons');
      } else if (!this.chatbotMenuService.isValidUrl(this.buttonUrl)) {
        this.validationErrors.push('Please enter a valid URL');
      }
    }

    if (this.selectedButtonType === 'action') {
      switch (this.selectedTab) {
        case 'message':
          if (!this.textMessage.trim()) {
            this.validationErrors.push('Text message is required');
          }
          break;
        case 'story':
          if (!this.selectedStory) {
            this.validationErrors.push('Please select a story');
          }
          break;
        case 'template':
          if (!this.selectedTemplate) {
            this.validationErrors.push('Please select a template');
          }
          break;
        case 'plugin':
          if (!this.selectedPlugin) {
            this.validationErrors.push('Please select a plugin');
          }
          break;
      }
    }

    // Check button limit
    const maxButtons = this.getMaxButtonsForLevel();
    if (this.currentMenu.length >= maxButtons) {
      this.validationErrors.push(`Maximum ${maxButtons} buttons allowed at this level`);
    }

    return this.validationErrors.length === 0;
  }

  private clearValidationErrors(): void {
    this.validationErrors = [];
  }

  // Rest of your existing methods...
  toggleButtonStatus(button: MenuButton, event: Event): void {
    event.stopPropagation();
    button.isActive = !button.isActive;
    const updatedMenu = this.chatbotMenuService.updateButton(this.menuButtons, button);
    this.menuButtons = updatedMenu;
    this.hasUnsavedChanges = true;
  }

  saveMenu(): void {
    this.isLoading = true;
    this.chatbotMenuService.saveMenuConfiguration(this.botId, this.menuButtons)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.hasUnsavedChanges = false;
          alert('Menu saved successfully!');
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Save failed:', err);
          alert('Failed to save menu. Please try again.');
        }
      });
  }

  saveWithInputDisabled(): void {
    console.log('Save with input disabled clicked');
  }
  
  openCreateStoryModal(): void {
    this.router.navigate(['/create-story']);
  }

  closeCreateStoryModal(): void {
    this.showCreateStoryModal = false;
    this.newStoryName = '';
  }

  createStory(): void {
    if (!this.newStoryName.trim()) {
      return;
    }

    this.isCreatingStory = true;
    
    setTimeout(() => {
      this.availableStories.push(this.newStoryName);
      this.selectedStory = this.newStoryName;
      this.isCreatingStory = false;
      this.closeCreateStoryModal();
    }, 1000);
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

  private getButtonColor(): string {
    const colors = ['#87ceeb', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
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

  duplicateButton(button: MenuButton, event: Event): void {
    event.stopPropagation();
    
    const duplicatedButton: MenuButton = {
      ...button,
      id: this.generateId(),
      label: `${button.label} (Copy)`,
      order: this.currentMenu.length + 1,
      metadata: {
        ...button.metadata,
        createdAt: new Date().toISOString()
      }
    };

    const updatedMenu = this.chatbotMenuService.addButton(this.menuButtons, duplicatedButton, this.currentParentId ?? undefined);
    this.menuButtons = updatedMenu;
    this.updateCurrentMenu();
    this.hasUnsavedChanges = true;
  }

  startTutorial(): void {
    console.log('Starting tutorial...');
  }

  editButton(button: MenuButton, event: Event): void {
    event.stopPropagation();
    console.log('Edit button clicked:', button);
    
    this.isEditMode = true;
    this.editingButtonId = button.id;
    
    this.buttonLabel = button.label;
    this.selectedButtonType = button.type;
    
    if (button.type === 'action') {
      if (button.message) {
        this.selectedTab = 'message';
        this.textMessage = button.message;
      } else if (button.story) {
        this.selectedTab = 'story';
        this.selectedStory = button.story;
      } else if (button.template) {
        this.selectedTab = 'template';
        this.selectedTemplate = button.template;
      } else if (button.plugin) {
        this.selectedTab = 'plugin';
        this.selectedPlugin = button.plugin;
      }
    } else if (button.type === 'weblink') {
      this.buttonUrl = button.url || '';
    }
    
    this.clearValidationErrors();
  }

  addButton(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode && this.editingButtonId) {
      this.updateExistingButton();
    } else {
      this.addNewButton();
    }
  }

  private addNewButton(): void {
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
      metadata: {
        color: this.getButtonColor(),
        createdAt: new Date().toISOString()
      }
    };
    
    const updatedMenu = this.chatbotMenuService.addButton(this.menuButtons, newButton, this.currentParentId ?? undefined);
    this.menuButtons = updatedMenu;
    this.updateCurrentMenu();
    this.hasUnsavedChanges = true;
    this.resetForm();
  }

  private updateExistingButton(): void {
    const existingButton = this.chatbotMenuService.findButtonById(this.menuButtons, this.editingButtonId!);
    if (!existingButton) return;

    const updatedButton: MenuButton = {
      ...existingButton,
      label: this.buttonLabel,
      type: this.selectedButtonType,
      message: this.selectedButtonType === 'action' && this.selectedTab === 'message' ? this.textMessage : undefined,
      story: this.selectedButtonType === 'action' && this.selectedTab === 'story' ? this.selectedStory! : undefined,
      template: this.selectedButtonType === 'action' && this.selectedTab === 'template' ? this.selectedTemplate! : undefined,
      plugin: this.selectedButtonType === 'action' && this.selectedTab === 'plugin' ? this.selectedPlugin! : undefined,
      url: this.selectedButtonType === 'weblink' ? this.buttonUrl : undefined,
      children: this.selectedButtonType === 'submenu' ? (existingButton.children || []) : undefined,
      metadata: {
        ...existingButton.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    const updatedMenu = this.chatbotMenuService.updateButton(this.menuButtons, updatedButton);
    this.menuButtons = updatedMenu;
    this.updateCurrentMenu();
    this.hasUnsavedChanges = true;
    this.resetForm();
  }

  removeButton(buttonId: string, event: Event): void {
    event.stopPropagation();
    console.log('Delete button clicked:', buttonId);
  
    const buttonToDelete = this.chatbotMenuService.findButtonById(this.menuButtons, buttonId);
    const buttonLabel = buttonToDelete?.label || 'this button';
    
    const confirmMessage = `Are you sure you want to delete "${buttonLabel}"?` + 
      (buttonToDelete?.children?.length ? `\n\nThis will also delete ${buttonToDelete.children.length} submenu items.` : '');
    
    if (confirm(confirmMessage)) {
      const updatedMenu = this.chatbotMenuService.removeButton(this.menuButtons, buttonId);
      this.menuButtons = updatedMenu;
      this.updateCurrentMenu();
      this.hasUnsavedChanges = true;
      
      if (this.editingButtonId === buttonId) {
        this.cancelEdit();
      }
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingButtonId = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.buttonLabel = '';
    this.textMessage = '';
    this.selectedStory = null;
    this.selectedTemplate = null;
    this.selectedPlugin = null;
    this.buttonUrl = '';
    this.selectedTab = 'message';
    this.isEditMode = false;
    this.editingButtonId = null;
    this.showVariableDropdown = false;
    this.searchVariable = '';
    this.clearValidationErrors();
  }

  getAddButtonText(): string {
    return this.isEditMode ? 'Update Button' : 'Add Button';
  }

  isEditingButton(buttonId: string): boolean {
    return this.isEditMode && this.editingButtonId === buttonId;
  }

  getEditButtonClass(buttonId: string): string {
    return this.isEditingButton(buttonId) ? 'ring-2 ring-yellow-400 ring-opacity-75' : '';
  }
}