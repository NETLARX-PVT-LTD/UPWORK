import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clear-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clear-data.component.html'
})
export class ClearDataComponent {
  @Output() dataCleared = new EventEmitter<void>();
  
  confirmationText: string = '';
  isDeleteEnabled: boolean = false;
  showConfirmationModal: boolean = false;

  onInputChange(): void {
    this.isDeleteEnabled = this.confirmationText.trim().toUpperCase() === 'DELETE DATA';
  }

  onDeleteClick(): void {
    if (this.isDeleteEnabled) {
      this.showConfirmationModal = true;
    }
  }

  closeModal(): void {
    this.showConfirmationModal = false;
  }

  confirmDelete(): void {
    // Emit the event to parent component
    this.dataCleared.emit();
    
    // Close modal and reset form
    this.showConfirmationModal = false;
    this.confirmationText = '';
    this.isDeleteEnabled = false;
    
    // Show success message (you can customize this)
    alert('Data has been successfully deleted!');
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}