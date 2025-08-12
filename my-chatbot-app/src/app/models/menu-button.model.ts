// src/app/shared/models/menu-button.model.ts
export interface MenuButton {
  id: string;
  label: string;
  type: 'action' | 'submenu' | 'weblink';
  parentId?: string;
  children?: MenuButton[];
  isActive: boolean;
  order: number;
  message?: string;
  url?: string;
  story?: string;
  template?: string;
  plugin?: string;
  metadata: any; // Use a more specific type if possible
}