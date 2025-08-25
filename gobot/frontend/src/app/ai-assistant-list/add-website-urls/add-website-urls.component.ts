// add-website-urls.component.ts
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define the interface for the emitted data
interface WebsiteData {
  url: string;
  autoSync: boolean;
}

@Component({
  selector: 'app-add-website-urls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-website-urls.component.html',
  styleUrl: './add-website-urls.component.scss'
})
export class AddWebsiteUrlsComponent {
@Output() onSave = new EventEmitter<WebsiteData[]>();
  @Output() onCancel = new EventEmitter<void>();
  
  selectedType = signal('single');
  urlInput = '';
  bulkUrls = '';
  showAdvanced = false;
   autoSync = true;
  
  crawlSettings = {
    maxPages: 50,
    maxDepth: 3,
    includeSubdomains: false
  };
  
  advancedOptions = {
    excludePatterns: '',
    cssSelector: '',
    respectRobots: true
  };
  
 canSave(): boolean {
    if (this.selectedType() === 'bulk') {
      return this.bulkUrls.trim().length > 0;
    }
    return this.urlInput.trim().length > 0;
  }

  save() {
    if (!this.canSave()) return;

    let urls: WebsiteData[] = [];

    if (this.selectedType() === 'bulk') {
      urls = this.bulkUrls.split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .map(url => ({ url: url, autoSync: this.autoSync })); // Map each URL to the correct object type
    } else {
      urls = [{ url: this.urlInput.trim(), autoSync: this.autoSync }]; // Create a single object
    }

    this.onSave.emit(urls);
  }

  cancel() {
    this.onCancel.emit();
  }
}