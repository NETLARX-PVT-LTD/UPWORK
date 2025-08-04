import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { ChatbotBlock, Connection, AvailableMedia, AvailableStory, AvailableForm, FormField } from '../models/chatbot-block.model';
// import { jsPlumb } from 'jsplumb'; // REMOVED - jsPlumb is now managed by the service

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

// Import the new JsPlumbFlowService
import { JsPlumbFlowService } from './services/jsplumb-flow.service';

// Add this type declaration here (or ensure it's in a shared models file)
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
    // Block components
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
  // instance: any; // REMOVED - Managed by JsPlumbFlowService
  @ViewChild('canvasWrapper') canvasWrapper!: ElementRef;
  @ViewChild('canvasContent') canvasContent!: ElementRef;
  @ViewChild('svgCanvas') svgCanvas!: ElementRef; // Potentially remove this if not drawing custom SVG connections

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
      "id": "5",
      "name": "Media block",
      "icon": "image",
      "type": "mediaBlock",
      "imageUrl": "https://app.botsify.com/theme/images/Story-Icons/media.png",
      "status": "normal",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "mediaId": undefined,
      "mediaType": undefined,
      // "mediaUrl": undefined,
      "mediaName": undefined
    },
    {
      "id": "6",
      "name": "Link Story",
      "icon": "insert_link",
      "type": "linkStory",
      "imageUrl": "https://app.botsify.com/theme/images/Story-Icons/story.png",
      "status": "normal",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "linkStoryId": undefined,
      "linkStoryName": undefined
    },
    {
      "id": "7",
      "name": "Conversational Form",
      "imageUrl": "http://app.botsify.com/theme/images/Story-Icons/form.png",
      "icon": "list_alt",
      "type": "conversationalForm",
      "status": "normal",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "formId": undefined,
      "formName": undefined,
      "webhookUrl": undefined,
      "sendEmailNotification": undefined,
      "notificationEmail": undefined,
      "formFields": undefined,
      "showAsInlineForm": undefined
    },
    {
      "id": "8",
      "name": "Typing Delay",
      "icon": "hourglass_empty",
      "type": "typingDelay",
      "imageUrl": "https://app.botsify.com/theme/images/Story-Icons/typing.png",
      "status": "normal",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "delaySeconds": 1
    },
    {
      "id": "9",
      "name": "JSON API Integration",
      "icon": "code",
      "type": "jsonApi",
      "imageUrl": "https://app.botsify.com/theme/images/Story-Icons/api.png",
      "status": "normal",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0
    }
  ];

  canvasBlocks: ChatbotBlock[] = [];
  connections: Connection[] = []; // Keep this if you want to store a simplified connection model
  filteredBlocks$: Observable<ChatbotBlock[]> | undefined;
  searchControl = new FormControl('');

  // Mock data for dropdowns
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
    { id: 'form-3', name: 'Support Ticket' }
  ];

  availableStories: AvailableStory[] = [
    { id: 'story-1', name: 'Go back to previous story' },
    { id: 'story-2', name: '(Hii),' },
    { id: 'story-3', name: 'Report Incident' },
    { id: 'story-4', name: 'Process for setting up shop' },
  ];

  // Zoom and pan
  zoomLevel: number = 1.0;
  minZoom: number = 0.5;
  maxZoom: number = 2.0;
  zoomStep: number = 0.1;

  // Canvas panning
  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  panOffsetX = 0;
  panOffsetY = 0;

  // Connection drawing - keep existing for manual connections (but consider deprecating if jsPlumb handles all)
  isDrawingConnection = false;
  connectionStart: { blockId: string, x: number, y: number } | null = null;
  temporaryConnection: { x1: number, y1: number, x2: number, y2: number } | null = null;

  // Right Sidebar properties
  selectedBlock: ChatbotBlock | null = null;
  rightSidebarOpen: boolean = false;

  // Message Box properties
  showMessageBox: boolean = false;
  messageBoxContent: string = '';
  messageBoxType: 'info' | 'success' | 'warning' | 'error' = 'info';

  // jsPlumb connection tracking (Simplified - we'll get this from the service)
  // private jsPlumbConnections: any[] = []; // REMOVED - now in service

  // NEW: Visual connection system properties
  isDraggingBlock = false;
  draggedBlockId: string | null = null;
  connectionPoints: Array<{ blockId: string, x: number, y: number, element: HTMLElement }> = [];
  nearestConnectionPoint: { blockId: string, x: number, y: number } | null = null;
  readonly CONNECTION_SNAP_DISTANCE = 50; // pixels

  constructor(private jsPlumbFlowService: JsPlumbFlowService) { } // INJECT THE SERVICE

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

    // Initialize with the starter block
    this.canvasBlocks.push({
      id: 'flow-start', // Use a consistent ID prefix for jsPlumb
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
      id: 'text-response-2', // Use a consistent ID prefix for jsPlumb
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
        id: 'form-block-1', // Use a consistent ID prefix for jsPlumb
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
    }
  }

  ngAfterViewInit(): void {
    // Initialize jsPlumb instance via the service
    if (this.canvasContent && this.canvasContent.nativeElement) {
      this.jsPlumbFlowService.initialize(this.canvasContent.nativeElement);

      // Subscribe to service events
      this.jsPlumbFlowService.connectionCreated.subscribe(connInfo => {
        console.log('Component received connectionCreated:', connInfo);
        // Add to your internal connections model if needed for save/load or other logic
        // For simplicity, we'll let jsPlumb manage the visual connections.
        // If you need to map this back to your `connections` array:
        // this.connections.push({ id: connInfo.connectionId, fromBlockId: connInfo.sourceId.replace('block-', ''), toBlockId: connInfo.targetId.replace('block-', ''), fromPoint: { x: 0, y: 0 }, toPoint: { x: 0, y: 0 } });
        // this.updateConnections(); // This will update connection points but jsPlumb renders the line
      });

      this.jsPlumbFlowService.connectionDeleted.subscribe(connInfo => {
        console.log('Component received connectionDeleted:', connInfo);
        // Remove from your internal connections model if needed
        this.connections = this.connections.filter(c => c.id !== connInfo.connectionId);
      });

      this.jsPlumbFlowService.blockMoved.subscribe(blockId => {
        // Update the block's stored coordinates if needed
        const block = this.canvasBlocks.find(b => `block-${b.id}` === blockId);
        if (block) {
          const blockElement = document.getElementById(blockId);
          if (blockElement) {
            // Get position relative to canvasContent, considering zoom and pan
            const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
            const blockRect = blockElement.getBoundingClientRect();

            block.x = (blockRect.left - canvasRect.left) / this.zoomLevel;
            block.y = (blockRect.top - canvasRect.top) / this.zoomLevel;
            // console.log(`Updated block ${block.id} position to X:${block.x}, Y:${block.y}`);
            this.updateBlockDimensions(block); // Recalculate dimensions after a move
          }
        }
      });
    }

    this.updateCanvasTransform();

    // Set up jsPlumb for existing blocks (after DOM is rendered)
    setTimeout(() => {
      this.canvasBlocks.forEach(block => {
        this.updateBlockDimensions(block); // Ensure dimensions are set before jsPlumb setup
        this.jsPlumbFlowService.setupBlock(`block-${block.id}`);
      });
      this.calculateConnectionPoints(); // Calculate after all blocks are set up
      this.jsPlumbFlowService.repaintAllConnections(); // Initial repaint
    }, 100);
  }

  ngOnDestroy(): void {
    // Reset jsPlumb instance through the service
    this.jsPlumbFlowService.reset();
  }

  // private initializeJsPlumb(): void { ... } // REMOVED - moved to service
  // private setupJsPlumbForBlock(block: ChatbotBlock): void { ... } // REMOVED - moved to service
  // private removeJsPlumbForBlock(blockId: string): void { ... } // REMOVED - logic moved to service

  private calculateConnectionPoints(): void {
    this.connectionPoints = [];

    this.canvasBlocks.forEach(block => {
      const blockElement = document.getElementById(`block-${block.id}`);
      if (blockElement) {
        const rect = blockElement.getBoundingClientRect();
        const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();

        // Calculate input connection point (top center of block)
        // Ensure calculations account for pan and zoom to get actual block position on unscaled canvas
        const inputPoint = {
          blockId: block.id,
          x: (block.x || 0) + (rect.width / 2 / this.zoomLevel), // Use block.x and block.y which are "unscaled"
          y: (block.y || 0),
          element: blockElement
        };

        this.connectionPoints.push(inputPoint);
      }
    });
  }

  /**
   * Finds the nearest connection point to a dragged block within a certain distance.
   */
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

    // Calculate the dragged block's output point (bottom center) in canvas coordinates
    // Use the *current* visual position of the dragged block for connection snapping
    const draggedX = (draggedBlockRect.left + draggedBlockRect.width / 2 - canvasRect.left) / this.zoomLevel;
    const draggedY = (draggedBlockRect.bottom - canvasRect.top) / this.zoomLevel;

    let nearestPoint: NearestConnectionPoint | null = null;
    let minDistance = Infinity; // Use Infinity to find the smallest distance

    for (const point of this.connectionPoints) {
      // Do not allow a block to connect to itself
      if (point.blockId === draggedBlock.id) {
        continue;
      }

      const distance = Math.sqrt(
        Math.pow(point.x - draggedX, 2) + Math.pow(point.y - draggedY, 2)
      );

      // If a connection point is within the snap distance and is closer than the current nearest point
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

  // NEW: Show/hide connection points (visual cues, not jsPlumb endpoints)
  private showConnectionPoints(show: boolean): void {
    if (!this.draggedBlockId) return;

    this.canvasBlocks.forEach(block => {
      if (block.id === this.draggedBlockId) return; // Skip dragged block

      const blockElement = document.getElementById(`block-${block.id}`);
      if (blockElement) {
        let connectionPoint = blockElement.querySelector('.visual-connection-point') as HTMLElement;

        if (show && !connectionPoint) {
          // Create connection point
          connectionPoint = document.createElement('div');
          connectionPoint.className = 'visual-connection-point';
          connectionPoint.style.cssText = `
            position: absolute;
            top: -8px; /* Position it above the block for input */
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
            pointer-events: none; /* Make sure it doesn't interfere with drag events */
          `;
          blockElement.appendChild(connectionPoint);
        } else if (!show && connectionPoint) {
          connectionPoint.remove();
        }
      }
    });
  }

  // NEW: Highlight nearest connection point
  private highlightNearestConnectionPoint(): void {
    // Remove previous highlights
    document.querySelectorAll('.visual-connection-point').forEach(point => {
      (point as HTMLElement).style.background = '#10b981';
      (point as HTMLElement).style.transform = 'translateX(-50%) scale(1)';
    });

    // Highlight nearest point
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

  // NEW: Create connection between blocks using jsPlumb service
  private createConnection(fromBlockId: string, toBlockId: string): void {
    // jsPlumb handles its own internal checks for existing connections
    const connection = this.jsPlumbFlowService.connectBlocks(`block-${fromBlockId}`, `block-${toBlockId}`);
    if (connection) {
      // The service's connectionCreated event will handle the message box
    } else {
      this.displayMessageBox('Could not create connection (might already exist).', 'warning');
    }
  }

  // MODIFIED: Enhanced drag start handler
  onBlockDragStarted(event: CdkDragStart, block: ChatbotBlock): void {
    this.isDraggingBlock = true;
    this.draggedBlockId = block.id;
    this.calculateConnectionPoints(); // Recalculate based on current positions
    this.showConnectionPoints(true);
  }

  // MODIFIED: Enhanced drag end handler
  onBlockDragEnded(event: CdkDragEnd, block: ChatbotBlock) {
    const transform = event.source.getFreeDragPosition();

    // Update block's stored coordinates relative to the unscaled, unpanned canvas origin
    block.x = (block.x || 0) + transform.x / this.zoomLevel;
    block.y = (block.y || 0) + transform.y / this.zoomLevel;

    // Reset CDK drag position so jsPlumb can take over
    event.source._dragRef.reset();

    // The jsPlumb `stop` event handler in the service will update positions and repaint.
    // We don't need to manually repaintEverything here for the connections themselves.

    // Check for connection creation if snapping was active
    if (this.nearestConnectionPoint && this.draggedBlockId) {
      this.createConnection(this.draggedBlockId, this.nearestConnectionPoint.blockId);
    }

    // Clean up visual elements
    this.showConnectionPoints(false);
    this.isDraggingBlock = false;
    this.draggedBlockId = null;
    this.nearestConnectionPoint = null;

    // This is for your custom SVG connections. If jsPlumb handles all, this can be removed.
    this.updateConnections();

    // Ensure jsPlumb knows the block moved and repaints its attached connections
    // This is implicitly handled by jsPlumb's draggable, but an explicit repaint
    // can sometimes be useful if there are complex layout shifts.
    setTimeout(() => {
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints(); // Recalculate after repaint to ensure accuracy
    }, 50);
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
      this.zoomLevel = parseFloat(newZoom.toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections(); // For custom SVG connections
      this.jsPlumbFlowService.repaintAllConnections(); // Repaint jsPlumb connections
      this.calculateConnectionPoints(); // Recalculate after zoom for snap points
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // Check if the click originated from the canvasWrapper itself, not a block
    if (event.target === this.canvasWrapper.nativeElement || event.target === this.canvasContent.nativeElement) {
      this.isPanning = true;
      // Capture the current pan offset to calculate new offset based on mouse movement
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
      this.updateConnections(); // For custom SVG connections
      this.jsPlumbFlowService.repaintAllConnections(); // Repaint jsPlumb connections during pan
    }

    // NEW: Handle connection point detection during drag
    if (this.isDraggingBlock && this.draggedBlockId) {
      const draggedBlock = this.canvasBlocks.find(b => b.id === this.draggedBlockId);
      if (draggedBlock) {
        this.nearestConnectionPoint = this.findNearestConnectionPoint(draggedBlock);
        this.highlightNearestConnectionPoint();
      }
    }

    // This part is for your custom SVG connections. If you only use jsPlumb, remove it.
    if (this.isDrawingConnection && this.connectionStart) {
      const rect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      // Adjust mouse position for zoom and pan for accurate rendering
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

    // This part is for your custom SVG connections. If you only use jsPlumb, remove it.
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
    const verticalSpacing = 60; // px between blocks

    // Decide initial coordinates
    let initialX: number;
    let initialY: number;
    if (lastBlock) {
      // Stack neatly under the previous block without overlap
      initialX = lastBlock.x;
      initialY = (lastBlock.y || 0) + (lastBlock.height || 150) + verticalSpacing;
    } else {
      // First block – centre of current viewport
      initialX = this.calculateNewBlockX();
      initialY = this.calculateNewBlockY();
    }

    const newBlockId = `${block.type}-${Date.now()}`;

    // If user dropped in the middle of an existing connection line, capture that before we create the new block
    const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
    const dropCanvasX = (initialX + 140) /* approximate centre */;
    const dropCanvasY = (initialY + 75);
    const nearConn = this.jsPlumbFlowService.findConnectionNear(dropCanvasX, dropCanvasY, 30);

    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId, // Ensure unique ID for jsPlumb
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

    // Set up jsPlumb for the new block after it's rendered in the DOM
    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`); // Setup jsPlumb for the new block
      this.calculateConnectionPoints();
      this.selectBlock(newBlock);

      if (nearConn) {
        // Insert between existing connection
        const sourceId = nearConn.sourceId.replace('block-', '');
        const targetId = nearConn.targetId.replace('block-', '');
        // Remove old connection
        this.jsPlumbFlowService.deleteJsPlumbConnection(nearConn);
        // Connect source -> new -> target
        this.createConnection(sourceId, newBlock.id);
        this.createConnection(newBlock.id, targetId);
      } else if (lastBlock) {
        // Otherwise just append under last block
        this.createConnection(lastBlock.id, newBlock.id);
      }
    }, 100);
  }

  private calculateNewBlockX(): number {
    if (this.canvasWrapper) {
      // Calculate a position relative to the center of the visible canvas area
      const wrapperRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      const canvasScrollLeft = this.canvasWrapper.nativeElement.scrollLeft;
      const canvasScrollTop = this.canvasWrapper.nativeElement.scrollTop;

      // Position new block roughly in the center of the currently visible viewport
      const centerX = (canvasScrollLeft + wrapperRect.width / 2 - this.panOffsetX) / this.zoomLevel;
      return centerX - 100; // Offset by half block width
    }
    return 300 + (this.canvasBlocks.length * 50);
  }

  private calculateNewBlockY(): number {
    if (this.canvasWrapper) {
      const wrapperRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      const canvasScrollLeft = this.canvasWrapper.nativeElement.scrollLeft;
      const canvasScrollTop = this.canvasWrapper.nativeElement.scrollTop;

      const centerY = (canvasScrollTop + wrapperRect.height / 2 - this.panOffsetY) / this.zoomLevel;
      return centerY - 50; // Offset by half block height
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
      this.updateConnections(); // For custom SVG connections
      this.jsPlumbFlowService.repaintAllConnections(); // Repaint jsPlumb connections
      this.calculateConnectionPoints(); // Recalculate snap points if block size changed
    }
  }

  editCanvasBlock(block: ChatbotBlock) {
    this.selectBlock(block);
  }

  removeCanvasBlock(blockId: string) {
    // Remove jsPlumb setup for this block via the service
    this.jsPlumbFlowService.removeBlock(`block-${blockId}`);

    this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== blockId);
    // Remove from your custom connections array (if still using it)
    this.connections = this.connections.filter(c =>
      c.fromBlockId !== blockId && c.toBlockId !== blockId
    );

    if (this.selectedBlock?.id === blockId) {
      this.selectedBlock = null;
      this.closeSidebar();
    }

    this.updateConnections(); // For custom SVG connections
    this.calculateConnectionPoints();
    this.jsPlumbFlowService.repaintAllConnections(); // Ensure all remaining connections are valid
  }

  duplicateCanvasBlock(block: ChatbotBlock) {
    const newBlockId = `${block.type}-${Date.now()}-dup`;
    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId, // Ensure unique ID for jsPlumb
      x: (block.x || 0) + 30,
      y: (block.y || 0) + 30,
      keywordGroups: block.keywordGroups ? block.keywordGroups.map(group => [...group]) : undefined,
      formFields: block.formFields ? block.formFields.map(field => ({ ...field })) : undefined
    };

    this.canvasBlocks.push(newBlock);

    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`); // Setup jsPlumb for duplicated block
      this.calculateConnectionPoints();
      this.selectBlock(newBlock);
    }, 100);
  }

  /**
   * Called when a palette item is dropped anywhere on the canvas.
   * We ignore the exact mouse coordinates and instead place the new block
   * using the same helper used when a user clicks the item in the palette.
   * This replicates the behaviour shown in the reference video: every newly
   * added component is positioned neatly beneath the previous one and is
   * automatically connected with jsPlumb.
   */
  onBlockDropped(event: CdkDragDrop<ChatbotBlock[], ChatbotBlock[]>) {
    const block = event.item.data as ChatbotBlock;
    this.addBlockToCanvas(block);
  }

  drop(event: CdkDragDrop<ChatbotBlock[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  // Keep existing connection methods for backward compatibility, but understand their role
  // These `startConnection` and `endConnection` methods currently draw SVG lines.
  // If jsPlumb is handling all connections, these should ideally be removed or repurposed
  // to work with jsPlumb's native connection dragging.
  startConnection(event: MouseEvent, block: ChatbotBlock) {
    event.stopPropagation();
    // This is for your custom SVG connection drawing, not jsPlumb's.
    // If you want jsPlumb connections to be draggable from endpoints,
    // jsPlumb's own 'addEndpoint' configuration handles that.
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
      // This is for your custom SVG connection drawing.
      // If you want to use jsPlumb for this "drag to connect" behavior,
      // you would ideally remove this and configure jsPlumb endpoints to allow connection dragging.
      // However, since you have the snap-to-connect for block dragging, this might be redundant.

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

      // Instead of storing in `this.connections`, call jsPlumb service to create connection
      this.createConnection(this.connectionStart.blockId, block.id);
    }
    this.isDrawingConnection = false;
    this.temporaryConnection = null;
    this.connectionStart = null;
    this.updateConnections(); // For custom SVG connections (will likely become obsolete)
  }

  // This method primarily updates the coordinates for your *custom SVG connections*.
  // If jsPlumb handles all connections, this method, `this.connections` array,
  // and the SVG in your template for drawing lines can be removed.
  updateConnections() {
    this.connections.forEach(conn => {
      const fromBlock = this.canvasBlocks.find(b => b.id === conn.fromBlockId);
      const toBlock = this.canvasBlocks.find(b => b.id === conn.toBlockId);

      if (fromBlock && toBlock) {
        // Use the actual block elements for more accurate positioning
        const fromBlockElement = document.getElementById(`block-${fromBlock.id}`);
        const toBlockElement = document.getElementById(`block-${toBlock.id}`);

        if (fromBlockElement && toBlockElement) {
          // Adjust to get the center of the output/input points of the actual blocks
          // These points are already handled by jsPlumb. For custom SVG, re-calculate.
          const canvasContentRect = this.canvasContent.nativeElement.getBoundingClientRect();

          // Calculate center of bottom of fromBlock relative to canvasContent's unscaled origin
          const fromX = (fromBlockElement.getBoundingClientRect().left + fromBlockElement.offsetWidth / 2 - canvasContentRect.left) / this.zoomLevel;
          const fromY = (fromBlockElement.getBoundingClientRect().bottom - canvasContentRect.top) / this.zoomLevel;

          // Calculate center of top of toBlock relative to canvasContent's unscaled origin
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
      this.updateConnections(); // For custom SVG connections
      this.jsPlumbFlowService.repaintAllConnections(); // Repaint jsPlumb connections if block dimensions change
      this.calculateConnectionPoints(); // Recalculate snap points if block size changed
    }
  }

  // Zoom controls
  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel + this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections(); // For custom SVG connections
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints();
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel - this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections(); // For custom SVG connections
      this.jsPlumbFlowService.repaintAllConnections();
      this.calculateConnectionPoints();
    }
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panOffsetX = 0;
    this.panOffsetY = 0;
    this.updateCanvasTransform();
    this.updateConnections(); // For custom SVG connections
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

  // Right Sidebar Block Selection and Management
  selectBlock(block: ChatbotBlock) {
    this.selectedBlock = block;
    this.rightSidebarOpen = true;
  }

  closeSidebar() {
    this.rightSidebarOpen = false;
    this.selectedBlock = null;
  }

  // Save functionality
  saveFlow() {
    const jsPlumbInternalConnections = this.jsPlumbFlowService.getConnections().map(conn => ({
      sourceId: conn.sourceId.replace('block-', ''), // Store just the block ID
      targetId: conn.targetId.replace('block-', ''), // Store just the block ID
      id: conn.id // jsPlumb's internal connection ID
    }));

    const flowData = {
      blocks: this.canvasBlocks,
      connections: jsPlumbInternalConnections, // Now primarily saving jsPlumb connections
      // If you still have custom SVG connections for some reason:
      // customSvgConnections: this.connections
    };
    console.log('Chatbot flow saved!', flowData);
    this.displayMessageBox('Chatbot flow saved successfully!', 'success');
  }

  // Message Box methods
  displayMessageBox(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    this.messageBoxContent = message;
    this.messageBoxType = type;
    this.showMessageBox = true;
  }

  onMessageBoxClosed() {
    this.showMessageBox = false;
    this.messageBoxContent = '';
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'normal': return '##f1f4fc';
      case 'error': return '#F44336';
      case 'new': return '#FF9800';
      case 'disabled': return '#9E9E9E';
      default: return '#4CAF50';
    }
  }

  // Get type-specific colors
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