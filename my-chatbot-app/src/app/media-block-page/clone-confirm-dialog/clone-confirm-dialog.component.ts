import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-clone-confirm-dialog',
 standalone: true, // <-- Ensure this is set to true
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './clone-confirm-dialog.component.html',
  styleUrl: './clone-confirm-dialog.component.scss'
})
export class CloneConfirmDialogComponent {
 constructor(public dialogRef: MatDialogRef<CloneConfirmDialogComponent>) {}
}
