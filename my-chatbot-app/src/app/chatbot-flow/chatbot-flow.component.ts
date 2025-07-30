// src/app/chatbot-flow/chatbot-flow.component.ts - Enhanced with visual connection system
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { ChatbotBlock, Connection, AvailableMedia, AvailableStory, AvailableForm, FormField } from '../models/chatbot-block.model';
import { jsPlumb } from 'jsplumb';

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
// Add this type declaration here.
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
  instance: any;
  @ViewChild('canvasWrapper') canvasWrapper!: ElementRef;
  @ViewChild('canvasContent') canvasContent!: ElementRef;
  @ViewChild('svgCanvas') svgCanvas!: ElementRef;

  allBlocks: ChatbotBlock[] = [
    {
      id: '1',
      name: 'User Input',
      imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/user-message.png',
      icon:'',
      type: 'userInput',
      status:'normal',
      x: 0,
      y: 0,
      subType: 'phrase',
      description:'Phrase',
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
      description:'Keyword Group',
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
      description:'Type Anything',
      subType: 'anything',
      width: 0,
      height: 0
    },
    {
      id: '4', 
      name: 'Text Response', 
      icon: 'text_fields', 
      imageUrl:'https://app.botsify.com/theme/images/Story-Icons/bot-message.png',
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
    "mediaUrl": undefined,
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
  connections: Connection[] = [];
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

  // Connection drawing - keep existing for manual connections
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

  // jsPlumb connection tracking
  private jsPlumbConnections: any[] = [];

  // NEW: Visual connection system properties
  isDraggingBlock = false;
  draggedBlockId: string | null = null;
  connectionPoints: Array<{blockId: string, x: number, y: number, element: HTMLElement}> = [];
  nearestConnectionPoint: {blockId: string, x: number, y: number} | null = null;
  readonly CONNECTION_SNAP_DISTANCE = 50; // pixels

  constructor() { }

  ngOnInit(): void {
    this.filteredBlocks$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._filter(value || ''))
    );

    // Initialize with the starter block
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
  }

  ngAfterViewInit(): void {
    this.initializeJsPlumb();
    this.updateCanvasTransform();
    
    // Set initial dimensions for the starting block
    setTimeout(() => {
      this.updateBlockDimensions(this.canvasBlocks[0]);
      this.setupJsPlumbForBlock(this.canvasBlocks[0]);
      this.calculateConnectionPoints();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.instance) {
      this.instance.reset();
    }
  }

  private initializeJsPlumb(): void {
    // Initialize jsPlumb instance
    this.instance = jsPlumb.getInstance({
      Container: this.canvasContent.nativeElement,
      ConnectionOverlays: [
        ['Arrow', {
          location: 1,
          id: 'arrow',
          length: 10,
          width: 10,
        }]
      ],
      PaintStyle: {
        stroke: '#4f46e5',
        strokeWidth: 2
      },
      HoverPaintStyle: {
        stroke: '#7c3aed',
        strokeWidth: 3
      },
      EndpointStyle: {
        fill: '#4f46e5'
      },
      EndpointHoverStyle: {
        fill: '#7c3aed'
      },
      Connector: ['Flowchart', { 
        stub: [40, 60], 
        gap: 10, 
        cornerRadius: 5, 
        alwaysRespectStubs: true 
      }]
    });

    // Enable connection creation by clicking
    this.instance.bind('connection', (info: any) => {
      console.log('Connection created:', info);
      this.jsPlumbConnections.push(info.connection);
    });

    // Handle connection clicks for deletion
    this.instance.bind('click', (connection: any) => {
      if (confirm('Delete this connection?')) {
        this.instance.deleteConnection(connection);
        this.jsPlumbConnections = this.jsPlumbConnections.filter(conn => conn !== connection);
      }
    });
  }

  private setupJsPlumbForBlock(block: ChatbotBlock): void {
    const blockId = `block-${block.id}`;
    
    // Wait for DOM element to be available
    setTimeout(() => {
      const blockElement = document.getElementById(blockId);
      if (!blockElement) {
        console.warn(`Block element not found: ${blockId}`);
        return;
      }

      // Make the block draggable
      this.instance.draggable(blockElement, {
        grid: [10, 10],
        containment: 'parent'
      });

      // Add source endpoint (output) - positioned at bottom center
      this.instance.addEndpoint(blockElement, {
        anchor: 'Bottom',
        isSource: true,
        maxConnections: -1,
        endpoint: ['Dot', { radius: 8 }],
        paintStyle: { fill: '#4f46e5' },
        connectorStyle: { stroke: '#4f46e5', strokeWidth: 2 },
        connector: ['Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5 }],
        overlays: [
          ['Arrow', { location: 1, length: 10, width: 10 }]
        ]
      });

      // Add target endpoint (input) - positioned at top center
      this.instance.addEndpoint(blockElement, {
        anchor: 'Top',
        isTarget: true,
        maxConnections: -1,
        endpoint: ['Dot', { radius: 8 }],
        paintStyle: { fill: '#10b981' },
        hoverPaintStyle: { fill: '#059669' }
      });

      console.log(`jsPlumb setup completed for block: ${blockId}`);
    }, 50);
  }

  private removeJsPlumbForBlock(blockId: string): void {
    const elementId = `block-${blockId}`;
    const blockElement = document.getElementById(elementId);
    
    if (blockElement && this.instance) {
      // Remove all connections for this block
      this.instance.removeAllEndpoints(blockElement);
      
      // Remove from draggable
      this.instance.setDraggable(blockElement, false);
      
      // Filter out connections involving this block
      this.jsPlumbConnections = this.jsPlumbConnections.filter(conn => {
        const sourceId = conn.sourceId;
        const targetId = conn.targetId;
        return sourceId !== elementId && targetId !== elementId;
      });
    }
  }

  // NEW: Calculate connection points for all blocks
  private calculateConnectionPoints(): void {
    this.connectionPoints = [];
    
    this.canvasBlocks.forEach(block => {
      const blockElement = document.getElementById(`block-${block.id}`);
      if (blockElement) {
        const rect = blockElement.getBoundingClientRect();
        const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
        
        // Calculate input connection point (top center of block)
        const inputPoint = {
          blockId: block.id,
          x: (rect.left + rect.width / 2 - canvasRect.left) / this.zoomLevel - this.panOffsetX / this.zoomLevel,
          y: (rect.top - canvasRect.top) / this.zoomLevel - this.panOffsetY / this.zoomLevel,
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
  const draggedX = (draggedBlockRect.left + draggedBlockRect.width / 2 - canvasRect.left) / this.zoomLevel - this.panOffsetX / this.zoomLevel;
  const draggedY = (draggedBlockRect.bottom - canvasRect.top) / this.zoomLevel - this.panOffsetY / this.zoomLevel;

  let nearestPoint: NearestConnectionPoint | null = null;
  let minDistance = Infinity; // Use Infinity to find the smallest distance

  // Use a standard for-of loop to avoid any potential scope issues with forEach
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

  // Return the best-found point, or null if none were found
  return nearestPoint;
}

  // NEW: Show/hide connection points
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

  // NEW: Create connection between blocks
  private createConnection(fromBlockId: string, toBlockId: string): void {
    // Check if connection already exists
    const existingConnection = this.jsPlumbConnections.find(conn => 
      conn.sourceId === `block-${fromBlockId}` && conn.targetId === `block-${toBlockId}`
    );
    
    if (existingConnection) {
      this.displayMessageBox('Connection already exists between these blocks.', 'warning');
      return;
    }
    
    // Create jsPlumb connection
    const sourceElement = document.getElementById(`block-${fromBlockId}`);
    const targetElement = document.getElementById(`block-${toBlockId}`);
    
    if (sourceElement && targetElement && this.instance) {
      const connection = this.instance.connect({
        source: sourceElement,
        target: targetElement,
        anchor: ['Bottom', 'Top'],
        endpoint: ['Dot', { radius: 8 }],
        connector: ['Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5 }],
        paintStyle: { stroke: '#4f46e5', strokeWidth: 2 },
        overlays: [
          ['Arrow', { location: 1, length: 10, width: 10 }]
        ]
      });
      
      if (connection) {
        this.jsPlumbConnections.push(connection);
        this.displayMessageBox('Connection created successfully!', 'success');
      }
    }
  }

  // MODIFIED: Enhanced drag start handler
  onBlockDragStarted(event: CdkDragStart, block: ChatbotBlock): void {
    this.isDraggingBlock = true;
    this.draggedBlockId = block.id;
    this.calculateConnectionPoints();
    this.showConnectionPoints(true);
  }

  // MODIFIED: Enhanced drag end handler
  onBlockDragEnded(event: CdkDragEnd, block: ChatbotBlock) {
    const transform = event.source.getFreeDragPosition();
    block.x = (block.x || 0) + transform.x / this.zoomLevel;
    block.y = (block.y || 0) + transform.y / this.zoomLevel;
    event.source._dragRef.reset();
    
    // Check for connection creation
    if (this.nearestConnectionPoint && this.draggedBlockId) {
      this.createConnection(this.draggedBlockId, this.nearestConnectionPoint.blockId);
    }
    
    // Clean up visual elements
    this.showConnectionPoints(false);
    this.isDraggingBlock = false;
    this.draggedBlockId = null;
    this.nearestConnectionPoint = null;
    
    this.updateConnections();
    
    // Repaint jsPlumb connections after drag
    if (this.instance) {
      setTimeout(() => {
        this.instance.repaintEverything();
        this.calculateConnectionPoints();
      }, 50);
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
      
      // Repaint jsPlumb connections after zoom
      if (this.instance) {
        this.instance.repaintEverything();
      }
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.target === this.canvasWrapper.nativeElement) {
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
      
      // Repaint jsPlumb connections during pan
      if (this.instance) {
        this.instance.repaintEverything();
      }
    }

    // NEW: Handle connection point detection during drag
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
    const newBlockId = `${block.type}-${Date.now()}`;
    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: this.calculateNewBlockX(),
      y: this.calculateNewBlockY(),
      content: block.type === 'textResponse' ? '' : undefined,
      keywordGroups: block.subType === 'keywordGroup' ? [[]] : undefined,
      phraseText: block.subType === 'phrase' ? '' : undefined,
      customMessage: block.subType === 'anything' ? '' : undefined,
      delaySeconds: block.type === 'typingDelay' ? 1 : undefined,
      mediaId: block.type === 'mediaBlock' ? undefined : undefined,
      mediaType: block.type === 'mediaBlock' ? 'text' : undefined,
      mediaUrl: block.type === 'mediaBlock' ? '' : undefined,
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
      this.setupJsPlumbForBlock(newBlock);
      this.calculateConnectionPoints();
      this.selectBlock(newBlock);
    }, 100);
  }

  private calculateNewBlockX(): number {
    if (this.canvasWrapper) {
      const wrapperRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      return (wrapperRect.width / 2 - this.panOffsetX) / this.zoomLevel;
    }
    return 300 + (this.canvasBlocks.length * 50);
  }

  private calculateNewBlockY(): number {
    if (this.canvasWrapper) {
      const wrapperRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      return (wrapperRect.height / 2 - this.panOffsetY) / this.zoomLevel;
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
      this.calculateConnectionPoints();
    }
  }

  editCanvasBlock(block: ChatbotBlock) {
    this.selectBlock(block);
  }

  removeCanvasBlock(blockId: string) {
    // Remove jsPlumb setup for this block
    this.removeJsPlumbForBlock(blockId);
    
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
      this.setupJsPlumbForBlock(newBlock);
      this.calculateConnectionPoints();
      this.selectBlock(newBlock);
    }, 100);
  }

  drop(event: CdkDragDrop<ChatbotBlock[]>) {
    moveItemInArray(this.allBlocks, event.previousIndex, event.currentIndex);
  }

  // Keep existing connection methods for backward compatibility
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

      const inputPointRect = inputPointElement.getBoundingClientRect();
      const canvasContentRect = this.canvasContent.nativeElement.getBoundingClientRect();

      const targetX = (inputPointRect.left + inputPointRect.width / 2 - canvasContentRect.left) / this.zoomLevel;
      const targetY = (inputPointRect.top + inputPointRect.height / 2 - canvasContentRect.top) / this.zoomLevel;

      const existingConnection = this.connections.find(conn =>
        (conn.fromBlockId === this.connectionStart!.blockId && conn.toBlockId === block.id)
      );

      if (!existingConnection) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          fromBlockId: this.connectionStart.blockId,
          toBlockId: block.id,
          fromPoint: { x: this.connectionStart.x, y: this.connectionStart.y },
          toPoint: { x: targetX, y: targetY }
        };
        this.connections.push(newConnection);
      } else {
        this.displayMessageBox('Connection already exists between these blocks.', 'warning');
      }
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
        const fromBlockElement = this.canvasContent.nativeElement.querySelector(`.canvas-block[id="${fromBlock.id}"]`);
        const toBlockElement = this.canvasContent.nativeElement.querySelector(`.canvas-block[id="${toBlock.id}"]`);

        if (fromBlockElement && toBlockElement) {
          const fromOutputPoint = fromBlockElement.querySelector('.connection-output .connection-dot') as HTMLElement;
          const toInputPoint = toBlockElement.querySelector('.connection-input .connection-dot') as HTMLElement;

          if (fromOutputPoint && toInputPoint) {
            const canvasContentRect = this.canvasContent.nativeElement.getBoundingClientRect();

            const fromRect = fromOutputPoint.getBoundingClientRect();
            const toRect = toInputPoint.getBoundingClientRect();

            conn.fromPoint = {
              x: (fromRect.left + fromRect.width / 2 - canvasContentRect.left) / this.zoomLevel,
              y: (fromRect.top + fromRect.height / 2 - canvasContentRect.top) / this.zoomLevel
            };
            conn.toPoint = {
              x: (toRect.left + toRect.width / 2 - canvasContentRect.left) / this.zoomLevel,
              y: (toRect.top + toRect.height / 2 - canvasContentRect.top) / this.zoomLevel
            };
          }
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
      this.calculateConnectionPoints();
    }
  }

  // Zoom controls
  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel + this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections();
      if (this.instance) {
        this.instance.repaintEverything();
      }
      this.calculateConnectionPoints();
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel - this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections();
      if (this.instance) {
        this.instance.repaintEverything();
      }
      this.calculateConnectionPoints();
    }
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panOffsetX = 0;
    this.panOffsetY = 0;
    this.updateCanvasTransform();
    this.updateConnections();
    if (this.instance) {
      this.instance.repaintEverything();
    }
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
    const flowData = {
      blocks: this.canvasBlocks,
      connections: this.connections,
      jsPlumbConnections: this.jsPlumbConnections.map(conn => ({
        sourceId: conn.sourceId,
        targetId: conn.targetId,
        id: conn.id
      }))
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