// src/app/chatbot-flow/chatbot-flow.component.ts
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { ChatbotBlock, Connection, AvailableMedia, AvailableStory, AvailableForm } from '../models/chatbot-block.model';
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
     QuickReplyBranchBlockComponent, // NEW
    NoQuickReplyBlockComponent,   // NEW
    IndividualQuickReplyCardComponent, // NEW
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
export class ChatbotFlowComponent implements OnInit, AfterViewInit {
  instance: any;
  @ViewChild('canvasWrapper') canvasWrapper!: ElementRef;
  @ViewChild('canvasContent') canvasContent!: ElementRef;
  @ViewChild('svgCanvas') svgCanvas!: ElementRef;

  allBlocks: ChatbotBlock[] = [
    {
      id: '1',
      name: 'User Input',
      icon: 'person',
      type: 'userInput',
      status: 'active',
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
      icon: 'person',
      type: 'userInput',
      status: 'active',
      x: 0,
      y: 0,
      subType: 'keywordGroup',
      description: 'Keyword Group',
      width: 0,
      height: 0
    },
    {
      id: '3',
      name: 'User Input',
      icon: 'person',
      type: 'userInput',
      status: 'active',
      x: 0,
      y: 0,
      subType: 'anything',
      description: 'Type Anything',
      width: 0,
      height: 0
    },
    {
      id: '4', name: 'Text Response', icon: 'chat_bubble_outline', type: 'textResponse', status: 'active', x: 0, y: 0, description: 'Respond with a text message',
      width: 0,
      height: 0,
      content: '' // Initialize content for text response
    },
    {
      id: '5', name: 'Media block', icon: 'image', type: 'mediaBlock', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0,
      description: 'Respond your users with multimedia messages such as Images, Videos etc',
      mediaId: undefined, // Will be selected from availableMedia
      mediaType: undefined,
      mediaUrl: undefined,
      mediaName: undefined
    },
    {
      id: '6', name: 'Link Story', icon: 'link', type: 'linkStory', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0,
      linkStoryId: undefined, // Will be selected from availableStories
      linkStoryName: undefined
    },
    {
      id: '7', name: 'Conversational Form', icon: 'description', type: 'conversationalForm', status: 'new', x: 0, y: 0,
      width: 0,
      height: 0,
      formId: undefined, // Will be selected from availableForms
      formName: undefined,
      webhookUrl: undefined,
      sendEmailNotification: undefined,
      notificationEmail: undefined,
      formFields: undefined,
      showAsInlineForm: undefined,
      description : "Ask one question at a time & send responses to your desired location or webservice"
    },
    {
      id: '8', name: 'Typing Delay', icon: 'hourglass_empty', type: 'typingDelay', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0,
      description: 'Add a typing delay between two blocks to mimic a real experience',
      delaySeconds: 1 // Initialize delay for typing delay
    },
    {
      id: '9', name: 'JSON API Integration', icon: 'code', type: 'jsonApi', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0,
      description : "Integrate JSON API to fetch or post data to your webservice"
    },
  ];


  canvasBlocks: ChatbotBlock[] = [];
  connections: Connection[] = [];
  filteredBlocks$: Observable<ChatbotBlock[]> | undefined;
  searchControl = new FormControl('');

  // Mock data for dropdowns (replace with actual service calls in a real app)
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

  
  

