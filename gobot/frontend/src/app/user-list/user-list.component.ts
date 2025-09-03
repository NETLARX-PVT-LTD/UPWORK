import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  status: 'online' | 'offline' | 'open' | 'closed';
  isAnonymous: boolean;
  source: string;
  country: string;
  os: string;
  lastConverse: string;
  phone?: string;
  currentPage?: string;
  assignedTo?: string;
  satisfaction?: number;
  attributes?: UserAttribute[];
  email?: string;
  fbid?: string;
  locale?: string;
  referral?: string;
  isTestUser?: boolean;
}

interface UserAttribute {
  key: string;
  value: string;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @Input() users: ChatUser[] = [];
  
  // Edit functionality
editingAttributeIndex: number = -1;
editingAttributeKey = '';
editingAttributeValue = '';
editAttributeError = '';
// Dynamic attribute rows in Add User Attribute modal
attributeRows: { key: string; value: string }[] = [{ key: '', value: '' }];
  // Filter and search
  searchTerm = '';
  selectedFilter = 'All Users';
  dateRange = '';
  selectedAction = '';
  
  // Dropdown states
  showUserFilterDropdown = false;
  showActionDropdown = false;
  showDatePicker = false;
  
  // Date picker
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  selectedDateRange: DateRange = { startDate: null, endDate: null };
  
  // Confirmation modal
  showConfirmationModal = false;
  pendingAction: 'activate' | 'deactivate' | 'delete' | 'make_test_user' | 'remove_test_user' | 'delete_conversation' | null = null;
  
  // Success toast
  showSuccessToast = false;
  successMessage = '';
  
  // User Attributes Modal
  showUserAttributesModal = false;
  showAddAttributeModal = false;
  selectedUserForAttributes: ChatUser | null = null;
  newAttributeKey = '';
  newAttributeValue = '';
  addAttributeError = '';
  // Filter options
  userFilterOptions = [
    { label: 'All Users', value: 'All Users' },
    { label: 'Facebook Users', value: 'Facebook Users' },
    { label: 'Whatsapp Users', value: 'Whatsapp Users' },
    { label: 'SMS Users', value: 'SMS Users' }
  ];
  
  actionOptions = [
    { label: 'Activate', value: 'activate' },
    { label: 'Deactivate', value: 'deactivate' },
    { label: 'Delete', value: 'delete' },
    { label: 'Make Test User', value: 'make_test_user' },
    { label: 'Remove Test User', value: 'remove_test_user' },
    { label: 'Export', value: 'export' },
    { label: 'Add User Attribute', value: 'add_attribute' },
    { label: 'Delete Conversation', value: 'delete_conversation' }
  ];
  
  quickDateOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This month', value: 'this_month' },
    { label: 'Last month', value: 'last_month' }
  ];
  
  // Pagination
  currentPage = 1;
  recordsPerPage = 20;
  totalRecords = 0;
  
  // Selection
  selectedUsers: string[] = [];
  selectAll = false;
  
  // Filtered data
  filteredUsers: ChatUser[] = [];
  paginatedUsers: ChatUser[] = [];
  
  // Import modal
  showImportModal = false;
  selectedFile: File | null = null;
  isImporting = false;
  importError = '';
  importSuccess = false;
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.initializeData();
    this.applyFilters();
    this.updateDateRange();
  }
  
