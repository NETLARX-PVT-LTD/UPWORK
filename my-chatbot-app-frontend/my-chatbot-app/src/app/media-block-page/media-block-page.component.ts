import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { AvailableMedia, Button, AvailableStory } from '../models/chatbot-block.model';
import { MediaService } from '../shared/services/media.service';
import { MatDialog } from '@angular/material/dialog';
import { CloneConfirmDialogComponent } from './clone-confirm-dialog/clone-confirm-dialog.component'; // Create this component
import { Clipboard } from '@angular/cdk/clipboard';


@Component({
  selector: 'app-media-block-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './media-block-page.component.html',
  styleUrls: ['./media-block-page.component.scss']
})
export class MediaBlockPageComponent implements OnInit {
  availableMedia: AvailableMedia[] = [];
  availableStories: AvailableStory[] = [];

  constructor(
    private _snackBar: MatSnackBar,
    private mediaService: MediaService,
    private router: Router,
    private clipboard: Clipboard, private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }


 

  copyPayload(media: any) {
    // Format the data you want to copy. For example, JSON.stringify.
    const payload = JSON.stringify(media, null, 2); 

    // Use the Clipboard service to copy the data.
    this.clipboard.copy(payload);

    // Provide user feedback.
    this.snackBar.open('Payload copied to clipboard!', 'Dismiss', {
      duration: 3000,
    });
  }
cloneMediaBlock(media: any) {
  const dialogRef = this.dialog.open(CloneConfirmDialogComponent, {
    width: '400px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Logic to duplicate the media block
      const clonedBlock = { ...media, name: media.name + ' duplicate', id: Date.now() }; // Example cloning logic, update ID
      this.availableMedia.unshift(clonedBlock); // Add the new block to the beginning of the array
    }
  });
}
  ngOnInit(): void {
    this.availableMedia = this.mediaService.getMediaBlocks();
  }

  // Navigate to create new media block route
  createNewMediaBlock(): void {
    const newMedia: AvailableMedia = {
      id: 'media-' + Date.now().toString(),
      name: this.generateDefaultMediaBlockName(),
      type: 'text',
      content: '',
      url: '',
      slides: [],
      buttons: [],
      createdAt: new Date().toISOString()
    };
    // Navigate to the new media block route with the new media as state
    this.router.navigate(['/media-blocks/new'], { state: { newMedia } });
  }

  // Generate default media block name
  private generateDefaultMediaBlockName(): string {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    return `Media Block ${randomNumber}`;
  }

  // Duplicate media block
  duplicateMediaBlock(media: AvailableMedia): void {
    const duplicatedMedia = this.mediaService.duplicateMediaBlock(media);
    this.availableMedia = this.mediaService.getMediaBlocks();
    this._snackBar.open('Media block duplicated successfully!', 'Dismiss', { duration: 2000 });
  }

  // Delete media block
  deleteMediaBlock(mediaId: string): void {
    const media = this.availableMedia.find(m => m.id === mediaId);
    if (media) {
      this.mediaService.deleteMediaBlock(mediaId);
      this.availableMedia = this.mediaService.getMediaBlocks();
      this._snackBar.open(`"${media.name}" deleted successfully!`, 'Dismiss', { duration: 2000 });
    }
  }

  // Get media type display name
  getMediaTypeDisplayName(type: string): string {
    switch (type) {
      case 'text': return 'Text Message';
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'file': return 'File';
      case 'Image Slider': return 'Slider';
      default: return type;
    }
  }

  // Get media type badge class
  getMediaTypeBadgeClass(type: string): string {
    switch (type) {
      case 'text': return 'bg-blue-500';
      case 'image': return 'bg-green-500';
      case 'video': return 'bg-purple-500';
      case 'audio': return 'bg-orange-500';
      case 'file': return 'bg-red-500';
      case 'Image Slider': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  }

  getButtonTypeTags(buttons: Button[] | undefined): string[] {
    if (!buttons || buttons.length === 0) return [];
    
    const uniqueTypes = [...new Set(buttons.map(button => {
      switch (button.type) {
        case 'text_message': return 'text';
        case 'media_block': return 'media';
        case 'website_url': return 'url';
        case 'direct_call': return 'call';
        case 'start_story': return 'story';
        case 'rss_feed': return 'rss';
        case 'json_api': return 'api';
        case 'human_help': return 'help';
        case 'conversational_form': return 'form';
        default: return 'button';
      }
    }))];
    
    return uniqueTypes.slice(0, 2); // Show max 2 tags to avoid clutter
  }

  getFormattedDate(dateString?: string): string {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    return new Date(dateString).toLocaleDateString('en-GB');
  }
}