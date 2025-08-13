// src/app/shared/services/chatbot-menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MenuButton } from '../../models/menu-button.model'; // Correct import

export interface MenuConfiguration {
  id: string;
  name: string;
  buttons: MenuButton[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    maxDepth: number;
    maxButtonsPerLevel: { [key: number]: number };
    allowedTypes: string[];
  };
}

export interface MenuValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MenuStats {
  totalButtons: number;
  maxDepth: number;
  actionButtons: number;
  submenuButtons: number;
  weblinkButtons: number;
  activeButtons: number;
  inactiveButtons: number;
  buttonsByLevel: { [key: number]: number };
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotMenuService {
  private apiUrl = 'your-api-base-url'; // Replace with your actual API URL
  private menuSubject = new BehaviorSubject<MenuButton[]>([]);
  public menu$ = this.menuSubject.asObservable();

private defaultSettings = {
  maxDepth: 3,
  // Change the value for level 1 from 3 to 5
  maxButtonsPerLevel: { 1: 5, 2: 5, 3: 5 } as { [key: number]: number },
  allowedTypes: ['action', 'submenu', 'weblink']
};

  constructor(private http: HttpClient) {}

  public getMaxButtonsPerLevel(): { [key: number]: number } {
    return this.defaultSettings.maxButtonsPerLevel;
  }
  
  // API Methods
  getMenuConfiguration(botId: string): Observable<MenuConfiguration> {
    return of({
      id: botId,
      name: `Bot ${botId} Menu`,
      buttons: this.getSampleMenuData(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: this.defaultSettings
    });
  }

  saveMenuConfiguration(botId: string, menuData: MenuButton[]): Observable<MenuConfiguration> {
    console.log('Saving menu for bot:', botId, menuData);
    return of({
      id: botId,
      name: `Bot ${botId} Menu`,
      buttons: menuData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: this.defaultSettings
    });
  }

  updateMenuConfiguration(botId: string, menuData: MenuButton[]): Observable<MenuConfiguration> {
    console.log('Updating menu for bot:', botId, menuData);
    return of({
      id: botId,
      name: `Bot ${botId} Menu`,
      buttons: menuData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: this.defaultSettings
    });
  }

  deleteMenuButton(botId: string, buttonId: string): Observable<void> {
    console.log('Deleting button:', buttonId, 'for bot:', botId);
    return of(void 0);
  }

  getAvailableStories(botId: string): Observable<string[]> {
    return of([
      'Welcome Story',
      'Product Information',
      'Contact Support',
      'FAQ Story',
      'Pricing Information',
      'Demo Request',
      'Newsletter Signup'
    ]);
  }

  getAvailableTemplates(botId: string): Observable<string[]> {
    return of([
      'Customer Support Template',
      'Sales Inquiry Template',
      'Product Demo Template',
      'Feedback Collection Template',
      'Appointment Booking Template'
    ]);
  }

  getAvailablePlugins(botId: string): Observable<string[]> {
    return of([
      'Calendar Integration',
      'Payment Gateway',
      'CRM Integration',
      'Email Marketing',
      'Analytics Tracker',
      'File Upload',
      'Location Services'
    ]);
  }

  // Local State Management
  updateMenu(menu: MenuButton[]): void {
    this.menuSubject.next(menu);
  }

  getCurrentMenu(): MenuButton[] {
    return this.menuSubject.getValue();
  }

  // Enhanced Menu Validation
  validateMenuStructure(menu: MenuButton[]): MenuValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const usedIds = new Set<string>();

    const validateButton = (button: MenuButton, depth: number = 1, parentButton?: MenuButton) => {
      if (usedIds.has(button.id)) {
        errors.push(`Duplicate button ID: ${button.id}`);
      } else {
        usedIds.add(button.id);
      }

      if (!button.label?.trim()) {
        errors.push(`Button with ID ${button.id} is missing a label`);
      }

      if (!this.defaultSettings.allowedTypes.includes(button.type)) {
        errors.push(`Invalid button type "${button.type}" for button "${button.label}"`);
      }

      if (depth > this.defaultSettings.maxDepth) {
        errors.push(`Menu nesting too deep at button "${button.label}". Maximum depth is ${this.defaultSettings.maxDepth} levels.`);
      }

      if (button.type === 'action') {
        const hasContent = button.message?.trim() || button.story || button.template || button.plugin;
        if (!hasContent) {
          errors.push(`Action button "${button.label}" must have content (message, story, template, or plugin)`);
        }
      }

      if (button.type === 'weblink') {
        if (!button.url?.trim()) {
          errors.push(`Weblink button "${button.label}" must have a URL`);
        } else if (!this.isValidUrl(button.url)) {
          warnings.push(`Button "${button.label}" has an invalid URL format`);
        }
      }

      if (button.type === 'submenu') {
        if (depth >= this.defaultSettings.maxDepth) {
          errors.push(`Submenu button "${button.label}" cannot be created at maximum depth`);
        }
        if (!button.children || button.children.length === 0) {
          warnings.push(`Submenu button "${button.label}" has no children`);
        }
      }

      if (button.parentId && parentButton && button.parentId !== parentButton.id) {
        warnings.push(`Button "${button.label}" has mismatched parent ID`);
      }

      if (button.children && button.children.length > 0) {
        if (button.type !== 'submenu') {
          errors.push(`Button "${button.label}" has children but is not a submenu type`);
        }

        const maxButtons = this.defaultSettings.maxButtonsPerLevel[depth + 1] || 5;
        if (button.children.length > maxButtons) {
          errors.push(`Submenu "${button.label}" has ${button.children.length} buttons, but level ${depth + 1} allows maximum ${maxButtons}`);
        }

        button.children.forEach((child: MenuButton) => validateButton(child, depth + 1));
      }
    };

    const maxRootButtons = this.defaultSettings.maxButtonsPerLevel[1] || 3;
    if (menu.length > maxRootButtons) {
      errors.push(`Root level has ${menu.length} buttons, but maximum allowed is ${maxRootButtons}`);
    }

    menu.forEach(button => validateButton(button));

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Utility Methods
  exportMenu(menu: MenuButton[]): string {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      menu: menu,
      metadata: {
        totalButtons: this.countTotalButtons(menu),
        maxDepth: this.calculateMaxDepth(menu)
      }
    };
    return JSON.stringify(exportData, null, 2);
  }

  importMenu(jsonString: string): { success: boolean; menu?: MenuButton[]; error?: string } {
    try {
      const importData = JSON.parse(jsonString);
      let menu: MenuButton[];

      if (importData.menu) {
        menu = importData.menu;
      } else if (Array.isArray(importData)) {
        menu = importData;
      } else {
        return { success: false, error: 'Invalid menu format' };
      }

      const validation = this.validateMenuStructure(menu);
      
      if (validation.isValid) {
        return { success: true, menu };
      } else {
        return { 
          success: false, 
          error: `Validation failed: ${validation.errors.join(', ')}` 
        };
      }
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' };
    }
  }

  cloneMenu(menu: MenuButton[]): MenuButton[] {
    return JSON.parse(JSON.stringify(menu));
  }

  findButtonById(menu: MenuButton[], id: string): MenuButton | null {
    for (const button of menu) {
      if (button.id === id) {
        return button;
      }
      if (button.children) {
        const found = this.findButtonById(button.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  findButtonPath(menu: MenuButton[], targetId: string): MenuButton[] {
    const path: MenuButton[] = [];
    
    const search = (buttons: MenuButton[]): boolean => {
      for (const button of buttons) {
        path.push(button);
        
        if (button.id === targetId) {
          return true;
        }
        
        if (button.children && search(button.children)) {
          return true;
        }
        
        path.pop();
      }
      return false;
    };
    
    search(menu);
    return path;
  }

  // Enhanced Menu Statistics
  getMenuStats(menu: MenuButton[]): MenuStats {
    let totalButtons = 0;
    let actionButtons = 0;
    let submenuButtons = 0;
    let weblinkButtons = 0;
    let activeButtons = 0;
    let inactiveButtons = 0;
    let maxDepth = 0;
    const buttonsByLevel: { [key: number]: number } = {};

    const traverse = (buttons: MenuButton[], depth: number = 1) => {
      maxDepth = Math.max(maxDepth, depth);
      buttonsByLevel[depth] = (buttonsByLevel[depth] || 0) + buttons.length;
      
      buttons.forEach(button => {
        totalButtons++;
        
        switch (button.type) {
          case 'action':
            actionButtons++;
            break;
          case 'submenu':
            submenuButtons++;
            break;
          case 'weblink':
            weblinkButtons++;
            break;
        }

        if (button.isActive !== false) {
          activeButtons++;
        } else {
          inactiveButtons++;
        }

        if (button.children && button.children.length > 0) {
          traverse(button.children, depth + 1);
        }
      });
    };

    traverse(menu);

    return {
      totalButtons,
      maxDepth,
      actionButtons,
      submenuButtons,
      weblinkButtons,
      activeButtons,
      inactiveButtons,
      buttonsByLevel
    };
  }

  // Menu Operations
  addButton(menu: MenuButton[], newButton: MenuButton, parentId?: string): MenuButton[] {
    const updatedMenu = this.cloneMenu(menu);
    
    if (parentId) {
      const parent = this.findButtonById(updatedMenu, parentId);
      if (parent && parent.type === 'submenu') {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(newButton);
      }
    } else {
      updatedMenu.push(newButton);
    }
    
    return updatedMenu;
  }

  removeButton(menu: MenuButton[], buttonId: string): MenuButton[] {
    const updatedMenu = this.cloneMenu(menu);
    
    const removeRecursive = (buttons: MenuButton[]): boolean => {
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].id === buttonId) {
          buttons.splice(i, 1);
          return true;
        }
        if (buttons[i].children && removeRecursive(buttons[i].children!)) {
          return true;
        }
      }
      return false;
    };
    
    removeRecursive(updatedMenu);
    return updatedMenu;
  }

  updateButton(menu: MenuButton[], updatedButton: MenuButton): MenuButton[] {
    const updatedMenu = this.cloneMenu(menu);
    
    const updateRecursive = (buttons: MenuButton[]): boolean => {
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].id === updatedButton.id) {
          buttons[i] = { ...updatedButton };
          return true;
        }
        if (buttons[i].children && updateRecursive(buttons[i].children!)) {
          return true;
        }
      }
      return false;
    };
    