initializeData() {
    if (this.users.length === 0) {
      this.users = [
        {
          id: '1',
          name: 'Test User',
          lastMessage: 'aman',
          timestamp: new Date(Date.now() - 5 * 60000),
          unreadCount: 0,
          status: 'open',
          isAnonymous: false,
          source: 'website',
          country: 'India',
          os: 'Windows 10',
          lastConverse: '2025-08-16 06:41:29',
          phone: 'N/A',
          currentPage: 'https://app.botsify.com/bot/menu',
          assignedTo: 'Vijai',
          satisfaction: 4,
          email: 'test@test.com',
          fbid: 'TestUser',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          locale: 'en',
          referral: '-',
          isTestUser: false,
          attributes: [
            { key: 'last_user_button', value: 'Get Started Button' },
            { key: 'last_bot_message', value: 'hello! how are you?' },
            { key: 'last_user_message', value: 'hello' },
            { key: 'name', value: 'xyz' }
          ]
        },
        {
          id: '2',
          name: 'Anonymous 4',
          lastMessage: '',
          timestamp: new Date(Date.now() - 21 * 24 * 60 * 60000),
          unreadCount: 3,
          status: 'open',
          isAnonymous: true,
          source: 'website',
          country: 'India',
          os: 'Windows 10',
          lastConverse: '2025-08-16 06:41:29',
          assignedTo: 'Vijai',
          satisfaction: 3,
          email: 'anonymous@test.com',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          locale: 'en',
          referral: '-',
          isTestUser: false,
          attributes: []
        },
        {
          id: '3',
          name: 'Anonymous 3',
          lastMessage: 'How are you?',
          timestamp: new Date(Date.now() - 21 * 24 * 60 * 60000),
          unreadCount: 7,
          status: 'open',
          isAnonymous: true,
          source: 'website',
          country: 'India',
          os: 'Windows 10',
          lastConverse: '2025-08-16 06:41:29',
          assignedTo: 'Vijai',
          satisfaction: 2,
          email: 'anonymous@test.com',
          locale: 'en',
          referral: '-',
          isTestUser: true,
          attributes: []
        },
        {
          id: '4',
          name: 'Anonymous 2',
          lastMessage: 'hello',
          timestamp: new Date(Date.now() - 21 * 24 * 60 * 60000),
          unreadCount: 19,
          status: 'closed',
          isAnonymous: true,
          source: 'website',
          country: 'India',
          os: 'Windows 10',
          lastConverse: '2025-08-16 06:41:29',
          assignedTo: 'Vijai',
          satisfaction: 1,
          email: 'anonymous@test.com',
          locale: 'en',
          referral: '-',
          isTestUser: false,
          attributes: []
        },
        {
          id: '5',
          name: 'Anonymous 1',
          lastMessage: 'hi',
          timestamp: new Date(Date.now() - 21 * 24 * 60 * 60000),
          unreadCount: 2,
          status: 'closed',
          isAnonymous: true,
          source: 'website',
          country: 'India',
          os: 'Windows 10',
          lastConverse: '2025-08-16 06:41:29',
          assignedTo: 'Vijai',
          satisfaction: 5,
          email: 'anonymous@test.com',
          avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
          locale: 'en',
          referral: '-',
          isTestUser: false,
          attributes: []
        }
      ];
    }
    this.totalRecords = this.users.length;
  }
  
  // Add row functionality
addAttributeRow() {
  this.attributeRows.push({ key: '', value: '' });
}

// Remove row functionality
removeAttributeRow(index: number) {
  if (this.attributeRows.length > 1) {
    this.attributeRows.splice(index, 1);
  }
}

// Updated save method for multiple attributes
saveUserAttribute() {
  // Validate all rows
  let hasError = false;
  this.addAttributeError = '';
  
  for (let i = 0; i < this.attributeRows.length; i++) {
    const row = this.attributeRows[i];
    if (!row.key.trim() && !row.value.trim()) {
      // Skip empty rows
      continue;
    }
    if (!row.key.trim()) {
      this.addAttributeError = `Attribute key is required for row ${i + 1}.`;
      hasError = true;
      break;
    }
    if (!row.value.trim()) {
      this.addAttributeError = `Attribute value is required for row ${i + 1}.`;
      hasError = true;
      break;
    }
  }
  
  if (hasError) return;
  
  // Get valid rows
  const validRows = this.attributeRows.filter(row => row.key.trim() && row.value.trim());
  if (validRows.length === 0) {
    this.addAttributeError = 'At least one attribute is required.';
    return;
  }
  
  // Save attributes
  this.users.forEach(user => {
    if (this.selectedUsers.includes(user.id)) {
      if (!user.attributes) {
        user.attributes = [];
      }
      
      validRows.forEach(row => {
        const existingIndex = user.attributes!.findIndex(attr => attr.key === row.key.trim());
        if (existingIndex > -1) {
          user.attributes![existingIndex].value = row.value.trim();
        } else {
          user.attributes!.push({ key: row.key.trim(), value: row.value.trim() });
        }
      });
    }
  });
  
  this.successMessage = `Successfully added ${validRows.length} attribute${validRows.length > 1 ? 's' : ''} to ${this.selectedUsers.length} user${this.selectedUsers.length > 1 ? 's' : ''}`;
  this.showSuccessToast = true;
  setTimeout(() => { this.showSuccessToast = false; }, 3000);
  
  this.closeAddAttributeModal();
  this.resetSelection();
  this.applyFilters();
}

