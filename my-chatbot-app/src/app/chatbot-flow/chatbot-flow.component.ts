import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDragEnd, CdkDragStart, CdkDrag } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { ChatbotBlock, Connection, AvailableMedia, AvailableStory, AvailableForm, FormField } from '../models/chatbot-block.model';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Import block components
import { UserInputBlockComponent } from './blocks/user-input-block/user-input-block.component';
import { TextResponseBlockComponent } from './blocks/text-response-block/text-response-block.component';
import { QuickReplyBranchBlockComponent } from './blocks/quick-reply-branch-block/quick-reply-branch-block.component';
import { NoQuickReplyBlockComponent } from './blocks/no-quick-reply-block/no-quick-reply-block.component';
import { IndividualQuickReplyCardComponent } from './blocks/individual-quick-reply-card/individual-quick-reply-card.component';
import { TypingDelayBlockComponent } from './blocks/typing-delay-block/typing-delay-block.component';
import { MediaBlockComponent } from './blocks/media-block/media-block.component';
import { LinkStoryBlockComponent } from './blocks/link-story-block/link-story-block.component';
import { ConversationalFormBlockComponent } from './blocks/conversational-form-block/conversational-form-block.component';
import { MessageBoxComponent } from '../shared/components/message-box/message-box.component';
import { JsonApiIntegrationBlockComponent } from './blocks/json-api-integration-block/json-api-integration-block.component';
import { JarvishBlockComponent } from './blocks/jarvish-block/jarvish-block.component';

// Import the JsPlumbFlowService
import { JsPlumbFlowService } from './services/jsplumb-flow.service';

type NearestConnectionPoint = { blockId: string, x: number, y: number };