    updateRecursive(updatedMenu);
    return updatedMenu;
  }

  reorderButtons(menu: MenuButton[], parentId: string | null, newOrder: string[]): MenuButton[] {
    const updatedMenu = this.cloneMenu(menu);
    
    if (parentId) {
      const parent = this.findButtonById(updatedMenu, parentId);
      if (parent && parent.children) {
        parent.children = this.reorderButtonArray(parent.children, newOrder);
      }
    } else {
      return this.reorderButtonArray(updatedMenu, newOrder);
    }
    
    return updatedMenu;
  }

  // Helper Methods
  private reorderButtonArray(buttons: MenuButton[], newOrder: string[]): MenuButton[] {
    const buttonMap = new Map(buttons.map(button => [button.id, button]));
    const reordered: MenuButton[] = [];
    
    newOrder.forEach((id, index) => {
      const button = buttonMap.get(id);
      if (button) {
        button.order = index + 1;
        reordered.push(button);
      }
    });
    
    return reordered;
  }

  private countTotalButtons(menu: MenuButton[]): number {
    let count = menu.length;
    menu.forEach(button => {
      if (button.children) {
        count += this.countTotalButtons(button.children);
      }
    });
    return count;
  }

  private calculateMaxDepth(menu: MenuButton[], currentDepth: number = 1): number {
    let maxDepth = currentDepth;
    menu.forEach(button => {
      if (button.children && button.children.length > 0) {
        const childDepth = this.calculateMaxDepth(button.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    return maxDepth;
  }

  public isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private getSampleMenuData(): MenuButton[] {
    return [
      {
        id: 'get-started',
        type: 'action',
        label: 'Get Started',
        message: 'Welcome! How can I help you today?',
        isActive: true,
        order: 1,
        metadata: {
          color: '#87ceeb',
          icon: 'fas fa-play',
          description: 'Welcome message for new users'
        }
      },
      {
        id: 'electronics',
        type: 'submenu',
        label: 'Electronics',
        isActive: true,
        order: 2,
        metadata: {
          color: '#4ecdc4',
          icon: 'fas fa-tv',
          description: 'Electronics category'
        },
        children: [
          {
            id: 'tv-category',
            type: 'submenu',
            label: 'TV',
            parentId: 'electronics',
            isActive: true,
            order: 1,
            metadata: {
              color: '#45b7d1',
              icon: 'fas fa-desktop'
            },
            children: [
              {
                id: 'cellphone-info',
                type: 'action',
                label: 'Cellphone',
                message: 'Tell me about our cellphone selection',
                parentId: 'tv-category',
                isActive: true,
                order: 1,
                metadata: {} // Added
              },
              {
                id: 'samsung-products',
                type: 'action',
                label: 'Samsung',
                message: 'Show Samsung products',
                parentId: 'tv-category',
                isActive: true,
                order: 2,
                metadata: {} // Added
              }
            ]
          }
        ]
      },
      {
        id: 'get-human-help',
        type: 'action',
        label: 'Get Human Help',
        story: 'human_help',
        isActive: true,
        order: 3,
        metadata: {} // Added
      }
    ];
  }
}

// Remove this line to fix the isolatedModules error
// export { MenuButton };