// Updated close method
closeAddAttributeModal() {
  this.showAddAttributeModal = false;
  this.attributeRows = [{ key: '', value: '' }];
  this.addAttributeError = '';
}

// Edit attribute functionality
startEditAttribute(index: number, attribute: UserAttribute) {
  this.editingAttributeIndex = index;
  this.editingAttributeKey = attribute.key;
  this.editingAttributeValue = attribute.value;
  this.editAttributeError = '';
}

cancelEditAttribute() {
  this.editingAttributeIndex = -1;
  this.editingAttributeKey = '';
  this.editingAttributeValue = '';
  this.editAttributeError = '';
}

saveEditAttribute() {
  if (!this.editingAttributeKey.trim()) {
    this.editAttributeError = 'Attribute key is required.';
    return;
  }
  
  if (!this.editingAttributeValue.trim()) {
    this.editAttributeError = 'Attribute value is required.';
    return;
  }
  
  if (this.selectedUserForAttributes && this.selectedUserForAttributes.attributes) {
    this.selectedUserForAttributes.attributes[this.editingAttributeIndex] = {
      key: this.editingAttributeKey.trim(),
      value: this.editingAttributeValue.trim()
    };
    
    this.successMessage = 'Successfully updated attribute';
    this.showSuccessToast = true;
    setTimeout(() => { this.showSuccessToast = false; }, 3000);
    
    this.cancelEditAttribute();
    this.applyFilters();
  }
}

// Check if user has attributes
userHasAttributes(user: ChatUser): boolean {
  return (user.attributes || []).length > 0;
}

  applyFilters() {
    let filtered = [...this.users];
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.country.toLowerCase().includes(term) ||
        user.source.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedFilter !== 'All Users') {
      // Add logic for different user types based on your requirements
      if (this.selectedFilter === 'Facebook Users') {
        filtered = filtered.filter(user => user.source === 'facebook');
      } else if (this.selectedFilter === 'Whatsapp Users') {
        filtered = filtered.filter(user => user.source === 'whatsapp');
      } else if (this.selectedFilter === 'SMS Users') {
        filtered = filtered.filter(user => user.source === 'sms');
      }
    }
    
    // Apply date range filter
    if (this.selectedDateRange.startDate && this.selectedDateRange.endDate) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.timestamp);
        return userDate >= this.selectedDateRange.startDate! && 
               userDate <= this.selectedDateRange.endDate!;
      });
    }
    
    this.filteredUsers = filtered;
    this.totalRecords = filtered.length;
    this.updatePagination();
  }
  
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }
  
  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }
  
  // Dropdown handlers
  toggleUserFilterDropdown(event: Event) {
    event.stopPropagation();
    this.showUserFilterDropdown = !this.showUserFilterDropdown;
    this.showActionDropdown = false;
    this.showDatePicker = false;
  }
  
  toggleActionDropdown(event: Event) {
    event.stopPropagation();
    if (this.hasSelectedUsers()) {
      this.showActionDropdown = !this.showActionDropdown;
      this.showUserFilterDropdown = false;
      this.showDatePicker = false;
    }
  }
  
  toggleDatePicker(event: Event) {
    event.stopPropagation();
    this.showDatePicker = !this.showDatePicker;
    this.showUserFilterDropdown = false;
    this.showActionDropdown = false;
  }
  
  closeAllDropdowns() {
    this.showUserFilterDropdown = false;
    this.showActionDropdown = false;
    this.showDatePicker = false;
  }
  
  hasSelectedUsers(): boolean {
    return this.selectedUsers.length > 0;
  }
  
  selectUserFilter(option: any) {
    this.selectedFilter = option.value;
    this.showUserFilterDropdown = false;
    this.currentPage = 1;
    this.applyFilters();
  }
  
 selectAction(option: any) {
  this.selectedAction = option.value;
  this.showActionDropdown = false;
  
  // Handle actions that require confirmation modal
  if (['activate', 'deactivate', 'delete', 'make_test_user', 'remove_test_user', 'delete_conversation'].includes(option.value)) {
    this.pendingAction = option.value;
    this.showConfirmationModal = true;
  } else if (option.value === 'export') {
    this.exportSelectedUsers();
  } else if (option.value === 'add_attribute') {
    this.openAddAttributeModal();
  } else {
    this.executeSelectedAction();
  }
}
  

