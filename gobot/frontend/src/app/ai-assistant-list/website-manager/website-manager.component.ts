import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WebsiteUrl {
  id: string;
  url: string;
  type: 'crawl' | 'single' | 'sitemap' | 'bulk';
  status: 'pending' | 'processing' | 'completed' | 'error';
  addedAt: Date;
  autoSync: boolean;
  trained: boolean;
}

@Component({
  selector: 'app-website-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header with buttons -->
      <div class="flex gap-3 justify-start">
        <button 
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
          [class.bg-green-600]="showManageUrls"
          (click)="showManageUrls = true; showAddForm = false">
          Manage Website URL's
        </button>
        <button 
          class="border border-green-500 text-green-500 hover:bg-green-50 px-4 py-2 rounded font-medium"
          [class.bg-green-50]="showAddForm"
          (click)="showAddForm = true; showManageUrls = false">
          Add Website URL's
        </button>
        <div class="flex-1"></div>
        <input 
          type="text" 
          placeholder="Search" 
          [(ngModel)]="searchTerm"
          (input)="filterWebsites()"
          class="border border-gray-300 rounded px-3 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      </div>

      <!-- Success Message -->
      <div *ngIf="showSuccessMessage" 
           class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        <span class="block sm:inline">{{ successMessage }}</span>
        <button (click)="hideSuccessMessage()" 
                class="absolute top-0 bottom-0 right-0 px-4 py-3">
          <span class="text-green-700">&times;</span>
        </button>
      </div>

      <!-- Add Website Form -->
      <div *ngIf="showAddForm" class="bg-gray-50 p-6 rounded-lg border">
        <h3 class="text-lg font-medium mb-4">Add Website URLs</h3>
        
        <!-- Select Type -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Type *</label>
          <div class="flex gap-2 flex-wrap">
            <button 
              type="button"
              class="px-4 py-2 rounded font-medium border"
              [class.bg-blue-500]="selectedType === 'crawl'"
              [class.text-white]="selectedType === 'crawl'"
              [class.border-blue-500]="selectedType === 'crawl'"
              [class.bg-gray-100]="selectedType !== 'crawl'"
              [class.text-gray-700]="selectedType !== 'crawl'"
              [class.border-gray-300]="selectedType !== 'crawl'"
              (click)="selectedType = 'crawl'">
              Crawl Website
            </button>
            <button 
              type="button"
              class="px-4 py-2 rounded font-medium border"
              [class.bg-green-500]="selectedType === 'single'"
              [class.text-white]="selectedType === 'single'"
              [class.border-green-500]="selectedType === 'single'"
              [class.bg-gray-100]="selectedType !== 'single'"
              [class.text-gray-700]="selectedType !== 'single'"
              [class.border-gray-300]="selectedType !== 'single'"
              (click)="selectedType = 'single'">
              Single URL
            </button>
            <button 
              type="button"
              class="px-4 py-2 rounded font-medium border"
              [class.bg-blue-500]="selectedType === 'sitemap'"
              [class.text-white]="selectedType === 'sitemap'"
              [class.border-blue-500]="selectedType === 'sitemap'"
              [class.bg-gray-100]="selectedType !== 'sitemap'"
              [class.text-gray-700]="selectedType !== 'sitemap'"
              [class.border-gray-300]="selectedType !== 'sitemap'"
              (click)="selectedType = 'sitemap'">
              Sitemap URL
            </button>
            <button 
              type="button"
              class="px-4 py-2 rounded font-medium border"
              [class.bg-blue-500]="selectedType === 'bulk'"
              [class.text-white]="selectedType === 'bulk'"
              [class.border-blue-500]="selectedType === 'bulk'"
              [class.bg-gray-100]="selectedType !== 'bulk'"
              [class.text-gray-700]="selectedType !== 'bulk'"
              [class.border-gray-300]="selectedType !== 'bulk'"
              (click)="selectedType = 'bulk'">
              Import Bulk URLs
            </button>
          </div>
        </div>

        <!-- URL Input for Single/Crawl/Sitemap -->
        <div class="mb-4" *ngIf="selectedType !== 'bulk'">
          <label class="block text-sm font-medium text-gray-700 mb-2">URL *</label>
          <input 
            type="url"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter URL"
            [(ngModel)]="newUrl"
            name="newUrl">
          <p class="text-sm text-gray-500 mt-1">Enter the URL of page on which you want to train</p>
        </div>

        <!-- Bulk URLs textarea -->
        <div class="mb-4" *ngIf="selectedType === 'bulk'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Bulk URLs *</label>
          <textarea 
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            placeholder="Enter multiple URLs, one per line"
            [(ngModel)]="bulkUrls"
            name="bulkUrls"></textarea>
        </div>

        <!-- Crawl Settings -->
        <div *ngIf="selectedType === 'crawl'" class="mb-4 p-4 bg-gray-100 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-3">Crawl Settings</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Max Pages</label>
              <input 
                type="number"
                class="w-full p-2 border border-gray-300 rounded"
                [(ngModel)]="crawlSettings.maxPages"
                min="1"
                max="1000">
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Max Depth</label>
              <input 
                type="number"
                class="w-full p-2 border border-gray-300 rounded"
                [(ngModel)]="crawlSettings.maxDepth"
                min="1"
                max="10">
            </div>
          </div>
          <div class="mt-3">
            <label class="flex items-center">
              <input 
                type="checkbox" 
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                [(ngModel)]="crawlSettings.includeSubdomains">
              <span class="ml-2 text-sm text-gray-700">Include subdomains</span>
            </label>
          </div>
        </div>

        <!-- Auto Sync Option -->
        <div class="mb-4">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              class="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              [(ngModel)]="autoSyncEnabled">
            <span class="ml-2 text-sm text-gray-600">Enable Auto Sync</span>
          </label>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button 
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium"
            (click)="addUrl()"
            [disabled]="!canSave()">
            Save
          </button>
          <button 
            class="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded font-medium"
            (click)="cancelAdd()">
            Cancel
          </button>
        </div>
      </div>

      <!-- URLs Table - Only show when Manage URLs is active -->
      <div *ngIf="showManageUrls" class="bg-white rounded-lg overflow-hidden border">
        <div class="bg-blue-500 text-white p-4 grid grid-cols-12 gap-4 font-medium">
          <div class="col-span-4">WEBSITE</div>
          <div class="col-span-2">TYPE</div>
          <div class="col-span-2">AUTO SYNC</div>
          <div class="col-span-2">STATUS</div>
          <div class="col-span-2">ACTIONS</div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="filteredWebsites.length === 0" class="p-8 text-center text-gray-500">
          <p class="text-lg">No URL Found</p>
        </div>

        <!-- URL Rows -->
        <div *ngFor="let website of filteredWebsites; let i = index" 
             class="border-b border-gray-200">
          
          <!-- Main Row -->
          <div class="p-4 grid grid-cols-12 gap-4 hover:bg-gray-50">
            <div class="col-span-4 font-medium break-all">{{ website.url }}</div>
            <div class="col-span-2">
              <span class="px-2 py-1 text-xs rounded-full"
                    [class.bg-blue-100]="website.type === 'crawl'"
                    [class.text-blue-800]="website.type === 'crawl'"
                    [class.bg-green-100]="website.type === 'single'"
                    [class.text-green-800]="website.type === 'single'"
                    [class.bg-purple-100]="website.type === 'sitemap'"
                    [class.text-purple-800]="website.type === 'sitemap'"
                    [class.bg-orange-100]="website.type === 'bulk'"
                    [class.text-orange-800]="website.type === 'bulk'">
                {{ website.type | titlecase }}
              </span>
            </div>
            <div class="col-span-2">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  class="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  [(ngModel)]="website.autoSync"
                  (change)="saveWebsites()">
                <span class="ml-2 text-sm text-gray-600">Auto Sync</span>
              </label>
            </div>
            <div class="col-span-2">
              <span class="px-2 py-1 text-xs rounded-full"
                    [class.bg-yellow-100]="website.status === 'pending'"
                    [class.text-yellow-800]="website.status === 'pending'"
                    [class.bg-blue-100]="website.status === 'processing'"
                    [class.text-blue-800]="website.status === 'processing'"
                    [class.bg-green-100]="website.status === 'completed'"
                    [class.text-green-800]="website.status === 'completed'"
                    [class.bg-red-100]="website.status === 'error'"
                    [class.text-red-800]="website.status === 'error'">
                {{ website.status | titlecase }}
              </span>
            </div>
            <div class="col-span-2 flex gap-2">
              <button 
                class="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-200 rounded"
                (click)="syncUrl(website)">
                Sync
              </button>
              <button 
                class="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-200 rounded"
                (click)="deleteUrl(i)">
                Delete
              </button>
            </div>
          </div>
          
          <!-- Train Button Row - Only show if website is saved and not trained -->
          <div *ngIf="website.status === 'completed' && !website.trained" 
               class="px-4 pb-4 bg-gray-50">
            <button 
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium text-sm"
              (click)="trainWebsite(website, i)">
              Train
            </button>
          </div>
          
          <!-- Training Success Message -->
          <div *ngIf="website.trained" 
               class="px-4 pb-4 bg-green-50">
            <div class="flex items-center text-green-700 text-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Data trained successfully!
            </div>
          </div>
        </div>
      </div>

      <!-- Train and Open Trained File buttons - Only show when there are trained websites -->
      <div *ngIf="showManageUrls && hasTrainedWebsites()" 
           class="flex gap-3">
        <button 
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium"
          (click)="trainAll()">
          Train All
        </button>
        <button 
          class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium"
          (click)="openTrainedFile()">
          Open Trained File
        </button>
      </div>
    </div>
  `,
  styleUrls: []
})
export class WebsiteManagerComponent {
  websites: WebsiteUrl[] = [];
  filteredWebsites: WebsiteUrl[] = [];
  showAddForm = false;
  showManageUrls = true;
  selectedType: 'crawl' | 'single' | 'sitemap' | 'bulk' = 'single';
  newUrl = '';
  bulkUrls = '';
  searchTerm = '';
  autoSyncEnabled = false;
  showSuccessMessage = false;
  successMessage = '';

  crawlSettings = {
    maxPages: 50,
    maxDepth: 3,
    includeSubdomains: false
  };

  ngOnInit() {
    this.loadWebsites();
  }

  loadWebsites() {
    const stored = localStorage.getItem('website-urls');
    if (stored) {
      this.websites = JSON.parse(stored).map((website: any) => ({
        ...website,
        addedAt: new Date(website.addedAt),
        trained: website.trained || false
      }));
      this.filterWebsites();
    }
  }

  saveWebsites() {
    localStorage.setItem('website-urls', JSON.stringify(this.websites));
  }

  canSave(): boolean {
    if (this.selectedType === 'bulk') {
      return this.bulkUrls.trim().length > 0;
    }
    return this.newUrl.trim().length > 0;
  }

  addUrl() {
    if (!this.canSave()) return;

    let urlsToAdd: string[] = [];
    
    if (this.selectedType === 'bulk') {
      urlsToAdd = this.bulkUrls.split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);
    } else {
      urlsToAdd = [this.newUrl.trim()];
    }

    urlsToAdd.forEach(url => {
      const newWebsite: WebsiteUrl = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: url,
        type: this.selectedType,
        status: 'completed', // Set to completed so train button shows immediately
        addedAt: new Date(),
        autoSync: this.autoSyncEnabled,
        trained: false
      };
      this.websites.push(newWebsite);
    });

    this.saveWebsites();
    this.filterWebsites();
    this.showSuccessMessage = true;
    this.successMessage = `${urlsToAdd.length} URL(s) added successfully!`;
    this.cancelAdd();
    
    // Auto hide success message after 3 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  cancelAdd() {
    this.newUrl = '';
    this.bulkUrls = '';
    this.showAddForm = false;
    this.showManageUrls = true;
  }

  filterWebsites() {
    if (!this.searchTerm.trim()) {
      this.filteredWebsites = [...this.websites];
    } else {
      this.filteredWebsites = this.websites.filter(website => 
        website.url.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        website.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        website.status.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  syncUrl(website: WebsiteUrl) {
    website.status = 'processing';
    this.saveWebsites();
    
    // Simulate sync process
    setTimeout(() => {
      website.status = 'completed';
      this.saveWebsites();
      this.showSuccessMessage = true;
      this.successMessage = `${website.url} synced successfully!`;
      setTimeout(() => this.showSuccessMessage = false, 3000);
    }, 2000);
  }

  trainWebsite(website: WebsiteUrl, index: number) {
    website.trained = true;
    this.saveWebsites();
    this.showSuccessMessage = true;
    this.successMessage = `Training completed for ${website.url}!`;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }

  deleteUrl(index: number) {
    if (confirm('Are you sure you want to delete this URL?')) {
      const deletedUrl = this.websites[index].url;
      this.websites.splice(index, 1);
      this.saveWebsites();
      this.filterWebsites();
      this.showSuccessMessage = true;
      this.successMessage = `${deletedUrl} deleted successfully!`;
      setTimeout(() => this.showSuccessMessage = false, 3000);
    }
  }

  hasTrainedWebsites(): boolean {
    return this.websites.some(website => website.trained);
  }

  trainAll() {
    const untrainedWebsites = this.websites.filter(website => !website.trained && website.status === 'completed');
    untrainedWebsites.forEach(website => {
      website.trained = true;
    });
    
    if (untrainedWebsites.length > 0) {
      this.saveWebsites();
      this.showSuccessMessage = true;
      this.successMessage = `${untrainedWebsites.length} websites trained successfully!`;
      setTimeout(() => this.showSuccessMessage = false, 3000);
    }
  }

  openTrainedFile() {
    // Simulate opening trained file
    this.showSuccessMessage = true;
    this.successMessage = 'Opening trained file...';
    setTimeout(() => this.showSuccessMessage = false, 2000);
  }

  hideSuccessMessage() {
    this.showSuccessMessage = false;
  }
}