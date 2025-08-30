import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
}

interface UserAttribute {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<ChatUser[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers() {
    // Initialize with data that matches your live chat component
    const users: ChatUser[] = [
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
        referral: '-'
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
        referral: '-'
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
        referral: '-'
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
        referral: '-'
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
        referral: '-'
      }
    ];

    this.usersSubject.next(users);
  }

  getUsers(): Observable<ChatUser[]> {
    return this.users$;
  }

  getUserById(id: string): ChatUser | undefined {
    return this.usersSubject.value.find(user => user.id === id);
  }

  updateUser(updatedUser: ChatUser): void {
    const users = this.usersSubject.value;
    const index = users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      this.usersSubject.next([...users]);
    }
  }

  addUser(user: ChatUser): void {
    const users = this.usersSubject.value;
    users.push(user);
    this.usersSubject.next([...users]);
  }

  deleteUser(userId: string): void {
    const users = this.usersSubject.value;
    const filteredUsers = users.filter(user => user.id !== userId);
    this.usersSubject.next(filteredUsers);
  }

  updateUserStatus(userId: string, status: 'online' | 'offline' | 'open' | 'closed'): void {
    const users = this.usersSubject.value;
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      this.usersSubject.next([...users]);
    }
  }

  updateLastMessage(userId: string, message: string): void {
    const users = this.usersSubject.value;
    const user = users.find(u => u.id === userId);
    if (user) {
      user.lastMessage = message;
      user.timestamp = new Date();
      this.usersSubject.next([...users]);
    }
  }

  incrementUnreadCount(userId: string): void {
    const users = this.usersSubject.value;
    const user = users.find(u => u.id === userId);
    if (user) {
      user.unreadCount++;
      this.usersSubject.next([...users]);
    }
  }

  resetUnreadCount(userId: string): void {
    const users = this.usersSubject.value;
    const user = users.find(u => u.id === userId);
    if (user) {
      user.unreadCount = 0;
      this.usersSubject.next([...users]);
    }
  }

  // Bulk operations for selected users
  bulkUpdateStatus(userIds: string[], status: 'open' | 'closed'): void {
    const users = this.usersSubject.value;
    userIds.forEach(id => {
      const user = users.find(u => u.id === id);
      if (user) {
        user.status = status;
      }
    });
    this.usersSubject.next([...users]);
  }

  bulkDelete(userIds: string[]): void {
    const users = this.usersSubject.value;
    const filteredUsers = users.filter(user => !userIds.includes(user.id));
    this.usersSubject.next(filteredUsers);
  }

  // Search and filter helpers
  searchUsers(searchTerm: string): ChatUser[] {
    const users = this.usersSubject.value;
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.country.toLowerCase().includes(term) ||
      user.source.toLowerCase().includes(term)
    );
  }

  filterUsersByStatus(status: string): ChatUser[] {
    const users = this.usersSubject.value;
    if (status === 'All Users') return users;
    
    return users.filter(user => user.status === status.toLowerCase());
  }

  // Export functionality
  exportUsers(userIds?: string[]): string {
    const users = this.usersSubject.value;
    const usersToExport = userIds 
      ? users.filter(user => userIds.includes(user.id))
      : users;

    const exportData = usersToExport.map(user => ({
      name: user.name,
      email: user.email,
      source: user.source,
      country: user.country,
      os: user.os,
      status: user.status,
      lastConverse: user.lastConverse,
      satisfaction: user.satisfaction,
      assignedTo: user.assignedTo
    }));

    return JSON.stringify(exportData, null, 2);
  }
}