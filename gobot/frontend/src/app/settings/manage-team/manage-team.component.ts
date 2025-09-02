import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  emailNotifications: boolean;
  accessRevoked: boolean;
}

@Component({
  selector: 'app-manage-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="team-management-container">
      <!-- Header -->
      <div class="header">
        <h2>{{ isAddingMember ? 'Add Team Member' : isEditingMember ? 'Update Team Member' : 'Manage Team' }}</h2>
        <div class="header-buttons" *ngIf="!isAddingMember && !isEditingMember && teamMembers.length > 0">
          <button class="btn btn-primary" (click)="showAddMemberForm()">
            Add Team Member
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <div class="success-message" *ngIf="showSuccessMessage">
        <div class="alert alert-success">
          <i class="success-icon">✓</i>
          {{ successMessage }}
        </div>
      </div>

      <!-- No Members State - Video Tutorial -->
      <div class="no-members-state" *ngIf="!isAddingMember && !isEditingMember && teamMembers.length === 0">
        <div class="video-container">
          <div class="video-placeholder">
            <div class="video-header">
              <div class="botsify-logo">
                <span class="logo-icon">💬</span>
                Botsify
              </div>
              <div class="video-controls">
                <button class="watch-later-btn">⏰ Watch Later</button>
                <button class="share-btn">📤 Share</button>
              </div>
            </div>
            <div class="video-content">
              <div class="play-button">▶</div>
              <h3>How To Manage Your Team & Agents Inside The Botsify Platform</h3>
              <p class="video-description">Lesson 28: How To Manage Your Team...</p>
            </div>
          </div>
        </div>

        <div class="add-first-member">
          <h3>Add your first Team Member</h3>
          <p>
            Add your first Team Member with the help of Team you can 
            manage your bot much more effectively and share it with 
            respective people in your company. Click the button below to 
            create your first Team Member.
          </p>
          <div class="action-buttons">
            <button class="btn btn-secondary" (click)="goBack()">Go back</button>
            <button class="btn btn-success" (click)="showAddMemberForm()">
              Create Team Member
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Member Form -->
      <div class="add-member-form" *ngIf="isAddingMember || isEditingMember">
        <div class="form-container">
          <div class="form-section">
            <div class="form-group">
              <label for="name">Name *</label>
              <input 
                type="text" 
                id="name"
                [(ngModel)]="newMember.name"
                placeholder="Member name"
                class="form-control"
                [class.error]="nameError"
              >
              <span class="error-message" *ngIf="nameError">{{ nameError }}</span>
            </div>

            <div class="form-group" *ngIf="!isEditingMember">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email"
                [(ngModel)]="newMember.email"
                placeholder="Member email"
                class="form-control"
                [class.error]="emailError"
              >
              <span class="error-message" *ngIf="emailError">{{ emailError }}</span>
            </div>

            <div class="form-group">
              <label for="role">Role *</label>
              <select 
                id="role"
                [(ngModel)]="newMember.role"
                class="form-control"
                [class.error]="roleError"
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Live Chat Agent">Live Chat Agent</option>
              </select>
              <span class="error-message" *ngIf="roleError">{{ roleError }}</span>
            </div>

            <button 
              class="btn btn-primary btn-full" 
              (click)="isEditingMember ? updateTeamMember() : addTeamMember()"
              [disabled]="isSubmitting"
            >
              {{ isSubmitting ? (isEditingMember ? 'Updating...' : 'Adding...') : (isEditingMember ? 'Update Team Member' : 'Add Team Member') }}
            </button>
          </div>

          <div class="rules-section">
            <div class="rules-header">
              <span class="lightbulb-icon">💡</span>
              <h4>Rules & Tips:</h4>
            </div>
            <div class="rules-list">
              <div class="rule-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Admin:</strong> Can access full platform.
                </div>
              </div>
              <div class="rule-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Editor:</strong> Can access chatbot AI, analytics, live-chat and publish section. They can manage users too.
                </div>
              </div>
              <div class="rule-item">
                <span class="check-icon">✓</span>
                <div>
                  <strong>Live Chat Agent:</strong> Can only access live chat window to communicate with audience.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Members List -->
      <div class="team-members-list" *ngIf="!isAddingMember && !isEditingMember && teamMembers.length > 0">
        <div class="list-header">
          <div class="tabs">
            <button class="tab active">Bot Admins</button>
            <button class="tab">Share Access Link</button>
          </div>
          <div class="search-container">
            <input 
              type="text" 
              placeholder="Search..." 
              class="search-input"
              [(ngModel)]="searchTerm"
            >
            <button class="search-btn">🔍</button>
          </div>
        </div>

        <div class="table-container">
          <table class="members-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let member of filteredMembers">
                <td>{{ member.name }}</td>
                <td>{{ member.email }}</td>
                <td>
                  <span class="role-badge" [class]="getRoleClass(member.role)">
                    {{ member.role }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="getStatusClass(member.status)">
                    {{ member.status }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn edit" (click)="editMember(member)" title="Edit">✏️</button>
                    <button class="action-btn delete" (click)="showDeleteConfirmation(member.id)" title="Delete">🗑️</button>
                    <button class="action-btn email-toggle" 
                            (click)="showEmailToggleConfirmation(member.id, member.emailNotifications)" 
                            [title]="member.emailNotifications ? 'Turn off email notifications' : 'Turn on email notifications'">
                      {{ member.emailNotifications ? '🔕' : '🔔' }}
                    </button>
                    <button class="action-btn revoke" 
                            (click)="toggleAccess(member.id)" 
                            [title]="member.accessRevoked ? 'Grant access' : 'Revoke access'">
                      {{ member.accessRevoked ? '🔓' : '🔒' }}
                    </button>
                    <button class="action-btn resend" (click)="resendInvitation(member.id)" title="Resend invitation">🔄</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <div class="records-info">
            <select [(ngModel)]="recordsPerPage" class="records-select">
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>Records per page</span>
          </div>
          <div class="pagination-info">
            <span>Showing {{ filteredMembers.length }} of {{ teamMembers.length }} results</span>
            <div class="pagination">
              <button class="page-btn" disabled>‹</button>
              <button class="page-btn active">1</button>
              <button class="page-btn" disabled>›</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-icon warning">⚠️</div>
          <h3>Are you sure?</h3>
          <p>You will not be able to recover this action</p>
          <div class="modal-buttons">
            <button class="btn btn-primary" (click)="confirmDelete()">Delete</button>
            <button class="btn btn-danger" (click)="closeDeleteModal()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Email Toggle Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showEmailToggleModal" (click)="closeEmailToggleModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-icon warning">⚠️</div>
          <h3>Are you sure?</h3>
          <p>{{ emailToggleAction === 'turn_off' ? 'User will not receive email notification further' : 'User will start receiving email notifications' }}</p>
          <div class="modal-buttons">
            <button class="btn btn-primary" (click)="confirmEmailToggle()">{{ emailToggleAction === 'turn_off' ? 'Yes' : 'Yes' }}</button>
            <button class="btn btn-danger" (click)="closeEmailToggleModal()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .team-management-container {
      background: #f5f7fa;
      min-height: 100vh;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background: #4285f4;
      color: white;
    }

    .btn-primary:hover {
      background: #3367d6;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-full {
      width: 100%;
    }

    .success-message {
      margin-bottom: 20px;
    }

    .alert {
      padding: 15px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .success-icon {
      background: #28a745;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    .no-members-state {
      background: white;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .video-container {
      margin-bottom: 40px;
    }

    .video-placeholder {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .video-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .botsify-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
    }

    .logo-icon {
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      padding: 8px;
    }

    .video-controls {
      display: flex;
      gap: 10px;
    }

    .watch-later-btn, .share-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }

    .video-content {
      text-align: center;
    }

    .play-button {
      background: #ff4757;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 24px;
      color: white;
      cursor: pointer;
    }

    .video-content h3 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .video-description {
      opacity: 0.8;
      font-size: 14px;
    }

    .add-first-member h3 {
      font-size: 28px;
      color: #333;
      margin-bottom: 20px;
    }

    .add-first-member p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto 30px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .form-container {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 40px;
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .form-control {
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #4285f4;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
    }

    .rules-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }

    .rules-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .rules-header h4 {
      margin: 0;
      color: #333;
      font-size: 16px;
    }

    .lightbulb-icon {
      font-size: 20px;
    }

    .rules-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .rule-item {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .check-icon {
      background: #28a745;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .rule-item div {
      font-size: 14px;
      line-height: 1.4;
      color: #555;
    }

    .rule-item strong {
      color: #333;
    }

    .team-members-list {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e1e5e9;
    }

    .tabs {
      display: flex;
      gap: 5px;
    }

    .tab {
      padding: 10px 20px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #666;
    }

    .tab.active {
      background: #4285f4;
      color: white;
    }

    .search-container {
      display: flex;
      gap: 5px;
    }

    .search-input {
      padding: 10px 15px;
      border: 1px solid #e1e5e9;
      border-radius: 6px;
      font-size: 14px;
      width: 200px;
    }

    .search-btn {
      padding: 10px 15px;
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .table-container {
      overflow-x: auto;
    }

    .members-table {
      width: 100%;
      border-collapse: collapse;
    }

    .members-table th {
      background: #4285f4;
      color: white;
      padding: 15px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .members-table td {
      padding: 15px;
      border-bottom: 1px solid #e1e5e9;
      font-size: 14px;
    }

    .role-badge, .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .role-badge.editor {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.admin {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .role-badge.live-chat-agent {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.active {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.inactive {
      background: #ffebee;
      color: #c62828;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .action-btn {
      padding: 6px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .action-btn:hover {
      background: #f5f5f5;
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-top: 1px solid #e1e5e9;
    }

    .records-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .records-select {
      padding: 5px 10px;
      border: 1px solid #e1e5e9;
      border-radius: 4px;
    }

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .pagination {
      display: flex;
      gap: 5px;
    }

    .page-btn {
      padding: 8px 12px;
      border: 1px solid #e1e5e9;
      background: white;
      cursor: pointer;
      border-radius: 4px;
    }

    .page-btn.active {
      background: #4285f4;
      color: white;
      border-color: #4285f4;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      min-width: 400px;
      max-width: 90vw;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .modal-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .modal-icon.warning {
      color: #ff9800;
    }

    .modal h3 {
      margin: 0 0 15px 0;
      font-size: 24px;
      color: #333;
    }

    .modal p {
      margin: 0 0 25px 0;
      color: #666;
      font-size: 16px;
    }

    .modal-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .modal-buttons .btn {
      min-width: 100px;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .action-btn.email-toggle {
      font-size: 16px;
    }

    .action-btn.revoke {
      font-size: 16px;
    }

    .action-btn.resend {
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .form-container {
        grid-template-columns: 1fr;
      }
      
      .list-header {
        flex-direction: column;
        gap: 15px;
      }
      
      .search-container {
        width: 100%;
      }
      
      .search-input {
        flex: 1;
      }
      
      .table-footer {
        flex-direction: column;
        gap: 15px;
      }
    }
  `]
})
export class ManageTeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  isAddingMember = false;
  isEditingMember = false;
  editingMemberId = '';
  showSuccessMessage = false;
  successMessage = '';
  isSubmitting = false;
  searchTerm = '';
  recordsPerPage = 20;

  // Modal states
  showDeleteModal = false;
  showEmailToggleModal = false;
  deleteTargetId = '';
  emailToggleTargetId = '';
  emailToggleAction = ''; // 'turn_off' or 'turn_on'

  newMember = {
    name: '',
    email: '',
    role: ''
  };

  // Validation errors
  nameError = '';
  emailError = '';
  roleError = '';

  ngOnInit() {
    // Initialize with empty team or load existing data
    // this.loadTeamMembers();
  }

  get filteredMembers() {
    if (!this.searchTerm) {
      return this.teamMembers;
    }
    return this.teamMembers.filter(member => 
      member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  showAddMemberForm() {
    this.isAddingMember = true;
    this.isEditingMember = false;
    this.resetForm();
  }

  showEditMemberForm(member: TeamMember) {
    this.isEditingMember = true;
    this.isAddingMember = false;
    this.editingMemberId = member.id;
    this.newMember = {
      name: member.name,
      email: member.email,
      role: member.role
    };
    this.resetValidationErrors();
  }

  goBack() {
    this.isAddingMember = false;
    this.isEditingMember = false;
    this.editingMemberId = '';
    this.resetForm();
  }

  resetForm() {
    this.newMember = { name: '', email: '', role: '' };
    this.resetValidationErrors();
  }

  resetValidationErrors() {
    this.nameError = '';
    this.emailError = '';
    this.roleError = '';
  }

  validateForm(): boolean {
    let isValid = true;
    
    // Reset errors
    this.resetValidationErrors();

    // Name validation
    if (!this.newMember.name.trim()) {
      this.nameError = 'Name is required';
      isValid = false;
    }

    // Email validation (only for new members, not for editing)
    if (!this.isEditingMember) {
      if (!this.newMember.email.trim()) {
        this.emailError = 'Email is required';
        isValid = false;
      } else if (!this.isValidEmail(this.newMember.email)) {
        this.emailError = 'Please enter a valid email';
        isValid = false;
      } else if (this.teamMembers.some(member => member.email === this.newMember.email)) {
        this.emailError = 'This email is already in use';
        isValid = false;
      }
    }

    // Role validation
    if (!this.newMember.role) {
      this.roleError = 'Role is required';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  addTeamMember() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      const member: TeamMember = {
        id: this.generateId(),
        name: this.newMember.name.trim(),
        email: this.newMember.email.trim(),
        role: this.newMember.role,
        status: 'Active',
        emailNotifications: true,
        accessRevoked: false
      };

      this.teamMembers.push(member);
      this.isSubmitting = false;
      this.isAddingMember = false;
      this.successMessage = 'Team member added successfully!';
      this.showSuccessMessage = true;
      this.resetForm();

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);

    }, 1000);
  }

  updateTeamMember() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      const memberIndex = this.teamMembers.findIndex(m => m.id === this.editingMemberId);
      if (memberIndex !== -1) {
        this.teamMembers[memberIndex] = {
          ...this.teamMembers[memberIndex],
          name: this.newMember.name.trim(),
          role: this.newMember.role
        };
      }

      this.isSubmitting = false;
      this.isEditingMember = false;
      this.editingMemberId = '';
      this.successMessage = 'Team member updated successfully!';
      this.showSuccessMessage = true;
      this.resetForm();

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);

    }, 1000);
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getRoleClass(role: string): string {
    return role.toLowerCase().replace(' ', '-');
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  editMember(member: TeamMember) {
    this.showEditMemberForm(member);
  }

  showDeleteConfirmation(memberId: string) {
    this.deleteTargetId = memberId;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteTargetId = '';
  }

  confirmDelete() {
    if (this.deleteTargetId) {
      this.teamMembers = this.teamMembers.filter(member => member.id !== this.deleteTargetId);
      this.successMessage = 'Team member deleted successfully!';
      this.showSuccessMessage = true;
      
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
    this.closeDeleteModal();
  }

  showEmailToggleConfirmation(memberId: string, currentStatus: boolean) {
    this.emailToggleTargetId = memberId;
    this.emailToggleAction = currentStatus ? 'turn_off' : 'turn_on';
    this.showEmailToggleModal = true;
  }

  closeEmailToggleModal() {
    this.showEmailToggleModal = false;
    this.emailToggleTargetId = '';
    this.emailToggleAction = '';
  }

  confirmEmailToggle() {
    if (this.emailToggleTargetId) {
      const member = this.teamMembers.find(m => m.id === this.emailToggleTargetId);
      if (member) {
        member.emailNotifications = !member.emailNotifications;
        this.successMessage = member.emailNotifications ? 
          'Email notifications enabled successfully!' : 
          'Email notifications disabled successfully!';
        this.showSuccessMessage = true;
        
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      }
    }
    this.closeEmailToggleModal();
  }

  toggleAccess(memberId: string) {
    const member = this.teamMembers.find(m => m.id === memberId);
    if (member) {
      member.accessRevoked = !member.accessRevoked;
      this.successMessage = member.accessRevoked ? 
        'User access to Bot has been revoked.' : 
        'User access to Bot has been granted.';
      this.showSuccessMessage = true;
      
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  }

  resendInvitation(memberId: string) {
    this.successMessage = 'Invitation email sent successfully!';
    this.showSuccessMessage = true;
    
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }
}