@Component({
  selector: 'app-chatbot-flow',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatSelectModule,
    MatCheckboxModule,
    UserInputBlockComponent,
    TextResponseBlockComponent,
    QuickReplyBranchBlockComponent,
    NoQuickReplyBlockComponent,
    IndividualQuickReplyCardComponent,
    TypingDelayBlockComponent,
    MediaBlockComponent,
    LinkStoryBlockComponent,
    ConversationalFormBlockComponent,
    MessageBoxComponent,
    JsonApiIntegrationBlockComponent,
    JarvishBlockComponent
  ],
  templateUrl: './chatbot-flow.component.html',
  styleUrls: ['./chatbot-flow.component.scss']
})
export class ChatbotFlowComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasWrapper') canvasWrapper!: ElementRef;
  @ViewChild('canvasContent') canvasContent!: ElementRef;
  @ViewChild('svgCanvas') svgCanvas!: ElementRef;

  allBlocks: ChatbotBlock[] = [
    {
      id: '1',
      name: 'User Input',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/user-message.png',
      icon: '',
      type: 'userInput',
      status: 'normal',
      x: 0,
      y: 0,
      subType: 'phrase',
      description: 'Phrase',
      width: 0,
      height: 0
    },
    {
      id: '2',
      name: 'User Input',
      icon: '',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/user-message.png',
      type: 'userInput',
      status: 'normal',
      x: 0,
      y: 0,
      description: 'Keyword Group',
      subType: 'keywordGroup',
      width: 0,
      height: 0
    },
    {
      id: '3',
      name: 'User Input',
      icon: '',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/user-message.png',
      type: 'userInput',
      status: 'normal',
      x: 0,
      y: 0,
      description: 'Type Anything',
      subType: 'anything',
      width: 0,
      height: 0
    },
    {
      id: '4',
      name: 'Text Response',
      icon: 'text_fields',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/bot-message.png',
      type: 'textResponse',
      status: 'normal',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      content: ''
    },
    {
      id: '5',
      name: 'Media block',
      icon: 'image',
      type: 'mediaBlock',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/media.png',
      status: 'normal',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      mediaId: undefined,
      mediaType: undefined,
      mediaName: undefined
    },
    {
      id: '6',
      name: 'Link Story',
      icon: 'insert_link',
      type: 'linkStory',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/story.png',
      status: 'normal',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      linkStoryId: undefined,
      linkStoryName: undefined
    },
    {
      id: '7',
      name: 'Conversational Form',
      imageUrl: 'http://app.botsify.com/theme/images/Story-Icons/form.png',
      icon: 'list_alt',
      type: 'conversationalForm',
      status: 'normal',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      formId: undefined,
      formName: undefined,
      webhookUrl: undefined,
      sendEmailNotification: undefined,
      notificationEmail: undefined,
      formFields: undefined,
      showAsInlineForm: undefined
    },
    {
      id: '8',
      name: 'Typing Delay',
      icon: 'hourglass_empty',
      type: 'typingDelay',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/typing.png',
      status: 'normal',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      delaySeconds: 1
    },
    {
      id: '9',
      name: 'JSON API Integration',
      icon: 'code',
      type: 'jsonApi',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/api.png',
      status: 'normal',
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  ];

  canvasBlocks: ChatbotBlock[] = [];
  connections: Connection[] = [];
  filteredBlocks$: Observable<ChatbotBlock[]> | undefined;
  searchControl = new FormControl('');

  availableMedia: AvailableMedia[] = [
    { id: 'media-1', name: 'Product Image A', type: 'image' },
    { id: 'media-2', name: 'Intro Video', type: 'video' },
    { id: 'media-3', name: 'Company Logo', type: 'image' },
    { id: 'media-4', name: 'FAQ Document', type: 'file' },
    { id: 'media-5', name: 'Welcome Message', type: 'text' },
    { id: 'media-6', name: 'Media Block 8854', type: 'image' }
  ];

  availableForms: AvailableForm[] = [
    { id: 'form-1', name: 'Contact Us Form' },
    { id: 'form-2', name: 'Feedback Survey' },
    { id: 'form-3', name: 'Support Ticket' },
    { id : 'form-4', name:'Aishwary'}
  ];

  availableStories: AvailableStory[] = [
    { id: 'story-1', name: 'Go back to previous story' },
    { id: 'story-2', name: '(Hii),' },
    { id: 'story-3', name: 'Report Incident' },
    { id: 'story-4', name: 'Process for setting up shop' },
    { id : 'Aishwary', name : 'Aishwary'}
  ];

  zoomLevel: number = 1.0;
  minZoom: number = 0.5;
  maxZoom: number = 2.0;
  zoomStep: number = 0.1;

  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  panOffsetX = 0;
  panOffsetY = 0;

  isDrawingConnection = false;
  connectionStart: { blockId: string, x: number, y: number } | null = null;
  temporaryConnection: { x1: number, y1: number, x2: number, y2: number } | null = null;

  selectedBlock: ChatbotBlock | null = null;
  rightSidebarOpen: boolean = false;

  showMessageBox: boolean = false;
  messageBoxContent: string = '';
  messageBoxType: 'info' | 'success' | 'warning' | 'error' = 'info';

  // New drag-and-drop properties
  isDraggingFromPalette = false;
  draggedPaletteBlock: ChatbotBlock | null = null;
  isOverDropZone = false;
  dropPreviewPosition: { x: number, y: number } | null = null;
  dragPreviewElement: HTMLElement | null = null;
  isDraggingBlock = false;
  draggedBlockId: string | null = null;
  connectionPoints: Array<{ blockId: string, x: number, y: number, element: HTMLElement }> = [];
  nearestConnectionPoint: NearestConnectionPoint | null = null;
  readonly CONNECTION_SNAP_DISTANCE = 50;

  constructor(private jsPlumbFlowService: JsPlumbFlowService) { }

  ngOnInit(): void {
    this.filteredBlocks$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._filter(value || ''))
    );

    const formBlockTemplate = this.allBlocks.find(block => block.type === 'conversationalForm');
    const conversationalFormFields: FormField[] = [
      {
        name: 'Your Name',
        type: 'text',
        required: true,
        promptPhrase: 'Enter your name'
      },
      {
        name: 'Email Address',
        type: 'email',
        required: true,
        promptPhrase: 'Enter your email'
      },
      {
        name: 'Image',
        type: 'image',
        required: true,
        promptPhrase: "Put one of your image"
      }
    ];

    this.canvasBlocks.push({
      id: 'flow-start',
      name: 'User Input',
      icon: 'person',
      type: 'userInput',
      status: 'active',
      x: 600,
      y: 200,
      subType: 'keywordGroup',
      content: 'Hello 👋',
      keywordGroups: [['Hello', 'Hi']],
      description: 'Define keywords that trigger the conversations',
      width: 0,
      height: 0
    });

    this.canvasBlocks.push({
      id: 'text-response-2',
      name: 'Text Response',
      icon: 'chat_bubble_outline',
      type: 'textResponse',
      status: 'active',
      x: 300,
      y: 300,
      content: 'done implement conversation on that also',
      description: 'Final message from Jarvish',
      width: 0,
      height: 0
    });

    if (formBlockTemplate) {
      const conversationalFormBlock: ChatbotBlock = {
        ...formBlockTemplate,
        id: 'form-block-1',
        x: 400,
        y: 400,
        status: 'active',
        formId: 'form-123',
        formName: 'User Details Form',
        webhookUrl: 'https://your-webhook-url.com',
        sendEmailNotification: true,
        notificationEmail: 'your-email@example.com',
        showAsInlineForm: true,
        formFields: conversationalFormFields
      };
      this.canvasBlocks.push(conversationalFormBlock);
      this.availableForms.push(conversationalFormBlock);
    }

    // this.availableStories.push()
      this.availableStories.push({
        id: `story-${Date.now()}`, // Unique ID
        name: 'My Current Canvas Story',
        blocks: [...this.canvasBlocks] // Save all blocks as one story
      });

      console.log('Available Stories:', this.availableStories);
  }

  ngAfterViewInit(): void {
    if (this.canvasContent && this.canvasContent.nativeElement) {
      this.jsPlumbFlowService.initialize(this.canvasContent.nativeElement);

      this.jsPlumbFlowService.connectionCreated.subscribe(connInfo => {
        console.log('Component received connectionCreated:', connInfo);
      });

      this.jsPlumbFlowService.connectionDeleted.subscribe(connInfo => {
        console.log('Component received connectionDeleted:', connInfo);
        this.connections = this.connections.filter(c => c.id !== connInfo.connectionId);
      });

      this.jsPlumbFlowService.blockMoved.subscribe(blockId => {
        const block = this.canvasBlocks.find(b => `block-${b.id}` === blockId);
        if (block) {
          const blockElement = document.getElementById(blockId);
          if (blockElement) {
            const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
            const blockRect = blockElement.getBoundingClientRect();

            block.x = (blockRect.left - canvasRect.left) / this.zoomLevel;
            block.y = (blockRect.top - canvasRect.top) / this.zoomLevel;
            this.updateBlockDimensions(block);
          }
        }
      });
    }

    this.updateCanvasTransform();

    setTimeout(() => {
      this.canvasBlocks.forEach(block => {
        this.updateBlockDimensions(block);
        this.jsPlumbFlowService.setupBlock(`block-${block.id}`);
      });
      this.calculateConnectionPoints();
      this.jsPlumbFlowService.repaintAllConnections();
    }, 100);
  }

  ngOnDestroy(): void {
    this.jsPlumbFlowService.reset();
    this.cleanupDragPreview();
  }

  // New drag-and-drop methods
  onPaletteDragStarted(event: CdkDragStart, block: ChatbotBlock): void {
    this.isDraggingFromPalette = true;
    this.draggedPaletteBlock = { ...block };
    this.createDragPreview(block);
    this.showDropZone(true);

    const draggedElement = event.source.element.nativeElement;
    draggedElement.style.opacity = '0.6';
    draggedElement.style.transform = 'scale(0.95)';
  }

  onPaletteDragEnded(event: CdkDragEnd, block: ChatbotBlock): void {
    const draggedElement = event.source.element.nativeElement;
    draggedElement.style.opacity = '1';
    draggedElement.style.transform = 'scale(1)';

    if (this.isOverDropZone && this.dropPreviewPosition) {
      this.addBlockToCanvasAtPosition(block, this.dropPreviewPosition.x, this.dropPreviewPosition.y);
    }

    this.cleanupPaletteDrag();
  }

  private createDragPreview(block: ChatbotBlock): void {
    this.dragPreviewElement = document.createElement('div');
    this.dragPreviewElement.className = 'drag-preview-block';
    this.dragPreviewElement.innerHTML = `
      <div class="drag-preview-content">
        <div class="drag-preview-icon">
          ${block.imageUrl ? 
            `<img src="${block.imageUrl}" alt="block-icon" class="preview-icon-img">` : 
            `<mat-icon>${block.icon}</mat-icon>`
          }
        </div>
        <div class="drag-preview-text">
          <div class="drag-preview-name">${block.name}</div>
          ${block.description ? `<div class="drag-preview-description">${block.description}</div>` : ''}
        </div>
      </div>
    `;

    this.dragPreviewElement.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      background: white;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      min-width: 200px;
      max-width: 280px;
      opacity: 0.9;
      transform: scale(0.9);
      transition: none;
    `;

    document.body.appendChild(this.dragPreviewElement);
  }

  private showDropZone(show: boolean): void {
    if (this.canvasWrapper && this.canvasWrapper.nativeElement) {
      if (show) {
        this.canvasWrapper.nativeElement.classList.add('drop-zone-active');
      } else {
        this.canvasWrapper.nativeElement.classList.remove('drop-zone-active');
      }
    }
  }

  private cleanupDragPreview(): void {
    if (this.dragPreviewElement) {
      document.body.removeChild(this.dragPreviewElement);
      this.dragPreviewElement = null;
    }
  }

  private cleanupPaletteDrag(): void {
    this.isDraggingFromPalette = false;
    this.draggedPaletteBlock = null;
    this.isOverDropZone = false;
    this.dropPreviewPosition = null;
    this.showDropZone(false);
    this.cleanupDragPreview();
  }

  private addBlockToCanvasAtPosition(block: ChatbotBlock, x: number, y: number): void {
    const newBlockId = `${block.type}-${Date.now()}`;

    const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
    const canvasX = (x - canvasRect.left - this.panOffsetX) / this.zoomLevel;
    const canvasY = (y - canvasRect.top - this.panOffsetY) / this.zoomLevel;

    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: canvasX - 100, // Center the block on drop position
      y: canvasY - 50,
      content: block.type === 'textResponse' ? '' : undefined,
      keywordGroups: block.subType === 'keywordGroup' ? [[]] : undefined,
      phraseText: block.subType === 'phrase' ? '' : undefined,
      customMessage: block.subType === 'anything' ? '' : undefined,
      delaySeconds: block.type === 'typingDelay' ? 1 : undefined,
      mediaId: block.type === 'mediaBlock' ? undefined : undefined,
      mediaType: block.type === 'mediaBlock' ? 'text' : undefined,
      singleImageUrl: block.type === 'mediaBlock' ? '' : undefined,
      videoUrl: block.type === 'mediaBlock' ? '' : undefined,
      audioUrl: block.type === 'mediaBlock' ? '' : undefined,
      fileUrl: block.type === 'mediaBlock' ? '' : undefined,
      mediaName: block.type === 'mediaBlock' ? undefined : undefined,
      linkStoryId: block.type === 'linkStory' ? undefined : undefined,
      linkStoryName: block.type === 'linkStory' ? undefined : undefined,
      formId: block.type === 'conversationalForm' ? undefined : undefined,
      formName: block.type === 'conversationalForm' ? '' : undefined,
      webhookUrl: block.type === 'conversationalForm' ? '' : undefined,
      sendEmailNotification: block.type === 'conversationalForm' ? false : undefined,
      notificationEmail: block.type === 'conversationalForm' ? '' : undefined,
      formFields: block.type === 'conversationalForm' ? [{ name: 'New Field', type: 'text', required: false, promptPhrase: 'What information do you need?' }] : undefined,
      showAsInlineForm: block.type === 'conversationalForm' ? false : undefined,
      apiEndpoint: block.type === 'jsonApi' ? '' : undefined,
      requestType: block.type === 'jsonApi' ? 'POST' : undefined,
      apiHeaders: block.type === 'jsonApi' ? [] : undefined
    };

    this.canvasBlocks.push(newBlock);

    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`);
      this.calculateConnectionPoints();
      this.selectBlock(newBlock);
      this.displayMessageBox(`${newBlock.name} added to canvas!`, 'success');

      // Auto-connection logic
      const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
      const dropCanvasX = (canvasX - 100 + 140);
      const dropCanvasY = (canvasY - 50 + 75);
      const nearConn = this.jsPlumbFlowService.findConnectionNear(dropCanvasX, dropCanvasY, 30);

      if (nearConn) {
        const sourceId = nearConn.sourceId.replace('block-', '');
        const targetId = nearConn.targetId.replace('block-', '');
        this.jsPlumbFlowService.deleteJsPlumbConnection(nearConn);
        this.createConnection(sourceId, newBlock.id);
        this.createConnection(newBlock.id, targetId);
      } else {
        const lastBlock = this.canvasBlocks.length > 1 ? this.canvasBlocks[this.canvasBlocks.length - 2] : null;
        if (lastBlock) {
          this.createConnection(lastBlock.id, newBlock.id);
        }
      }
    }, 100);
  }

  // Existing drag-and-drop methods (unchanged)
  onBlockDragStarted(event: CdkDragStart, block: ChatbotBlock): void {
    this.isDraggingBlock = true;
    this.draggedBlockId = block.id;
    this.calculateConnectionPoints();
    this.showConnectionPoints(true);

    const draggedElement = event.source.element.nativeElement;
    draggedElement.style.zIndex = '1000';
    draggedElement.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
    draggedElement.style.transform = 'scale(1.02)';
  }

  onBlockDragEnded(event: CdkDragEnd, block: ChatbotBlock): void {
    const transform = event.source.getFreeDragPosition();

    const draggedElement = event.source.element.nativeElement;
    draggedElement.style.zIndex = '';
    draggedElement.style.boxShadow = '';
    draggedElement.style.transform = '';

    block.x = (block.x || 0) + transform.x / this.zoomLevel;
    block.y = (block.y || 0) + transform.y / this.zoomLevel;

    event.source._dragRef.reset();

    if (this.nearestConnectionPoint && this.draggedBlockId) {
      this.createConnection(this.draggedBlockId, this.nearestConnectionPoint.blockId);
    }

    this.showConnectionPoints(false);
    this.isDraggingBlock = false;
    this.draggedBlockId = null;
    this.nearestConnectionPoint = null;

    this.updateConnections();
    setTimeout(() => {
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints();
    }, 50);
  }

  private calculateConnectionPoints(): void {
    this.connectionPoints = [];

    this.canvasBlocks.forEach(block => {
      const blockElement = document.getElementById(`block-${block.id}`);
      if (blockElement) {
        const rect = blockElement.getBoundingClientRect();
        const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();

        const inputPoint = {
          blockId: block.id,
          x: (block.x || 0) + (rect.width / 2 / this.zoomLevel),
          y: (block.y || 0),
          element: blockElement
        };

        this.connectionPoints.push(inputPoint);
      }
    });
  }

  private findNearestConnectionPoint(draggedBlock: ChatbotBlock): NearestConnectionPoint | null {
    if (!draggedBlock) {
      return null;
    }

    const draggedBlockElement = document.getElementById(`block-${draggedBlock.id}`);
    if (!draggedBlockElement) {
      return null;
    }

    const draggedBlockRect = draggedBlockElement.getBoundingClientRect();
    const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();

    const draggedX = (draggedBlockRect.left + draggedBlockRect.width / 2 - canvasRect.left) / this.zoomLevel;
    const draggedY = (draggedBlockRect.bottom - canvasRect.top) / this.zoomLevel;

    let nearestPoint: NearestConnectionPoint | null = null;
    let minDistance = Infinity;

    for (const point of this.connectionPoints) {
      if (point.blockId === draggedBlock.id) {
        continue;
      }

      const distance = Math.sqrt(
        Math.pow(point.x - draggedX, 2) + Math.pow(point.y - draggedY, 2)
      );

      if (distance <= this.CONNECTION_SNAP_DISTANCE && distance < minDistance) {
        minDistance = distance;
        nearestPoint = {
          blockId: point.blockId,
          x: point.x,
          y: point.y
        };
      }
    }
    return nearestPoint;
  }

  private showConnectionPoints(show: boolean): void {
    if (!this.draggedBlockId) return;

    this.canvasBlocks.forEach(block => {
      if (block.id === this.draggedBlockId) return;

      const blockElement = document.getElementById(`block-${block.id}`);
      if (blockElement) {
        let connectionPoint = blockElement.querySelector('.visual-connection-point') as HTMLElement;

        if (show && !connectionPoint) {
          connectionPoint = document.createElement('div');
          connectionPoint.className = 'visual-connection-point';
          connectionPoint.style.cssText = `
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 16px;
            background: #10b981;
            border: 2px solid white;
            border-radius: 50%;
            z-index: 1000;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
            pointer-events: none;
          `;
          blockElement.appendChild(connectionPoint);
        } else if (!show && connectionPoint) {
          connectionPoint.remove();
        }
      }
    });
  }

  private highlightNearestConnectionPoint(): void {
    document.querySelectorAll('.visual-connection-point').forEach(point => {
      (point as HTMLElement).style.background = '#10b981';
      (point as HTMLElement).style.transform = 'translateX(-50%) scale(1)';
    });

    if (this.nearestConnectionPoint) {
      const targetBlock = document.getElementById(`block-${this.nearestConnectionPoint.blockId}`);
      const connectionPoint = targetBlock?.querySelector('.visual-connection-point') as HTMLElement;

      if (connectionPoint) {
        connectionPoint.style.background = '#059669';
        connectionPoint.style.transform = 'translateX(-50%) scale(1.3)';
        connectionPoint.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.6)';
      }
    }
  }

  private createConnection(fromBlockId: string, toBlockId: string): void {
    const connection = this.jsPlumbFlowService.connectBlocks(`block-${fromBlockId}`, `block-${toBlockId}`);
    if (connection) {
      // Connection created successfully
    } else {
      this.displayMessageBox('Could not create connection (might already exist).', 'warning');
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
      this.zoomLevel = parseFloat(newZoom.toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections();
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints();
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.target === this.canvasWrapper.nativeElement || event.target === this.canvasContent.nativeElement) {
      this.isPanning = true;
      this.panStartX = event.clientX - this.panOffsetX;
      this.panStartY = event.clientY - this.panOffsetY;
      this.canvasWrapper.nativeElement.style.cursor = 'grabbing';

      if (this.selectedBlock && !this.isDrawingConnection) {
        this.selectedBlock = null;
        this.closeSidebar();
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      this.panOffsetX = event.clientX - this.panStartX;
      this.panOffsetY = event.clientY - this.panStartY;
      this.updateCanvasTransform();
      this.updateConnections();
      this.jsPlumbFlowService.repaintAllConnections();
    }

    if (this.isDraggingFromPalette && this.dragPreviewElement) {
      this.dragPreviewElement.style.left = (event.clientX + 10) + 'px';
      this.dragPreviewElement.style.top = (event.clientY - 30) + 'px';

      const canvasRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      const isOverCanvas = event.clientX >= canvasRect.left &&
                          event.clientX <= canvasRect.right &&
                          event.clientY >= canvasRect.top &&
                          event.clientY <= canvasRect.bottom;

      if (isOverCanvas !== this.isOverDropZone) {
        this.isOverDropZone = isOverCanvas;
        if (this.isOverDropZone) {
          this.dragPreviewElement.style.borderColor = '#4CAF50';
          this.dragPreviewElement.style.background = '#E8F5E8';
        } else {
          this.dragPreviewElement.style.borderColor = '#FF9800';
          this.dragPreviewElement.style.background = 'white';
        }
      }

      if (this.isOverDropZone) {
        this.dropPreviewPosition = { x: event.clientX, y: event.clientY };
      }
    }

    if (this.isDraggingBlock && this.draggedBlockId) {
      const draggedBlock = this.canvasBlocks.find(b => b.id === this.draggedBlockId);
      if (draggedBlock) {
        this.nearestConnectionPoint = this.findNearestConnectionPoint(draggedBlock);
        this.highlightNearestConnectionPoint();
      }
    }

    if (this.isDrawingConnection && this.connectionStart) {
      const rect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left - this.panOffsetX) / this.zoomLevel;
      const mouseY = (event.clientY - rect.top - this.panOffsetY) / this.zoomLevel;

      this.temporaryConnection = {
        x1: this.connectionStart.x,
        y1: this.connectionStart.y,
        x2: mouseX,
        y2: mouseY
      };
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.isPanning = false;
    this.canvasWrapper.nativeElement.style.cursor = 'default';

    if (this.isDrawingConnection) {
      this.isDrawingConnection = false;
      this.temporaryConnection = null;
      this.connectionStart = null;
    }
  }

  private _filter(value: string): ChatbotBlock[] {
    const filterValue = value.toLowerCase();
    return this.allBlocks.filter(block =>
      block.name.toLowerCase().includes(filterValue) ||
      (block.description && block.description.toLowerCase().includes(filterValue))
    );
  }

  isJarvisVisible: boolean = false;

  toggleJarvis(): void {
    this.isJarvisVisible = !this.isJarvisVisible;
  }

  addBlockToCanvas(block: ChatbotBlock) {
    const lastBlock = this.canvasBlocks.length > 0 ? this.canvasBlocks[this.canvasBlocks.length - 1] : null;
    const verticalSpacing = 60;

    let initialX: number;
    let initialY: number;
    if (lastBlock) {
      initialX = lastBlock.x;
      initialY = (lastBlock.y || 0) + (lastBlock.height || 150) + verticalSpacing;
    } else {
      initialX = this.calculateNewBlockX();
      initialY = this.calculateNewBlockY();
    }

    const newBlockId = `${block.type}-${Date.now()}`;

    const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
    const dropCanvasX = (initialX + 140);
    const dropCanvasY = (initialY + 75);
    const nearConn = this.jsPlumbFlowService.findConnectionNear(dropCanvasX, dropCanvasY, 30);

    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: initialX,
      y: initialY,
      content: block.type === 'textResponse' ? '' : undefined,
      keywordGroups: block.subType === 'keywordGroup' ? [[]] : undefined,
      phraseText: block.subType === 'phrase' ? '' : undefined,
      customMessage: block.subType === 'anything' ? '' : undefined,
      delaySeconds: block.type === 'typingDelay' ? 1 : undefined,
      mediaId: block.type === 'mediaBlock' ? undefined : undefined,
      mediaType: block.type === 'mediaBlock' ? 'text' : undefined,
      singleImageUrl: block.type === 'mediaBlock' ? '' : undefined,
      videoUrl: block.type === 'mediaBlock' ? '' : undefined,
      audioUrl: block.type === 'mediaBlock' ? '' : undefined,
      fileUrl: block.type === 'mediaBlock' ? '' : undefined,
      mediaName: block.type === 'mediaBlock' ? undefined : undefined,
      linkStoryId: block.type === 'linkStory' ? undefined : undefined,
      linkStoryName: block.type === 'linkStory' ? undefined : undefined,
      formId: block.type === 'conversationalForm' ? undefined : undefined,
      formName: block.type === 'conversationalForm' ? '' : undefined,
      webhookUrl: block.type === 'conversationalForm' ? '' : undefined,
      sendEmailNotification: block.type === 'conversationalForm' ? false : undefined,
      notificationEmail: block.type === 'conversationalForm' ? '' : undefined,
      formFields: block.type === 'conversationalForm' ? [{ name: 'New Field', type: 'text', required: false, promptPhrase: 'What information do you need?' }] : undefined,
      showAsInlineForm: block.type === 'conversationalForm' ? false : undefined,
      apiEndpoint: block.type === 'jsonApi' ? '' : undefined,
      requestType: block.type === 'jsonApi' ? 'POST' : undefined,
      apiHeaders: block.type === 'jsonApi' ? [] : undefined
    };

    this.canvasBlocks.push(newBlock);

    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`);
      this.calculateConnectionPoints();
      this.selectBlock(newBlock);

      if (nearConn) {
        const sourceId = nearConn.sourceId.replace('block-', '');
        const targetId = nearConn.targetId.replace('block-', '');
        this.jsPlumbFlowService.deleteJsPlumbConnection(nearConn);
        this.createConnection(sourceId, newBlock.id);
        this.createConnection(newBlock.id, targetId);
      } else if (lastBlock) {
        this.createConnection(lastBlock.id, newBlock.id);
      }
    }, 100);
  }

  private calculateNewBlockX(): number {
    if (this.canvasWrapper) {
      const wrapperRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      const canvasScrollLeft = this.canvasWrapper.nativeElement.scrollLeft;
      const centerX = (canvasScrollLeft + wrapperRect.width / 2 - this.panOffsetX) / this.zoomLevel;
      return centerX - 100;
    }
    return 300 + (this.canvasBlocks.length * 50);
  }

  private calculateNewBlockY(): number {
    if (this.canvasWrapper) {
      const wrapperRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      const canvasScrollTop = this.canvasWrapper.nativeElement.scrollTop;
      const centerY = (canvasScrollTop + wrapperRect.height / 2 - this.panOffsetY) / this.zoomLevel;
      return centerY - 50;
    }
    return 100 + (this.canvasBlocks.length * 200);
  }

  onBlockUpdated(updatedBlock: ChatbotBlock) {
    const index = this.canvasBlocks.findIndex(b => b.id === updatedBlock.id);
    if (index > -1) {
      this.canvasBlocks[index] = updatedBlock;
      if (this.selectedBlock?.id === updatedBlock.id) {
        this.selectedBlock = updatedBlock;
      }
      this.updateConnections();
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints();
    }
  }

  editCanvasBlock(block: ChatbotBlock) {
    this.selectBlock(block);
  }

  removeCanvasBlock(blockId: string) {
    this.jsPlumbFlowService.removeBlock(`block-${blockId}`);
    this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== blockId);
    this.connections = this.connections.filter(c =>
      c.fromBlockId !== blockId && c.toBlockId !== blockId
    );

    if (this.selectedBlock?.id === blockId) {
      this.selectedBlock = null;
      this.closeSidebar();
    }

    this.updateConnections();
    this.calculateConnectionPoints();
    this.jsPlumbFlowService.repaintAllConnections();
  }

  duplicateCanvasBlock(block: ChatbotBlock) {
    const newBlockId = `${block.type}-${Date.now()}-dup`;
    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: (block.x || 0) + 30,
      y: (block.y || 0) + 30,
      keywordGroups: block.keywordGroups ? block.keywordGroups.map(group => [...group]) : undefined,
      formFields: block.formFields ? block.formFields.map(field => ({ ...field })) : undefined
    };

    this.canvasBlocks.push(newBlock);

    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`);
      this.calculateConnectionPoints();
      this.selectBlock(newBlock);
    }, 100);
  }

  onBlockDropped(event: CdkDragDrop<ChatbotBlock[], ChatbotBlock[]>) {
    const block = event.item.data as ChatbotBlock;
    if (this.isOverDropZone && this.dropPreviewPosition) {
      this.addBlockToCanvasAtPosition(block, this.dropPreviewPosition.x, this.dropPreviewPosition.y);
    } else {
      this.addBlockToCanvas(block);
    }
  }

  drop(event: CdkDragDrop<ChatbotBlock[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  startConnection(event: MouseEvent, block: ChatbotBlock) {
    event.stopPropagation();
    this.isDrawingConnection = true;

    const blockElement = (event.target as HTMLElement).closest('.canvas-block');
    if (!blockElement) return;

    const outputPointElement = blockElement.querySelector('.connection-output .connection-dot') as HTMLElement;
    if (!outputPointElement) return;

    const blockRect = blockElement.getBoundingClientRect();
    const outputPointRect = outputPointElement.getBoundingClientRect();
    const canvasContentRect = this.canvasContent.nativeElement.getBoundingClientRect();

    const startX = (outputPointRect.left + outputPointRect.width / 2 - canvasContentRect.left) / this.zoomLevel;
    const startY = (outputPointRect.top + outputPointRect.height / 2 - canvasContentRect.top) / this.zoomLevel;

    this.connectionStart = {
      blockId: block.id,
      x: startX,
      y: startY
    };
  }

  endConnection(event: MouseEvent, block: ChatbotBlock) {
    event.stopPropagation();
    if (this.isDrawingConnection && this.connectionStart && this.connectionStart.blockId !== block.id) {
      const targetBlockElement = (event.target as HTMLElement).closest('.canvas-block');
      if (!targetBlockElement) {
        this.isDrawingConnection = false;
        this.temporaryConnection = null;
        this.connectionStart = null;
        return;
      }

      const inputPointElement = targetBlockElement.querySelector('.connection-input .connection-dot') as HTMLElement;
      if (!inputPointElement) {
        this.isDrawingConnection = false;
        this.temporaryConnection = null;
        this.connectionStart = null;
        return;
      }

      this.createConnection(this.connectionStart.blockId, block.id);
    }
    this.isDrawingConnection = false;
    this.temporaryConnection = null;
    this.connectionStart = null;
    this.updateConnections();
  }

  updateConnections() {
    this.connections.forEach(conn => {
      const fromBlock = this.canvasBlocks.find(b => b.id === conn.fromBlockId);
      const toBlock = this.canvasBlocks.find(b => b.id === conn.toBlockId);

      if (fromBlock && toBlock) {
        const fromBlockElement = document.getElementById(`block-${fromBlock.id}`);
        const toBlockElement = document.getElementById(`block-${toBlock.id}`);

        if (fromBlockElement && toBlockElement) {
          const canvasContentRect = this.canvasContent.nativeElement.getBoundingClientRect();

          const fromX = (fromBlockElement.getBoundingClientRect().left + fromBlockElement.offsetWidth / 2 - canvasContentRect.left) / this.zoomLevel;
          const fromY = (fromBlockElement.getBoundingClientRect().bottom - canvasContentRect.top) / this.zoomLevel;

          const toX = (toBlockElement.getBoundingClientRect().left + toBlockElement.offsetWidth / 2 - canvasContentRect.left) / this.zoomLevel;
          const toY = (toBlockElement.getBoundingClientRect().top - canvasContentRect.top) / this.zoomLevel;

          conn.fromPoint = { x: fromX, y: fromY };
          conn.toPoint = { x: toX, y: toY };
        }
      }
    });
  }

  updateBlockDimensions(block: ChatbotBlock) {
    const blockElement = this.canvasContent.nativeElement.querySelector(`.canvas-block[id="block-${block.id}"]`);
    if (blockElement) {
      block.width = blockElement.offsetWidth;
      block.height = blockElement.offsetHeight;
      this.updateConnections();
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints();
    }
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel + this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections();
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints();
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel - this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections();
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints();
    }
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panOffsetX = 0;
    this.panOffsetY = 0;
    this.updateCanvasTransform();
    this.updateConnections();
    this.jsPlumbFlowService.repaintAllConnections();
    this.calculateConnectionPoints();
  }

  updateCanvasTransform() {
    if (this.canvasContent) {
      this.canvasContent.nativeElement.style.transform =
        `translate(${this.panOffsetX}px, ${this.panOffsetY}px) scale(${this.zoomLevel})`;
      this.canvasContent.nativeElement.style.transformOrigin = '0 0';
    }

    if (this.svgCanvas) {
      this.svgCanvas.nativeElement.style.transform =
        `translate(${this.panOffsetX}px, ${this.panOffsetY}px) scale(${this.zoomLevel})`;
      this.svgCanvas.nativeElement.style.transformOrigin = '0 0';
    }
  }

  selectBlock(block: ChatbotBlock) {
    this.selectedBlock = block;
    this.rightSidebarOpen = true;
  }

  closeSidebar() {
    this.rightSidebarOpen = false;
    this.selectedBlock = null;
  }

  saveFlow() {
    const jsPlumbInternalConnections = this.jsPlumbFlowService.getConnections().map(conn => ({
      sourceId: conn.sourceId.replace('block-', ''),
      targetId: conn.targetId.replace('block-', ''),
      id: conn.id
    }));

    const flowData = {
      blocks: this.canvasBlocks,
      connections: jsPlumbInternalConnections,
    };
    console.log('Chatbot flow saved!', flowData);
    this.displayMessageBox('Chatbot flow saved successfully!', 'success');
  }

  displayMessageBox(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    this.messageBoxContent = message;
    this.messageBoxType = type;
    this.showMessageBox = true;
  }

  onMessageBoxClosed() {
    this.showMessageBox = false;
    this.messageBoxContent = '';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'normal': return '#f1f4fc';
      case 'error': return '#F44336';
      case 'new': return '#FF9800';
      case 'disabled': return '#9E9E9E';
      default: return '#4CAF50';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'userInput': return '#E1F5FE';
      case 'textResponse': return '#F3E5F5';
      case 'mediaBlock': return '#E8F5E8';
      case 'linkStory': return '#FFF3E0';
      case 'notifyAgent': return '#FFEBEE';
      case 'conversationalForm': return '#F1F8E9';
      case 'typingDelay': return '#ECEFF1';
      case 'conditionalRedirect': return '#E0F2F1';
      case 'rssFeed': return '#FCE4EC';
      case 'jsonApi': return '#E3F2FD';
      case 'shopify': return '#EFEBE9';
      default: return '#F5F5F5';
    }
  }

  onAddKeywordGroupBlockToCanvas(): void {
    const keywordGroupBlueprint = this.allBlocks.find(
      block => block.type === 'userInput' && block.subType === 'keywordGroup'
    );

    if (keywordGroupBlueprint) {
      this.addBlockToCanvas(keywordGroupBlueprint);
      this.displayMessageBox('New Keyword Group block added to canvas.', 'success');
    } else {
      this.displayMessageBox('Could not find a Keyword Group block blueprint to add.', 'error');
    }
  }
}