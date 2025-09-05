import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bot {
  id: number;
  name: string;
  autoSyncEnabled: boolean;
}

@Component({
  selector: 'app-bot-synchronize',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bot-synchronize.component.html',
  styleUrls: ['./bot-synchronize.component.scss']
})
export class BotSynchronizeComponent implements OnInit {
  bots: Bot[] = [
    { id: 1, name: 'Bot 1', autoSyncEnabled: false },
    { id: 2, name: 'Bot 2', autoSyncEnabled: false },
    { id: 4, name: 'Bot 4', autoSyncEnabled: false },
    { id: 5, name: 'Bot 5', autoSyncEnabled: false }
  ];

  selectedBot = 'Bot 3';
  searchQuery = '';
  recordsPerPage = 20;
  currentPage = 1;
  totalPages = 1;
  totalRecords = 4;
  startRecord = 4;
  chatbotActive = false;

  // Modal states
  showAutoSyncConfirm = false;
  showRemoveAutoSyncConfirm = false;
  showOneTimeSyncModal = false;
  showDeleteSyncConfirm = false;
  showSuccessMessage = false;
  
  successMessage = '';
  currentBot: Bot | null = null;

  ngOnInit() {
    this.updatePagination();
  }

  get filteredBots(): Bot[] {
    if (!this.searchQuery) {
      return this.bots;
    }
    return this.bots.filter(bot => 
      bot.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Show Auto Sync Modal
  showAutoSyncModal(bot: Bot) {
    this.currentBot = bot;
    this.showAutoSyncConfirm = true;
  }

  // Show Remove Auto Sync Modal
  showRemoveAutoSyncModal(bot: Bot) {
    this.currentBot = bot;
    this.showRemoveAutoSyncConfirm = true;
  }

  // Show One Time Sync Modal - Updated method
  performOneTimeSync(bot: Bot) {
    this.currentBot = bot;
    this.showOneTimeSyncModal = true;
  }

  // Handle sync option selection
  selectSyncOption(option: 'delete' | 'keep') {
    if (option === 'delete') {
      // Close one time sync modal and show delete confirmation
      this.showOneTimeSyncModal = false;
      this.showDeleteSyncConfirm = true;
    } else if (option === 'keep') {
      // Directly perform keep and synchronize
      this.closeModal();
      this.showSuccessMsg(`One time sync completed for ${this.currentBot?.name} (Stories kept)`);
    }
  }

  // Confirm delete and sync
  confirmDeleteSync() {
    if (this.currentBot) {
      this.showSuccessMsg(`One time sync completed for ${this.currentBot.name} (Data deleted and synchronized)`);
    }
    this.closeModal();
  }

  // Confirm Auto Sync
  confirmAutoSync() {
    if (this.currentBot) {
      this.currentBot.autoSyncEnabled = true;
      this.showSuccessMsg(`Auto sync enabled for ${this.currentBot.name}`);
    }
    this.closeModal();
  }

  // Confirm Remove Auto Sync
  confirmRemoveAutoSync() {
    if (this.currentBot) {
      this.currentBot.autoSyncEnabled = false;
      this.showSuccessMsg(`Auto sync removed for ${this.currentBot.name}`);
    }
    this.closeModal();
  }

  // Close all modals
  closeModal() {
    this.showAutoSyncConfirm = false;
    this.showRemoveAutoSyncConfirm = false;
    this.showOneTimeSyncModal = false;
    this.showDeleteSyncConfirm = false;
    this.currentBot = null;
  }

  // Show success message
  showSuccessMsg(message: string) {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}