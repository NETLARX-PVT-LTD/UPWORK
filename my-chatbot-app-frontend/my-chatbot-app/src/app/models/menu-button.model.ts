// src/app/models/menu-button.model.ts

export interface MenuButton {
  id: string;
  label: string;
  type: 'action' | 'submenu' | 'weblink';
  parentId?: string;
  isActive: boolean;
  order: number;
  
  // Action type specific fields
  message?: string;
  story?: string;
  template?: string;
  plugin?: string;
  
  // Weblink specific fields
  url?: string;
  
  // Submenu specific fields
  children?: MenuButton[];
  
  // Enhanced metadata
  metadata: {
    color?: string;
    icon?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    analytics?: {
      clickCount: number;
      lastClicked?: string;
    };
  };
}

export interface MenuButtonCreateRequest {
  label: string;
  type: 'action' | 'submenu' | 'weblink';
  parentId?: string;
  message?: string;
  story?: string;
  template?: string;
  plugin?: string;
  url?: string;
  metadata?: {
    color?: string;
    icon?: string;
    description?: string;
    tags?: string[];
  };
}

export interface MenuButtonUpdateRequest extends Partial<MenuButtonCreateRequest> {
  id: string;
  isActive?: boolean;
  order?: number;
}

// Validation interfaces
export interface MenuValidationError {
  field: string;
  message: string;
  code: string;
}

export interface MenuValidationResult {
  isValid: boolean;
  errors: MenuValidationError[];
  warnings: MenuValidationError[];
}

// Menu configuration
export interface MenuConfiguration {
  id: string;
  name: string;
  buttons: MenuButton[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: MenuSettings;
}

export interface MenuSettings {
  maxDepth: number;
  maxButtonsPerLevel: { [key: number]: number };
  allowedTypes: string[];
  defaultColors: string[];
  enableAnalytics: boolean;
  enableDragDrop: boolean;
}

// Statistics
export interface MenuStats {
  totalButtons: number;
  maxDepth: number;
  actionButtons: number;
  submenuButtons: number;
  weblinkButtons: number;
  activeButtons: number;
  inactiveButtons: number;
  buttonsByLevel: { [key: number]: number };
  mostUsedButtons?: MenuButton[];
  leastUsedButtons?: MenuButton[];
}

// Export/Import
export interface MenuExportData {
  version: string;
  exportDate: string;
  menu: MenuButton[];
  metadata: {
    totalButtons: number;
    maxDepth: number;
    exportedBy?: string;
    notes?: string;
  };
}

export interface MenuImportResult {
  success: boolean;
  menu?: MenuButton[];
  error?: string;
  warnings?: string[];
  importedCount?: number;
  skippedCount?: number;
}