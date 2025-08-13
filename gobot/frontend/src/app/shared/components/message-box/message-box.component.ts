// src/app/shared/components/message-box/message-box.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent {
  @Input() message: string = '';
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Output() closed = new EventEmitter<void>();

  get icon(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info':
      default: return 'info';
    }
  }

  get colorClass(): string {
    switch (this.type) {
      case 'success': return 'message-box-success';
      case 'warning': return 'message-box-warning';
      case 'error': return 'message-box-error';
      case 'info':
      default: return 'message-box-info';
    }
  }

  onClose(): void {
    this.closed.emit();
  }
}
