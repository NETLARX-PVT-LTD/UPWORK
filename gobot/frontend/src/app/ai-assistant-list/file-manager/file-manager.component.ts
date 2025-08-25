import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FileItem {
  id: number;
  name: string;
  status: 'uploaded' | 'processing' | 'failed';
  size: string;
  trained: boolean;
  uploadedAt: Date;
}

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header with buttons -->
      <div class="flex gap-3 justify-start">
        <button 
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
          [class.bg-green-600]="showManageFiles"
          (click)="showManageFiles = true; showUploadForm = false">
          Manage Files
        </button>
        <button 
          class="border border-green-500 text-green-500 hover:bg-green-50 px-4 py-2 rounded font-medium"
          [class.bg-green-50]="showUploadForm"
          (click)="showUploadForm = true; showManageFiles = false">
          Upload File
        </button>
        <div class="flex-1"></div>
        <input 
          type="text" 
          placeholder="Search" 
          [(ngModel)]="searchTerm"
          (input)="filterFiles()"
          class="border border-gray-300 rounded px-3 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      </div>

      <!-- Success Message -->
      <div *ngIf="showSuccessMessage" 
           class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        <strong>Success!</strong>
        <span class="block sm:inline ml-2">{{ successMessage }}</span>
        <button (click)="hideSuccessMessage()" 
                class="absolute top-0 bottom-0 right-0 px-4 py-3">
          <span class="text-green-700 text-xl">&times;</span>
        </button>
      </div>

      <!-- Upload File Form -->
      <div *ngIf="showUploadForm" class="bg-white rounded-lg border">
        <!-- Upload Area -->
        <div class="p-8">
          <div 
            class="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="triggerFileUpload()"
            [class.border-blue-400]="isDragOver"
            [class.bg-blue-50]="isDragOver">
            
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            
            <div class="text-xl text-gray-500 mb-2">Drop a file here or click to upload</div>
            <div class="text-gray-400 mb-6">Supported files: pdf, docx, txt</div>
            
            <button 
              type="button"
              class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
              (click)="triggerFileUpload(); $event.stopPropagation()">
              Upload
            </button>
          </div>
        </div>

        <!-- Hidden file input -->
        <input 
          type="file" 
          #fileInput 
          class="hidden" 
          multiple 
          accept=".pdf,.doc,.docx,.txt"
          (change)="onFilesSelected($event)">
      </div>

      <!-- Files Table - Only show when Manage Files is active -->
      <div *ngIf="showManageFiles" class="bg-white rounded-lg overflow-hidden border">
        <div class="bg-blue-600 text-white p-4 grid grid-cols-3 gap-4 font-medium">
          <div>FILE</div>
          <div>STATUS</div>
          <div>ACTION</div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="filteredFiles().length === 0" class="p-8 text-center text-gray-500">
          <div class="text-lg font-medium mb-2">No File Uploaded</div>
          <p>Upload some files to get started with document training</p>
        </div>

        <!-- File Rows -->
        <div *ngFor="let file of filteredFiles(); let i = index" 
             class="border-b border-gray-200 last:border-b-0">
          
          <!-- Main Row -->
          <div class="p-4 grid grid-cols-3 gap-4 items-center hover:bg-gray-50">
            <div>
              <div class="font-medium break-all">{{ file.name }}</div>
              <div class="text-sm text-gray-500">{{ file.size }}</div>
            </div>
            <div>
              <span 
                class="px-2 py-1 rounded-full text-xs font-medium"
                [class.bg-green-100]="file.status === 'uploaded'"
                [class.text-green-800]="file.status === 'uploaded'"
                [class.bg-yellow-100]="file.status === 'processing'"
                [class.text-yellow-800]="file.status === 'processing'"
                [class.bg-red-100]="file.status === 'failed'"
                [class.text-red-800]="file.status === 'failed'">
                {{ file.status === 'uploaded' ? 'Uploaded' : (file.status | titlecase) }}
              </span>
            </div>
            <div class="flex gap-2">
              <button 
                class="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-200 rounded"
                (click)="deleteFile(file.id)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Train Button Row - Only show if file is uploaded and not trained -->
          <div *ngIf="file.status === 'uploaded' && !file.trained" 
               class="px-4 pb-4 bg-gray-50">
            <button 
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm"
              (click)="trainFile(file)">
              Train
            </button>
          </div>
          
          <!-- Training Success Message -->
          <div *ngIf="file.trained" 
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

      <!-- Train All Button - Only show when there are untrained uploaded files -->
      <div *ngIf="showManageFiles && hasUntrainedFiles()" 
           class="flex gap-3">
        <button 
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium"
          (click)="trainAllFiles()">
          Train
        </button>
        <button 
          class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium"
          (click)="openTrainedFiles()">
          Open Trained File
        </button>
      </div>
    </div>
  `,
  styleUrls: []
})
export class FileManagerComponent {
  files = signal<FileItem[]>([]);
  filteredFiles = signal<FileItem[]>([]);
  showUploadForm = false;
  showManageFiles = true;
  searchTerm = '';
  isDragOver = false;
  showSuccessMessage = false;
  successMessage = '';

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles() {
    const stored = localStorage.getItem('uploaded-files');
    if (stored) {
      const parsedFiles = JSON.parse(stored).map((file: any) => ({
        ...file,
        uploadedAt: new Date(file.uploadedAt),
        trained: file.trained || false
      }));
      this.files.set(parsedFiles);
      this.filterFiles();
    }
  }

  saveFiles() {
    localStorage.setItem('uploaded-files', JSON.stringify(this.files()));
  }

  filterFiles() {
    if (!this.searchTerm.trim()) {
      this.filteredFiles.set(this.files());
    } else {
      this.filteredFiles.set(
        this.files().filter(file => 
          file.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          file.status.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }
  }

  triggerFileUpload() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      this.processFiles(droppedFiles);
    }
  }

  onFilesSelected(event: any) {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      this.processFiles(selectedFiles);
      // Reset the input
      event.target.value = '';
    }
  }

  processFiles(fileList: FileList) {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        this.showError(`File type ${fileExtension} is not supported`);
        continue;
      }

      const fileItem: FileItem = {
        id: Date.now() + i,
        name: file.name,
        status: 'processing',
        size: this.formatFileSize(file.size),
        trained: false,
        uploadedAt: new Date()
      };

      this.files.set([...this.files(), fileItem]);
      this.saveFiles();
      this.filterFiles();

      // Simulate file upload process
      setTimeout(() => {
        const currentFiles = this.files();
        const index = currentFiles.findIndex(f => f.id === fileItem.id);
        if (index !== -1) {
          currentFiles[index].status = 'uploaded';
          this.files.set([...currentFiles]);
          this.saveFiles();
          this.filterFiles();
        }
      }, 2000);
    }

    // Show success message and switch to manage files
    this.showSuccessMessage = true;
    this.successMessage = 'file uploaded successfully!';
    this.showUploadForm = false;
    this.showManageFiles = true;
    
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  trainFile(file: FileItem) {
    file.trained = true;
    this.files.set([...this.files()]);
    this.saveFiles();
    
    this.showSuccessMessage = true;
    this.successMessage = `Training completed for ${file.name}!`;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  trainAllFiles() {
    const untrainedFiles = this.files().filter(file => 
      file.status === 'uploaded' && !file.trained
    );
    
    untrainedFiles.forEach(file => {
      file.trained = true;
    });
    
    if (untrainedFiles.length > 0) {
      this.files.set([...this.files()]);
      this.saveFiles();
      
      this.showSuccessMessage = true;
      this.successMessage = `${untrainedFiles.length} file(s) trained successfully!`;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  }

  deleteFile(fileId: number) {
    const fileToDelete = this.files().find(f => f.id === fileId);
    if (fileToDelete && confirm(`Are you sure you want to delete ${fileToDelete.name}?`)) {
      const updatedFiles = this.files().filter(f => f.id !== fileId);
      this.files.set(updatedFiles);
      this.saveFiles();
      this.filterFiles();
      
      this.showSuccessMessage = true;
      this.successMessage = `${fileToDelete.name} deleted successfully!`;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  }

  hasUntrainedFiles(): boolean {
    return this.files().some(file => file.status === 'uploaded' && !file.trained);
  }

  openTrainedFiles() {
    this.showSuccessMessage = true;
    this.successMessage = 'Opening trained files...';
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 2000);
  }

  showError(message: string) {
    // You can implement a proper error handling system here
    alert(message);
  }

  hideSuccessMessage() {
    this.showSuccessMessage = false;
  }
}