  // Connection drawing
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
      keywordGroups: [['Hello', 'Hi']], // Initial keyword group (array of arrays)
      description: 'Define keywords that trigger the conversations',
      width: 0,
      height: 0
    });
  }

  ngAfterViewInit(): void {

    // ashutosh

// Create jsPlumb instance
this.instance = jsPlumb.getInstance({
  Container: 'canvas'
});

// ✅ Define common settings before using it
const commonSettings = {
  connector: ['Flowchart'],
  endpoint: ['Dot', { radius: 5 }],
  paintStyle: { stroke: '#1e88e5', strokeWidth: 2 },
  endpointStyle: { fill: '#1e88e5' },
  hoverPaintStyle: { stroke: '#ff4081', strokeWidth: 2 }
};

// Make components draggable
this.instance.draggable('user-input-block-123');
this.instance.draggable('media-block-456');

// Add output endpoint to user-input-block
this.instance.addEndpoint('user-input-block', {
  uuid: 'userInputOutput',
  anchor: 'Right',
  isSource: true,
  maxConnections: -1,
  ...commonSettings 
});

// Add input endpoint to media-block
this.instance.addEndpoint('media-block', {
  uuid: 'mediaInput',
  anchor: 'Left',
  isTarget: true,
  maxConnections: -1,
  ...commonSettings
});

// Connect them
this.instance.connect({
  uuids: ['userInputOutput', 'mediaInput'],
  ...commonSettings
});





    this.updateCanvasTransform();
    // Set initial dimensions for the starting block (important for connection points)
    setTimeout(() => {
      this.updateBlockDimensions(this.canvasBlocks[0]);
    }, 0);
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
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.target === this.canvasWrapper.nativeElement) {
      this.isPanning = true;
      this.panStartX = event.clientX - this.panOffsetX;
      this.panStartY = event.clientY - this.panOffsetY;
      this.canvasWrapper.nativeElement.style.cursor = 'grabbing';
      // Deselect block when clicking on empty canvas area
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
    }

    if (this.isDrawingConnection && this.connectionStart) {
      const rect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      // Adjust mouse coordinates to be relative to the scaled and panned canvas content
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

  isJarvisVisible : boolean = false;

  toggleJarvis(): void {
    this.isJarvisVisible = !this.isJarvisVisible;
  }

  addBlockToCanvas(block: ChatbotBlock) {
    const newBlockId = `${block.type}-${Date.now()}`;
    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: this.calculateNewBlockX(), // Position new blocks near the center of the viewport
      y: this.calculateNewBlockY(), // Position new blocks near the center of the viewport
      // Initialize specific properties based on type/subType
      content: block.type === 'textResponse' ? '' : undefined,
      keywordGroups: block.subType === 'keywordGroup' ? [[]] : undefined, // Initialize with an empty group for new keywordGroup blocks
      phraseText: block.subType === 'phrase' ? '' : undefined,
      customMessage: block.subType === 'anything' ? '' : undefined,
      delaySeconds: block.type === 'typingDelay' ? 1 : undefined,
      mediaId: block.type === 'mediaBlock' ? undefined : undefined,
      mediaType: block.type === 'mediaBlock' ? 'text' : undefined, // Default media type for new media block
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
    // After adding, immediately update its dimensions and select it
    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.selectBlock(newBlock);
    }, 0); // Use setTimeout to ensure the block is rendered before measuring
  }

  // Helper to calculate a reasonable position for a new block
  private calculateNewBlockX(): number {
    if (this.canvasWrapper) {
      const wrapperRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      // Adjust for current pan and zoom to place it somewhat in the center of the visible area
      return (wrapperRect.width / 2 - this.panOffsetX) / this.zoomLevel;
    }
    return 300 + (this.canvasBlocks.length * 50); // Fallback
  }

  private calculateNewBlockY(): number {
    if (this.canvasWrapper) {
      const wrapperRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      return (wrapperRect.height / 2 - this.panOffsetY) / this.zoomLevel;
    }
    return 100 + (this.canvasBlocks.length * 200); // Fallback
  }

  onBlockDragEnded(event: CdkDragEnd, block: ChatbotBlock) {
    const transform = event.source.getFreeDragPosition();
    block.x = (block.x || 0) + transform.x / this.zoomLevel;
    block.y = (block.y || 0) + transform.y / this.zoomLevel;
    event.source._dragRef.reset(); // Reset the drag reference to prevent cumulative transforms
    this.updateConnections();
  }

  // Event handler for when a child block component updates its data
  onBlockUpdated(updatedBlock: ChatbotBlock) {
    const index = this.canvasBlocks.findIndex(b => b.id === updatedBlock.id);
    if (index > -1) {
      this.canvasBlocks[index] = updatedBlock;
      // If the updated block is the selected one, ensure selectedBlock reference is fresh
      if (this.selectedBlock?.id === updatedBlock.id) {
        this.selectedBlock = updatedBlock;
      }
      this.updateConnections(); // Update connections if block dimensions might have changed
    }
  }

  editCanvasBlock(block: ChatbotBlock) {
    this.selectBlock(block); // Select the block to open the sidebar for editing
  }

  removeCanvasBlock(blockId: string) {
    this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== blockId);
    this.connections = this.connections.filter(c =>
      c.fromBlockId !== blockId && c.toBlockId !== blockId
    );
    if (this.selectedBlock?.id === blockId) {
      this.selectedBlock = null;
      this.closeSidebar();
    }
    this.updateConnections(); // Update connections after removal
  }

  duplicateCanvasBlock(block: ChatbotBlock) {
    const newBlockId = `${block.type}-${Date.now()}-dup`;
    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: (block.x || 0) + 30,
      y: (block.y || 0) + 30,
      // Deep copy relevant arrays if present
      // Ensure keywordGroups are deep copied
      keywordGroups: block.keywordGroups ? block.keywordGroups.map(group => [...group]) : undefined,
      formFields: block.formFields ? block.formFields.map(field => ({ ...field })) : undefined // Deep copy form fields
    };
    this.canvasBlocks.push(newBlock);
    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.selectBlock(newBlock);
    }, 0);
  }

  // This method is used for reordering items within the `allBlocks` array (left sidebar)
  drop(event: CdkDragDrop<ChatbotBlock[]>) {
    moveItemInArray(this.allBlocks, event.previousIndex, event.currentIndex);
  }

  // Connection management
  startConnection(event: MouseEvent, block: ChatbotBlock) {
    event.stopPropagation();
    this.isDrawingConnection = true;

    // Get the element of the specific block
    const blockElement = (event.target as HTMLElement).closest('.canvas-block');
    if (!blockElement) return;

    // Find the output connection point within the block
    const outputPointElement = blockElement.querySelector('.connection-output .connection-dot') as HTMLElement;
    if (!outputPointElement) return;

    const blockRect = blockElement.getBoundingClientRect();
    const outputPointRect = outputPointElement.getBoundingClientRect();
    const canvasContentRect = this.canvasContent.nativeElement.getBoundingClientRect();

    // Calculate coordinates relative to the scaled and panned canvas content
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
      // Get the element of the specific block (the target block)
      const targetBlockElement = (event.target as HTMLElement).closest('.canvas-block');
      if (!targetBlockElement) {
        this.isDrawingConnection = false;
        this.temporaryConnection = null;
        this.connectionStart = null;
        return;
      }

      // Find the input connection point within the target block
      const inputPointElement = targetBlockElement.querySelector('.connection-input .connection-dot') as HTMLElement;
      if (!inputPointElement) {
        this.isDrawingConnection = false;
        this.temporaryConnection = null;
        this.connectionStart = null;
        return;
      }

      const inputPointRect = inputPointElement.getBoundingClientRect();
      const canvasContentRect = this.canvasContent.nativeElement.getBoundingClientRect();

      // Calculate coordinates relative to the canvasContent
      const targetX = (inputPointRect.left + inputPointRect.width / 2 - canvasContentRect.left) / this.zoomLevel;
      const targetY = (inputPointRect.top + inputPointRect.height / 2 - canvasContentRect.top) / this.zoomLevel;


      // Check if a connection already exists between these blocks
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
        // Find the actual DOM elements for the blocks
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

  // Update a block's actual width and height after it's rendered
  updateBlockDimensions(block: ChatbotBlock) {
    const blockElement = this.canvasContent.nativeElement.querySelector(`.canvas-block[id="${block.id}"]`);
    if (blockElement) {
      block.width = blockElement.offsetWidth;
      block.height = blockElement.offsetHeight;
      this.updateConnections(); // Recalculate connections if dimensions change
    }
  }


  // Zoom controls
  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel + this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections();
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel - this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections();
    }
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panOffsetX = 0;
    this.panOffsetY = 0;
    this.updateCanvasTransform();
    this.updateConnections();
  }

  updateCanvasTransform() {
    if (this.canvasContent) {
      // Apply pan and zoom to the canvas content div
      this.canvasContent.nativeElement.style.transform =
        `translate(${this.panOffsetX}px, ${this.panOffsetY}px) scale(${this.zoomLevel})`;
      this.canvasContent.nativeElement.style.transformOrigin = '0 0';
    }

    // Also update the SVG position and scale to match the canvas content
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
      connections: this.connections
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
      case 'error': return '#F44336';
      case 'new': return '#FF9800';
      case 'disabled': return '#9E9E9E';
      default: return '#4CAF50';
    }
  }

  // Get type-specific colors
  getTypeColor(type: string): string {
    switch (type) {
      case 'userInput': return '#E1F5FE'; // light blue for user input
      case 'textResponse': return '#F3E5F5'; // light purple for text response
      case 'mediaBlock': return '#E8F5E8'; // very light green
      case 'linkStory': return '#FFF3E0'; // light orange
      case 'notifyAgent': return '#FFEBEE'; // very light red
      case 'conversationalForm': return '#F1F8E9'; // light green-yellow
      case 'typingDelay': return '#ECEFF1'; // light grey
      case 'conditionalRedirect': return '#E0F2F1'; // light teal
      case 'rssFeed': return '#FCE4EC'; // light pink
      case 'jsonApi': return '#E3F2FD'; // light blue
      case 'shopify': return '#EFEBE9'; // light brown
      default: return '#F5F5F5'; // default light grey
    }
  }

  // This method is now specifically for adding a *new canvas block* of type 'Keyword Group'
  // It is called when `UserInputBlockComponent` on the canvas emits `addKeywordGroupBlock`
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