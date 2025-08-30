import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  isFromUser: boolean;
  type: 'text' | 'image' | 'file';
}

interface UserAttribute {
  key: string;
  value: string;
}

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss']
})
export class LiveChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
private subscription: Subscription = new Subscription();
constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}
  // Modal states
  showTranslateModal: boolean = false;
  translateLanguage: string = 'English';
  showSendStoryModal: boolean = false;
  showAddMessageModal: boolean = false;
  showFileUploadInput: boolean = false;
showAddMessageInput: boolean = false;
  // Status dropdown
  isStatusDropdownOpen: boolean = false;
  currentStatus: 'Active' | 'Inactive' = 'Active';
  
  // Success notification
  successMessage: string = '';
  showSuccessMessage: boolean = false;
  
  // Sidebar tab
  activeSidebarTab: 'details' | 'attributes' = 'details';
  
  // Message input
  additionalMessage: string = '';

  // Chat data
  users: ChatUser[] = [];
  filteredUsers: ChatUser[] = [];
  selectedUser: ChatUser | null = null;
  messages: { [userId: string]: ChatMessage[] } = {};
  currentMessages: ChatMessage[] = [];

  // Filters and input
  searchTerm = '';
  activeFilter: 'all' | 'open' | 'closed' = 'all';
  newMessage = '';

  private shouldScroll = false;

   ngOnInit() {
    // Subscribe to users from the service
    this.subscription.add(
      this.userService.getUsers().subscribe(users => {
        this.users = users;
        this.filterUsers();
      })
    );

    // Check if we have a userId from query params (from user list navigation)
    this.subscription.add(
      this.route.queryParams.subscribe(params => {
        if (params['userId']) {
          const user = this.userService.getUserById(params['userId']);
          if (user) {
            this.selectUser(user);
          }
        }
      })
    );

    this.initializeData(); // Keep your existing message initialization
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  initializeData() {
    this.users = [
      {
        id: '1',
        name: 'Test User',
        lastMessage: 'aman',
        timestamp: new Date(Date.now() - 5 * 60000),
        unreadCount: 0,
        status: 'open',
        isAnonymous: false,
        source: 'Website',
        country: 'India',
        os: 'Windows 10',
        lastConverse: '2025-08-16 06:41:29',
        phone: 'N/A',
        currentPage: 'https://app.botsify.com/bot/menu',
        assignedTo: 'Vijai',
        satisfaction: 4,
        email: 'anonymous@test.com',
        fbid: 'TestUser',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      {
        id: '2',
        name: 'Anonymous 4',
        lastMessage: '',
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60000),
        unreadCount: 3,
        status: 'open',
        isAnonymous: true,
        source: 'Website',
        country: 'India',
        os: 'Windows 10',
        lastConverse: '2025-08-16 06:41:29',
        assignedTo: 'Vijai',
        satisfaction: 3,
        email: 'anonymous@test.com',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
      },
      {
        id: '3',
        name: 'Anonymous 3',
        lastMessage: 'How are you?',
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60000),
        unreadCount: 7,
        status: 'open',
        isAnonymous: true,
        source: 'Website',
        country: 'India',
        os: 'Windows 10',
        lastConverse: '2025-08-16 06:41:29',
        assignedTo: 'Vijai',
        satisfaction: 2,
        email: 'anonymous@test.com'
      },
      {
        id: '4',
        name: 'Anonymous 2',
        lastMessage: 'hello',
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60000),
        unreadCount: 19,
        status: 'closed',
        isAnonymous: true,
        source: 'Website',
        country: 'India',
        os: 'Windows 10',
        lastConverse: '2025-08-16 06:41:29',
        assignedTo: 'Vijai',
        satisfaction: 1,
        email: 'anonymous@test.com'
      },
      {
        id: '5',
        name: 'Anonymous 1',
        lastMessage: 'hi',
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60000),
        unreadCount: 2,
        status: 'closed',
        isAnonymous: true,
        source: 'Website',
        country: 'India',
        os: 'Windows 10',
        lastConverse: '2025-08-16 06:41:29',
        assignedTo: 'Vijai',
        satisfaction: 5,
        email: 'anonymous@test.com',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
      }
    ];

    this.messages = {
      '1': [
        {
          id: '1',
          userId: '1',
          message: 'Hello there!',
          timestamp: new Date(Date.now() - 10 * 60000),
          isFromUser: true,
          type: 'text'
        },
        {
          id: '2',
          userId: '1',
          message: 'Hi! How can I help you today?',
          timestamp: new Date(Date.now() - 8 * 60000),
          isFromUser: false,
          type: 'text'
        },
        {
          id: '3',
          userId: '1',
          message: 'aman',
          timestamp: new Date(Date.now() - 5 * 60000),
          isFromUser: true,
          type: 'text'
        }
      ],
      '2': [
        {
          id: '4',
          userId: '2',
          message: 'Need some assistance',
          timestamp: new Date(Date.now() - 30 * 60000),
          isFromUser: true,
          type: 'text'
        }
      ]
    };
  }

  // Sidebar Tab Management
  setActiveSidebarTab(tab: 'details' | 'attributes'): void {
    this.activeSidebarTab = tab;
  }

  // Status Management
  setActive(): void {
    this.currentStatus = 'Active';
    this.isStatusDropdownOpen = false;
    this.showSuccessNotification('Test User has been marked active');
  }

  setInactive(): void {
    this.currentStatus = 'Inactive';
    this.isStatusDropdownOpen = false;
    this.showSuccessNotification('Test User has been marked inactive');
  }

  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  showSuccessNotification(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  // Filter and Search
  filterUsers() {
    let filtered = this.users;

    if (this.searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastMessage.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(user => user.status === this.activeFilter);
    }

    this.filteredUsers = filtered;
  }

  setFilter(filter: 'all' | 'open' | 'closed') {
    this.activeFilter = filter;
    this.filterUsers();
  }

  // User Selection
   selectUser(user: ChatUser) {
    this.selectedUser = user;
    this.currentMessages = this.messages[user.id] || [];
    
    // Reset unread count in service
    this.userService.resetUnreadCount(user.id);
    
    this.shouldScroll = true;
  }

  // Chat Actions
   closeChat() {
    if (this.selectedUser) {
      this.userService.updateUserStatus(this.selectedUser.id, 'closed');
      this.selectedUser = null;
      this.filterUsers();
    }
  }

  // Modified reopenChat to update service
  reopenChat(): void {
    if (this.selectedUser) {
      this.userService.updateUserStatus(this.selectedUser.id, 'open');
      this.filterUsers();
    }
  }

  // Message Handling
  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: this.selectedUser.id,
      message: this.newMessage.trim(),
      timestamp: new Date(),
      isFromUser: false,
      type: 'text'
    };

    if (!this.messages[this.selectedUser.id]) {
      this.messages[this.selectedUser.id] = [];
    }

    this.messages[this.selectedUser.id].push(message);
    this.currentMessages = this.messages[this.selectedUser.id];
    
    // Update last message in service
    this.userService.updateLastMessage(this.selectedUser.id, this.newMessage.trim());
    
    this.newMessage = '';
    this.shouldScroll = true;
  }

  sendAdditionalMessage() {
    if (!this.additionalMessage.trim() || !this.selectedUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: this.selectedUser.id,
      message: this.additionalMessage.trim(),
      timestamp: new Date(),
      isFromUser: false,
      type: 'text'
    };

    if (!this.messages[this.selectedUser.id]) {
      this.messages[this.selectedUser.id] = [];
    }

    this.messages[this.selectedUser.id].push(message);
    this.currentMessages = this.messages[this.selectedUser.id];
    this.selectedUser.lastMessage = this.additionalMessage.trim();
    this.selectedUser.timestamp = new Date();
    this.additionalMessage = '';
    this.shouldScroll = true;
    this.closeAddMessageModal();
  }

  loadMoreMessages() {
    console.log('Loading more messages...');
    // Implement pagination logic here
  }

  // File Handling
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedUser) {
      console.log('File selected:', file.name);
      // Implement file upload logic here
      
      // Add a file message
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: this.selectedUser.id,
        message: `File: ${file.name}`,
        timestamp: new Date(),
        isFromUser: false,
        type: 'file'
      };

      if (!this.messages[this.selectedUser.id]) {
        this.messages[this.selectedUser.id] = [];
      }

      this.messages[this.selectedUser.id].push(message);
      this.currentMessages = this.messages[this.selectedUser.id];
      this.selectedUser.lastMessage = `File: ${file.name}`;
      this.selectedUser.timestamp = new Date();
      this.shouldScroll = true;
    }
  }

  // Modal Management
  openTranslateModal(): void {
    this.showTranslateModal = true;
  }

  closeTranslateModal(): void {
    this.showTranslateModal = false;
  }

  openSendStoryModal(): void {
    this.showSendStoryModal = true;
  }

  closeSendStoryModal(): void {
    this.showSendStoryModal = false;
  }

  openAddMessageModal(): void {
    this.showAddMessageModal = true;
  }

  closeAddMessageModal(): void {
    this.showAddMessageModal = false;
    this.additionalMessage = '';
  }

  goToBotStoriesPage(): void {
    console.log('Navigating to bot stories page...');
    this.closeSendStoryModal();
    // Implement navigation logic
  }

  // Export and Delete
  exportChat(): void {
    if (this.selectedUser) {
      console.log(`Exporting chat with user: ${this.selectedUser.name}`);
      
      // Create downloadable content
      const chatData = this.currentMessages.map(msg => ({
        timestamp: msg.timestamp.toISOString(),
        sender: msg.isFromUser ? this.selectedUser!.name : 'Agent',
        message: msg.message
      }));

      const dataStr = JSON.stringify(chatData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat_${this.selectedUser.name}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

 deleteChat(): void {
    if (this.selectedUser && confirm(`Are you sure you want to delete the chat with ${this.selectedUser.name}?`)) {
      this.userService.deleteUser(this.selectedUser.id);
      delete this.messages[this.selectedUser.id];
      this.selectedUser = null;
      this.currentMessages = [];
      this.showSuccessNotification('Chat deleted successfully!');
    }
  }

  // Utility Methods
  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Mjg1RjQiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K';
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return `just now`;
    }
  }

  getMessageTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }

  // Language change handler
  onLanguageChange(event: any): void {
    this.translateLanguage = event.target.value;
    console.log('Selected language:', this.translateLanguage);
    // Implement translation logic here
  }
  toggleFileUploadInput(): void {
  this.showFileUploadInput = !this.showFileUploadInput;
  if (this.showFileUploadInput) {
    this.showAddMessageInput = false; // Hide other input if this one is shown
  }
}

toggleAddMessageInput(): void {
  this.showAddMessageInput = !this.showAddMessageInput;
  if (this.showAddMessageInput) {
    this.showFileUploadInput = false; // Hide other input if this one is shown
  }
}

}