// Export functionality
exportSelectedUsers() {
  if (this.selectedUsers.length === 0) return;
  
  const selectedUsersData = this.users.filter(user => this.selectedUsers.includes(user.id));
  
  const csvHeaders = [
    'Name', 'Email', 'Locale', 'Source', 'Created At', 'Country', 'OS', 'Phone', 'Referral', 'Test User', 'Status'
  ];
  
  const csvRows = selectedUsersData.map(user => [
    user.name || '',
    user.email || '',
    user.locale || '',
    user.source || '',
    this.formatDate(user.timestamp),
    user.country || '',
    user.os || '',
    user.phone || '',
    user.referral || '',
    user.isTestUser ? 'Yes' : 'No',
    user.status || ''
  ]);
  
  const csvContent = [csvHeaders, ...csvRows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  this.successMessage = `Successfully exported ${this.selectedUsers.length} user${this.selectedUsers.length > 1 ? 's' : ''}`;
  this.showSuccessToast = true;
  setTimeout(() => { this.showSuccessToast = false; }, 3000);
  
  this.resetSelection();
}

// Add User Attribute functionality
openAddAttributeModal() {
  if (this.selectedUsers.length === 0) return;
  this.showAddAttributeModal = true;
  this.newAttributeKey = '';
  this.newAttributeValue = '';
  this.addAttributeError = '';
}

// closeAddAttributeModal() {
//   this.showAddAttributeModal = false;
//   this.newAttributeKey = '';
//   this.newAttributeValue = '';
//   this.addAttributeError = '';
// }

// saveUserAttribute() {
//   if (!this.newAttributeKey.trim()) {
//     this.addAttributeError = 'Attribute key is required.';
//     return;
//   }
  
//   if (!this.newAttributeValue.trim()) {
//     this.addAttributeError = 'Attribute value is required.';
//     return;
//   }
  
//   const attributeKey = this.newAttributeKey.trim();
//   const attributeValue = this.newAttributeValue.trim();
  
//   this.users.forEach(user => {
//     if (this.selectedUsers.includes(user.id)) {
//       if (!user.attributes) {
//         user.attributes = [];
//       }
      
//       const existingAttributeIndex = user.attributes.findIndex(attr => attr.key === attributeKey);
//       if (existingAttributeIndex > -1) {
//         user.attributes[existingAttributeIndex].value = attributeValue;
//       } else {
//         user.attributes.push({ key: attributeKey, value: attributeValue });
//       }
//     }
//   });
  
//   this.successMessage = `Successfully added attribute "${attributeKey}" to ${this.selectedUsers.length} user${this.selectedUsers.length > 1 ? 's' : ''}`;
//   this.showSuccessToast = true;
//   setTimeout(() => { this.showSuccessToast = false; }, 3000);
  
//   this.closeAddAttributeModal();
//   this.resetSelection();
//   this.applyFilters();
// }

// Show User Attributes functionality
showUserAttributes(user: ChatUser) {
  this.selectedUserForAttributes = user;
  this.showUserAttributesModal = true;
}

closeUserAttributesModal() {
  this.showUserAttributesModal = false;
  this.selectedUserForAttributes = null;
}

deleteAttribute(user: ChatUser, attributeIndex: number) {
  if (user.attributes && attributeIndex >= 0 && attributeIndex < user.attributes.length) {
    const attributeKey = user.attributes[attributeIndex].key;
    user.attributes.splice(attributeIndex, 1);
    
    this.successMessage = `Successfully deleted attribute "${attributeKey}"`;
    this.showSuccessToast = true;
    setTimeout(() => { this.showSuccessToast = false; }, 3000);
    
    this.applyFilters();
  }
}

  // Confirmation Modal Methods
  closeConfirmationModal() {
    this.showConfirmationModal = false;
    this.pendingAction = null;
    this.selectedAction = '';
  }
  
  confirmAction() {
    if (this.pendingAction && this.selectedUsers.length > 0) {
      switch (this.pendingAction) {
        case 'activate':
        case 'deactivate':
          this.executeActivateDeactivate();
          break;
        case 'delete':
          this.executeDelete();
          break;
        case 'make_test_user':
          this.executeMakeTestUser();
          break;
        case 'remove_test_user':
          this.executeRemoveTestUser();
          break;
        case 'delete_conversation':
          this.executeDeleteConversation();
          break;
      }
    }
    this.closeConfirmationModal();
  }
  
  executeActivateDeactivate() {
    if (!this.pendingAction) return;
    
    const selectedUserCount = this.selectedUsers.length;
    const newStatus = this.pendingAction === 'activate' ? 'open' : 'closed';
    
    // Update status for selected users
    this.users.forEach(user => {
      if (this.selectedUsers.includes(user.id)) {
        user.status = newStatus;
      }
    });
    
    // Show success message
    const actionText = this.pendingAction === 'activate' ? 'activated' : 'deactivated';
    this.successMessage = `Status change ${actionText} for ${selectedUserCount} user${selectedUserCount > 1 ? 's' : ''}`;
    this.showSuccessToast = true;
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
    
    // Reset selection
    this.resetSelection();
    
    // Refresh the view
    this.applyFilters();
  }
  
  executeDelete() {
    const selectedUserCount = this.selectedUsers.length;
    
    // Remove selected users from the array
    this.users = this.users.filter(user => !this.selectedUsers.includes(user.id));
    
    // Show success message
    this.successMessage = `Successfully deleted ${selectedUserCount} user${selectedUserCount > 1 ? 's' : ''}`;
    this.showSuccessToast = true;
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
    
    // Reset selection
    this.resetSelection();
    
    // Refresh the view
    this.applyFilters();
  }
  
  executeMakeTestUser() {
    const selectedUserCount = this.selectedUsers.length;
    
    // Mark selected users as test users
    this.users.forEach(user => {
      if (this.selectedUsers.includes(user.id)) {
        user.isTestUser = true;
      }
    });
    
    // Show success message
    this.successMessage = `Successfully made ${selectedUserCount} user${selectedUserCount > 1 ? 's' : ''} as test user${selectedUserCount > 1 ? 's' : ''}`;
    this.showSuccessToast = true;
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
    
    // Reset selection
    this.resetSelection();
    
    // Refresh the view
    this.applyFilters();
  }
  
  executeRemoveTestUser() {
    const selectedUserCount = this.selectedUsers.length;
    
    // Remove test user status from selected users
    this.users.forEach(user => {
      if (this.selectedUsers.includes(user.id)) {
        user.isTestUser = false;
      }
    });
    
    // Show success message
    this.successMessage = `Successfully removed ${selectedUserCount} user${selectedUserCount > 1 ? 's' : ''} from test user${selectedUserCount > 1 ? 's' : ''}`;
    this.showSuccessToast = true;
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
    
    // Reset selection
    this.resetSelection();
    
    // Refresh the view
    this.applyFilters();
  }
  
  executeDeleteConversation() {
    const selectedUserCount = this.selectedUsers.length;
    
    // Clear conversation data for selected users
    this.users.forEach(user => {
      if (this.selectedUsers.includes(user.id)) {
        user.lastMessage = '';
        user.unreadCount = 0;
        user.lastConverse = '';
      }
    });
    
    // Show success message
    this.successMessage = `Successfully deleted conversation${selectedUserCount > 1 ? 's' : ''} for ${selectedUserCount} user${selectedUserCount > 1 ? 's' : ''}`;
    this.showSuccessToast = true;
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
    
    // Reset selection
    this.resetSelection();
    
    // Refresh the view
    this.applyFilters();
  }
  
  resetSelection() {
    this.selectedUsers = [];
    this.selectAll = false;
    this.selectedAction = '';
    this.pendingAction = null;
  }
  
  // Get modal title and description based on pending action
  getModalTitle(): string {
    switch (this.pendingAction) {
      case 'delete':
        return 'Delete Users?';
      case 'make_test_user':
        return 'Make Test Users?';
      case 'remove_test_user':
        return 'Remove Test Users?';
      case 'delete_conversation':
        return 'Delete Conversations?';
      default:
        return 'Are you sure?';
    }
  }
  
  getModalDescription(): string {
    const userCount = this.selectedUsers.length;
    const userText = userCount > 1 ? 'users' : 'user';
    
    switch (this.pendingAction) {
      case 'delete':
        return `This will permanently delete ${userCount} ${userText}. This action cannot be undone.`;
      case 'make_test_user':
        return `This will mark ${userCount} ${userText} as test ${userText}. Are you sure you want to continue?`;
      case 'remove_test_user':
        return `This will remove test user status from ${userCount} ${userText}. Are you sure you want to continue?`;
      case 'delete_conversation':
        return `This will permanently delete conversations for ${userCount} ${userText}. This action cannot be undone.`;
      default:
        return 'This action is irreversible. Are you sure you want to perform this action?';
    }
  }
  
  getConfirmButtonText(): string {
    switch (this.pendingAction) {
      case 'delete':
        return 'Yes, Delete it!';
      case 'make_test_user':
      case 'remove_test_user':
        return 'Yes, Update it!';
      case 'delete_conversation':
        return 'Yes, Delete it!';
      default:
        return 'Yes, Update it!';
    }
  }
  
  // ... Rest of the existing methods remain the same ...
  
  selectQuickDate(option: any) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch (option.value) {
      case 'today':
        this.selectedDateRange = { 
          startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
        };
        break;
      case 'yesterday':
        this.selectedDateRange = { 
          startDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
          endDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
        };
        break;
      case 'this_month':
        this.selectedDateRange = { 
          startDate: new Date(today.getFullYear(), today.getMonth(), 1),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
        };
        break;
      case 'last_month':
        this.selectedDateRange = { 
          startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
          endDate: new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59)
        };
        break;
    }
    
    this.updateDateRange();
    this.showDatePicker = false;
    this.applyFilters();
  }
  
  updateDateRange() {
    if (this.selectedDateRange.startDate && this.selectedDateRange.endDate) {
      const start = this.selectedDateRange.startDate;
      const end = this.selectedDateRange.endDate;
      this.dateRange = `${this.formatDateForInput(start)} - ${this.formatDateForInput(end)}`;
    }
  }
  
  formatDateForInput(date: Date): string {
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  }
  
  // Calendar methods
  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
  
  getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }
  
  getCalendarDays(month: number, year: number): (number | null)[] {
    const daysInMonth = this.getDaysInMonth(month, year);
    const firstDay = this.getFirstDayOfMonth(month, year);
    const days: (number | null)[] = [];
    
    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = this.getDaysInMonth(prevMonth, prevYear);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(daysInPrevMonth - i);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    // Next month days to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(day);
    }
    
    return days;
  }
  
  selectCalendarDate(day: number | null, isCurrentMonth: boolean) {
    if (day === null) return;
    
    let selectedDate: Date;
    if (isCurrentMonth) {
      selectedDate = new Date(this.currentYear, this.currentMonth, day);
    } else {
      // Handle prev/next month selection
      const month = day <= 15 ? this.currentMonth + 1 : this.currentMonth - 1;
      const year = month < 0 ? this.currentYear - 1 : month > 11 ? this.currentYear + 1 : this.currentYear;
      selectedDate = new Date(year, month < 0 ? 11 : month > 11 ? 0 : month, day);
    }
    
    if (!this.selectedDateRange.startDate || (this.selectedDateRange.startDate && this.selectedDateRange.endDate)) {
      this.selectedDateRange = { startDate: selectedDate, endDate: null };
    } else if (!this.selectedDateRange.endDate) {
      if (selectedDate < this.selectedDateRange.startDate) {
        this.selectedDateRange.endDate = this.selectedDateRange.startDate;
        this.selectedDateRange.startDate = selectedDate;
      } else {
        this.selectedDateRange.endDate = selectedDate;
      }
      this.updateDateRange();
      this.showDatePicker = false;
      this.applyFilters();
    }
  }
  
  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }
  
  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }
  
  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
  }
  
  isDateInRange(day: number | null, isCurrentMonth: boolean): boolean {
    if (day === null || !isCurrentMonth) return false;
    
    const date = new Date(this.currentYear, this.currentMonth, day);
    
    if (this.selectedDateRange.startDate && this.selectedDateRange.endDate) {
      return date >= this.selectedDateRange.startDate && date <= this.selectedDateRange.endDate;
    } else if (this.selectedDateRange.startDate) {
      return date.getTime() === this.selectedDateRange.startDate.getTime();
    }
    
    return false;
  }
  
  onRecordsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
  }
  
  // Selection methods
  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedUsers = this.paginatedUsers.map(user => user.id);
    } else {
      this.selectedUsers = [];
    }
  }
  
  toggleUserSelection(userId: string) {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
    
    this.selectAll = this.selectedUsers.length === this.paginatedUsers.length;
  }
  
  isUserSelected(userId: string): boolean {
    return this.selectedUsers.includes(userId);
  }
  
  // Action methods
  goToConversation(user: ChatUser) {
    this.router.navigate(['/live-chat'], { 
      queryParams: { userId: user.id } 
    });
  }
  
  // showUserAttributes(user: ChatUser) {
  //   console.log('Show attributes for:', user.name);
  // }
  
  importUsers() {
    this.showImportModal = true;
    this.selectedFile = null;
    this.importError = '';
    this.importSuccess = false;
  }
  
  closeImportModal() {
    this.showImportModal = false;
    this.selectedFile = null;
    this.importError = '';
    this.importSuccess = false;
    this.isImporting = false;
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.importError = 'Please select a valid CSV file.';
        this.selectedFile = null;
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.importError = 'File size must be less than 10MB.';
        this.selectedFile = null;
        return;
      }
      
      this.selectedFile = file;
      this.importError = '';
      this.importSuccess = false;
    }
  }
  
  triggerFileInput() {
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    fileInput?.click();
  }
  
  async performImport() {
    if (!this.selectedFile) {
      this.importError = 'Please select a CSV file first.';
      return;
    }
    
    this.isImporting = true;
    this.importError = '';
    
    try {
      const csvText = await this.readFileAsText(this.selectedFile);
      const importedUsers = await this.parseCsvData(csvText);
      
      // Add imported users to existing users
      const newUsers = importedUsers.filter(importedUser => 
        !this.users.some(existingUser => 
          existingUser.email === importedUser.email || 
          existingUser.name === importedUser.name
        )
      );
      
      if (newUsers.length === 0) {
        this.importError = 'No new users found. All users in the CSV already exist.';
        this.isImporting = false;
        return;
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new users
      this.users = [...this.users, ...newUsers];
      this.totalRecords = this.users.length;
      this.applyFilters();
      
      this.importSuccess = true;
      this.isImporting = false;
      
      // Auto-close modal after success
      setTimeout(() => {
        this.closeImportModal();
      }, 2000);
      
    } catch (error) {
      this.importError = 'Failed to import CSV file. Please check the file format and try again.';
      this.isImporting = false;
    }
  }
  
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
  
  private async parseCsvData(csvText: string): Promise<ChatUser[]> {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one data row.');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const users: ChatUser[] = [];
    
    // Expected CSV format: name,email,country,source,phone,locale,referral
    const requiredHeaders = ['name', 'email'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: Column count mismatch`);
        continue;
      }
      
      const userData: any = {};
      headers.forEach((header, index) => {
        userData[header] = values[index] || '';
      });
      
      // Create user object with defaults
      const user: ChatUser = {
        id: this.generateUserId(),
        name: userData.name || `Anonymous ${Date.now()}`,
        email: userData.email || '',
        country: userData.country || 'Unknown',
        source: userData.source || 'import',
        phone: userData.phone || '-',
        locale: userData.locale || 'en',
        referral: userData.referral || '-',
        lastMessage: '',
        timestamp: new Date(),
        unreadCount: 0,
        status: 'closed',
        isAnonymous: !userData.name || userData.name.toLowerCase().includes('anonymous'),
        os: 'Unknown',
        lastConverse: new Date().toISOString(),
        satisfaction: 0,
        isTestUser: false
      };
      
      users.push(user);
    }
    
    return users;
  }
  
  private generateUserId(): string {
    return 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  downloadSampleCsv() {
    const sampleData = [
      ['name', 'email', 'country', 'source', 'phone', 'locale', 'referral'],
      ['John Doe', 'john.doe@example.com', 'USA', 'website', '+1234567890', 'en', 'google'],
      ['Jane Smith', 'jane.smith@example.com', 'UK', 'facebook', '+4471234567', 'en', 'direct'],
      ['Anonymous User', 'anon@example.com', 'Canada', 'whatsapp', '-', 'en', '-']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_users.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }
  
  executeSelectedAction() {
    if (this.selectedAction && this.selectedUsers.length > 0) {
      console.log(`Executing ${this.selectedAction} on users:`, this.selectedUsers);
      // Reset selection after action
      this.selectedUsers = [];
      this.selectAll = false;
      this.selectedAction = '';
    }
  }
  
  // Pagination methods
  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  nextPage() {
    const maxPage = Math.ceil(this.totalRecords / this.recordsPerPage);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.recordsPerPage);
  }
  
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  // Utility methods
  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Mjg1RjQiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K';
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'open':
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'closed':
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }
  
  trackByUserId(index: number, user: ChatUser): string {
    return user.id;
  }
}