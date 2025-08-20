import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { ChatbotBlock, Connection, AvailableMedia, AvailableStory, AvailableForm } from '../models/chatbot-block.model';

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

// ✅ --- START: FINAL CORRECTED PROTOBUF IMPORTS ---
import { TextResponseBlock } from '../proto-gen/text_response_block';
import { BaseBlock } from '../proto-gen/base_block';
// ✅ --- END: FINAL CORRECTED PROTOBUF IMPORTS ---

import { UserInputBlockComponent } from './blocks/user-input-block/user-input-block.component';
import { TextResponseBlockComponent } from './blocks/text-response-block/text-response-block.component';
import { TypingDelayBlockComponent } from './blocks/typing-delay-block/typing-delay-block.component';
import { MediaBlockComponent } from './blocks/media-block/media-block.component';
import { LinkStoryBlockComponent } from './blocks/link-story-block/link-story-block.component';
import { ConversationalFormBlockComponent } from './blocks/conversational-form-block/conversational-form-block.component';
import { JsonApiIntegrationBlockComponent } from './blocks/json-api-integration-block/json-api-integration-block.component';
import { QuickReplyFlowComponent } from './blocks/quick-reply-flow/quick-reply-flow.component';
import { JarvishBlockComponent } from './blocks/jarvish-block/jarvish-block.component';
import { JsPlumbFlowService, ConnectionInfo } from './services/jsplumb-flow.service';

type NearestConnectionPoint = { blockId: string, x: number, y: number };

@Component({
  selector: 'app-chatbot-flow',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, DragDropModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatMenuModule, MatChipsModule,
    MatButtonToggleModule, MatTooltipModule, MatSelectModule, MatCheckboxModule,
    UserInputBlockComponent, TextResponseBlockComponent, TypingDelayBlockComponent,
    MediaBlockComponent, LinkStoryBlockComponent, ConversationalFormBlockComponent,
    JsonApiIntegrationBlockComponent, JarvishBlockComponent,QuickReplyFlowComponent
  ],
  templateUrl: './chatbot-flow.component.html',
  styleUrls: ['./chatbot-flow.component.scss']
})
export class ChatbotFlowComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasWrapper') canvasWrapper!: ElementRef;
  @ViewChild('canvasContent') canvasContent!: ElementRef;

  readonly MIN_VERTICAL_GAP = 80;

  allBlocks: ChatbotBlock[] = [
    { id: '1', name: 'User Input', imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/user-message.png', icon: '', type: 'userInput', status: 'normal', x: 0, y: 0, subType: 'phrase', description: 'Phrase', width: 0, height: 0 },
    { id: '2', name: 'User Input', icon: '', imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/user-message.png', type: 'userInput', status: 'normal', x: 0, y: 0, description: 'Keyword Group', subType: 'keywordGroup', width: 0, height: 0 },
    { id: '3', name: 'User Input', icon: '', imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/user-message.png', type: 'userInput', status: 'normal', x: 0, y: 0, description: 'Type Anything', subType: 'anything', width: 0, height: 0 },
    { id: '4', name: 'Text Response', icon: 'text_fields', imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/bot-message.png', type: 'textResponse', status: 'normal', x: 0, y: 0, width: 0, height: 0, content: '' },
    { id: '5', name: 'Media block', icon: 'image', type: 'mediaBlock', imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/media.png', status: 'normal', x: 0, y: 0, width: 0, height: 0 },
    { id: '6', name: 'Link Story', icon: 'insert_link', type: 'linkStory', imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/story.png', status: 'normal', x: 0, y: 0, width: 0, height: 0 },
    { id: '7', name: 'Conversational Form', imageUrl: 'http://app.botsify.com/theme/images/Story-Icons/form.png', icon: 'list_alt', type: 'conversationalForm', status: 'normal', x: 0, y: 0, width: 0, height: 0 },
    { id: '8', name: 'Typing Delay', icon: 'hourglass_empty', type: 'typingDelay', imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/typing.png', status: 'normal', x: 0, y: 0, width: 0, height: 0, delaySeconds: 1 },
    { id: '9', name: 'JSON API Integration', icon: 'code', type: 'jsonApi', imageUrl: 'https://app.botsify.com/theme/images/Story-Icons/api.png', status: 'normal', x: 0, y: 0, width: 0, height: 0 }
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
  panStartX = 0; panStartY = 0; panOffsetX = 0; panOffsetY = 0;

  selectedBlock: ChatbotBlock | null = null;
  rightSidebarOpen: boolean = false;

  isDraggingFromPalette = false;
  isOverDropZone = false;
  dropPreviewPosition: { x: number, y: number } | null = null;
  isDraggingBlock = false;
  draggedBlockId: string | null = null;
  
  isJarvisVisible: boolean = false;
  private resizeObservers: Map<string, ResizeObserver> = new Map();
  private layoutDebounceTimers: Map<string, any> = new Map();
  
  constructor(
    private jsPlumbFlowService: JsPlumbFlowService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.filteredBlocks$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._filter(value || ''))
    );

    this.canvasBlocks.push({
      id: 'flow-start', name: 'User Input', icon: 'person', type: 'userInput', status: 'active',
      x: 600, y: 100, subType: 'keywordGroup', content: 'Hello 👋',
      keywordGroups: [['Hello', 'Hi']], description: 'Define keywords that trigger the conversations',
      width: 0, height: 0,
      connections: {input:[], output:[]}
    });
    
    // --- CALL THE UPDATED TEST FUNCTION ---
    this.testProtobufLoopback();
  }


  testProtobufLoopback() {
    console.log("--- Starting NEW Protobuf Local Test (using protobuf-ts) ---");

    // A. CREATE THE ORIGINAL MESSAGE with dummy data
    const originalMessage = TextResponseBlock.create({
      base: BaseBlock.create({
        id: 'test-id-001',
        name: 'Dummy Text Block'
      }),
      content: 'Hello Protobuf!'
    });
    
    console.log("1. Original Object:", originalMessage);

    // B. SERIALIZE the message into a binary format
    const binaryData = TextResponseBlock.toBinary(originalMessage);
    console.log("2. Serialized Binary Data:", binaryData);

    // C. DESERIALIZE the binary data back into an object
    const deserializedMessage = TextResponseBlock.fromBinary(binaryData);
    console.log("3. Deserialized Object:", deserializedMessage);

    // D. VERIFY the data is the same
    const testPassed = originalMessage.content === deserializedMessage.content;
    console.log(`4. Verification -> Test Passed: ${testPassed}`);
    
    console.log("--- Test Complete ---");
  }

  ngAfterViewInit(): void {
    this.jsPlumbFlowService.initialize(this.canvasContent.nativeElement);

    this.jsPlumbFlowService.connectionCreated.subscribe((info: ConnectionInfo) => {
      this.handleConnectionCreated(info);
    });

    this.jsPlumbFlowService.connectionDeleted.subscribe((info: ConnectionInfo) => {
      this.handleConnectionDeleted(info);
    });

    this.jsPlumbFlowService.blockDragStarted.subscribe(dragInfo => {
      const block = this.canvasBlocks.find(b => b.id === dragInfo.blockId);
      if (block) this.onJsPlumbDragStarted();
    });

    this.jsPlumbFlowService.blockMoved.subscribe(moveInfo => {
      const block = this.canvasBlocks.find(b => b.id === moveInfo.blockId);
      if (block) {
        block.x = moveInfo.x;
        block.y = moveInfo.y;
      }
    });

    this.jsPlumbFlowService.blockDragEnded.subscribe(() => {
        this.onJsPlumbDragEnded();
    });

    this.updateCanvasTransform();
    setTimeout(() => {
      this.canvasBlocks.forEach(block => {
        this.updateBlockDimensions(block);
        this.jsPlumbFlowService.setupBlock(`block-${block.id}`);
        this.attachResizeObserver(block);
      });
    }, 80);
  }

  ngOnDestroy(): void {
    this.jsPlumbFlowService.reset();
    this.detachAllResizeObservers();
  }

  onJsPlumbDragStarted(): void {
    this.isDraggingBlock = true;
  }

  onJsPlumbDragEnded(): void {
    this.isDraggingBlock = false;
    this.jsPlumbFlowService.repaintAllConnections();
  }

  private _filter(value: string): ChatbotBlock[] {
    const filterValue = value.toLowerCase();
    return this.allBlocks.filter(block =>
      block.name.toLowerCase().includes(filterValue) ||
      (block.description && block.description.toLowerCase().includes(filterValue))
    );
  }

  onPaletteDragStarted(event: CdkDragStart): void {
    this.isDraggingFromPalette = true;
  }

  async onPaletteDragEnded(event: CdkDragEnd, block: ChatbotBlock): Promise<void> {
    if (this.isOverDropZone && this.dropPreviewPosition) {
      await this.addBlockToCanvasAtPosition(block, this.dropPreviewPosition.x, this.dropPreviewPosition.y);
    }
    this.isDraggingFromPalette = false;
    this.dropPreviewPosition = null;
  }
  
  async addBlockToCanvasAtPosition(block: ChatbotBlock, screenX: number, screenY: number): Promise<void> {
    const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
    const newBlockId = `${block.type}-${Date.now()}`;
    const dropX = (screenX - canvasRect.left) / this.zoomLevel;
    const dropY = (screenY - canvasRect.top) / this.zoomLevel;

    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: dropX,
      y: dropY,
      width: 0, height: 0,
      content: block.type === 'textResponse' ? '' : undefined,
      keywordGroups: block.subType === 'keywordGroup' ? [[]] : undefined,
      isInitializing: true,
      connections: {input:[], output:[]}
    };

    this.canvasBlocks.push(newBlock);
    await this.nextFrame();
    this.updateBlockDimensions(newBlock);

    let finalX = newBlock.x;
    let finalY = newBlock.y;
    let connectionToBreak = this.getConnectionByCircularHotspot(dropX, dropY, 0.18, 28, 180) ?? this.getClosestConnectionToPoint(dropX, dropY, 64);
    let parentBlockForConnection: ChatbotBlock | undefined | null = null;
    let childIdForConnection: string | undefined = undefined;
    let connectOnDrop = false;

    if (connectionToBreak) {
      const parentId = connectionToBreak.sourceId.replace('block-', '');
      parentBlockForConnection = this.canvasBlocks.find(b => b.id === parentId);
      childIdForConnection = connectionToBreak.targetId.replace('block-', '');

      if (parentBlockForConnection) {
        this.updateBlockDimensions(parentBlockForConnection);
        finalX = (parentBlockForConnection.x + parentBlockForConnection.width / 2) - (newBlock.width / 2);
        finalY = parentBlockForConnection.y + parentBlockForConnection.height + this.MIN_VERTICAL_GAP;
        connectOnDrop = true;
      }
    } else {
      const existingBlocks = this.canvasBlocks.filter(b => b.id !== newBlock.id);
      if (existingBlocks.length === 0) {
        connectOnDrop = true;
      } else {
        const hasNoConnections = this.jsPlumbFlowService.getConnections().length === 0;

        if (existingBlocks.length === 1 && hasNoConnections) {
          parentBlockForConnection = existingBlocks[0];
          this.updateBlockDimensions(parentBlockForConnection);
          finalX = (parentBlockForConnection.x + parentBlockForConnection.width / 2) - (newBlock.width / 2);
          finalY = parentBlockForConnection.y + parentBlockForConnection.height + this.MIN_VERTICAL_GAP;
          connectOnDrop = true;
        } else {
          const blocksExcludingNew = this.canvasBlocks.filter(b => b.id !== newBlock.id);
          if (blocksExcludingNew.length > 0) {
            const tails = blocksExcludingNew.filter(b => this.jsPlumbFlowService.getConnections({ source: `block-${b.id}` }).length === 0);
            const bottomMostTail = tails.reduce<ChatbotBlock | null>((acc, curr) => {
              if (!acc) return curr;
              const accBottom = acc.y + acc.height;
              const currBottom = curr.y + curr.height;
              return currBottom > accBottom ? curr : acc;
            }, null);

            if (bottomMostTail) {
              this.updateBlockDimensions(bottomMostTail);
              const bottomY = bottomMostTail.y + bottomMostTail.height;
              if (dropY > bottomY + 10) {
                parentBlockForConnection = bottomMostTail;
                finalX = (bottomMostTail.x + bottomMostTail.width / 2) - (newBlock.width / 2);
                finalY = bottomMostTail.y + bottomMostTail.height + this.MIN_VERTICAL_GAP;
                connectOnDrop = true;
              }
            }
          }
        }
      }
    }

    newBlock.x = finalX;
    newBlock.y = finalY;
    this.cdr.detectChanges();
    await this.nextFrame();

    this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`);
    this.selectBlock(newBlock);
    this.attachResizeObserver(newBlock);

    if (connectOnDrop && parentBlockForConnection) {
        if (connectionToBreak && childIdForConnection) {
            this.jsPlumbFlowService.batch(() => {
                this.jsPlumbFlowService.deleteJsPlumbConnection(connectionToBreak);
                this.jsPlumbFlowService.connectBlocks(`block-${parentBlockForConnection!.id}`, `block-${newBlock.id}`);
                this.jsPlumbFlowService.connectBlocks(`block-${newBlock.id}`, `block-${childIdForConnection}`);
            });
            this.jsPlumbFlowService.revalidate(`block-${parentBlockForConnection!.id}`);
            this.jsPlumbFlowService.revalidate(`block-${newBlock.id}`);
            this.jsPlumbFlowService.revalidate(`block-${childIdForConnection}`);
            this.jsPlumbFlowService.repaintAllConnections();
            await this.nextFrame();
            await this.enforceVerticalLayout(newBlock.id);
        } else {
            this.jsPlumbFlowService.connectBlocks(`block-${parentBlockForConnection.id}`, `block-${newBlock.id}`);
            this.jsPlumbFlowService.revalidate(`block-${parentBlockForConnection.id}`);
            this.jsPlumbFlowService.revalidate(`block-${newBlock.id}`);
            this.jsPlumbFlowService.repaintAllConnections();
            await this.nextFrame();
            await this.enforceVerticalLayout(parentBlockForConnection.id);
        }
    } else if (!connectOnDrop) {
        this.jsPlumbFlowService.removeBlock(`block-${newBlock.id}`);
        this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== newBlock.id);
        this.closeSidebar();
        this.cdr.detectChanges();
        return;
    }

    await this.nextFrame();
    this.jsPlumbFlowService.batch(() => {
      this.jsPlumbFlowService.revalidate(`block-${newBlock.id}`);
      this.jsPlumbFlowService.repaintAllConnections();
    });
    newBlock.isInitializing = false;
    this.cdr.detectChanges();
  }


  private nextFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  async createConnection(fromBlockId: string, toBlockId: string): Promise<void> {
    this.jsPlumbFlowService.connectBlocks(`block-${fromBlockId}`, `block-${toBlockId}`);
    return Promise.resolve();
  }

  async removeCanvasBlock(blockId: string): Promise<void> {
    if (this.selectedBlock?.id === blockId) {
      this.closeSidebar();
    }

    const parentConnections = this.jsPlumbFlowService.getConnections({ target: `block-${blockId}` });
    const childConnections = this.jsPlumbFlowService.getConnections({ source: `block-${blockId}` });

    this.jsPlumbFlowService.removeBlock(`block-${blockId}`);
    this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== blockId);
    this.detachResizeObserver(blockId);

    if (parentConnections.length === 1 && childConnections.length === 1) {
      const parentId = parentConnections[0].sourceId.replace('block-', '');
      const childId = childConnections[0].targetId.replace('block-', '');
      await this.createConnection(parentId, childId);
      await this.enforceVerticalLayout(parentId);
    } else if (parentConnections.length > 0) {
      const parentId = parentConnections[0].sourceId.replace('block-', '');
      await this.enforceVerticalLayout(parentId);
    } else {
      this.jsPlumbFlowService.repaintAllConnections();
    }
  }
  
  private distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const closestX = x1 + t * (x2 - x1);
    const closestY = y1 + t * (y2 - y1);
    return Math.hypot(px - closestX, py - closestY);
  }

  private getClosestConnectionToPoint(x: number, y: number, leeway: number = 0): any | null {
    const allConnections = this.jsPlumbFlowService.getConnections();
    let minDistance = Infinity;
    let closestConnection = null;

    for (const conn of allConnections) {
      const sourceBlock = this.canvasBlocks.find(b => b.id === conn.sourceId.replace('block-', ''));
      const targetBlock = this.canvasBlocks.find(b => b.id === conn.targetId.replace('block-', ''));
      if (!sourceBlock || !targetBlock) continue;
      
      this.updateBlockDimensions(sourceBlock);
      this.updateBlockDimensions(targetBlock);

      const x1 = sourceBlock.x + (sourceBlock.width / 2);
      const y1 = sourceBlock.y + sourceBlock.height;
      const x2 = targetBlock.x + (targetBlock.width / 2);
      const y2 = targetBlock.y;

      const distance = this.distanceToLineSegment(x, y, x1, y1, x2, y2);
      if (distance < minDistance) {
        minDistance = distance;
        closestConnection = conn;
      }
    }
    const threshold = 50 / this.zoomLevel + leeway;
    return minDistance < threshold ? closestConnection : null;
  }

  private getConnectionByCircularHotspot(x: number, y: number, radiusFactor: number = 0.15, minRadiusPx: number = 24, maxRadiusPx: number = 160): any | null {
    const allConnections = this.jsPlumbFlowService.getConnections();
    let best: any = null;
    let bestDist = Infinity;

    for (const conn of allConnections) {
        const sourceBlock = this.canvasBlocks.find(b => b.id === conn.sourceId.replace('block-', ''));
        const targetBlock = this.canvasBlocks.find(b => b.id === conn.targetId.replace('block-', ''));
        if (!sourceBlock || !targetBlock) continue;

        this.updateBlockDimensions(sourceBlock);
        this.updateBlockDimensions(targetBlock);

        const x1 = sourceBlock.x + (sourceBlock.width / 2);
        const y1 = sourceBlock.y + sourceBlock.height;
        const x2 = targetBlock.x + (targetBlock.width / 2);
        const y2 = targetBlock.y;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const length = Math.hypot(x2 - x1, y2 - y1);

        const radius = Math.max(minRadiusPx / this.zoomLevel, Math.min(maxRadiusPx / this.zoomLevel, length * radiusFactor));

        const dist = Math.hypot(x - midX, y - midY);
        if (dist <= radius && dist < bestDist) {
            bestDist = dist;
            best = conn;
        }
    }
    return best;
  }

  private async enforceVerticalLayout(startBlockId: string): Promise<void> {
    const processQueue: string[] = [startBlockId];
    const visited = new Set<string>();
    const affectedIds = new Set<string>();

    while (processQueue.length > 0) {
      const currentBlockId = processQueue.shift()!;
      if (visited.has(currentBlockId)) continue;
      visited.add(currentBlockId);

      const parentBlock = this.canvasBlocks.find(b => b.id === currentBlockId);
      if (!parentBlock) continue;

      this.updateBlockDimensions(parentBlock);
      affectedIds.add(parentBlock.id);

      const directConnections = this.jsPlumbFlowService.getConnections({ source: `block-${currentBlockId}` });

      for (const conn of directConnections) {
        const childId = conn.targetId.replace('block-', '');
        const childBlock = this.canvasBlocks.find(b => b.id === childId);
        if (childBlock) {
          this.updateBlockDimensions(childBlock);
          const fixedGap = this.MIN_VERTICAL_GAP;
          childBlock.x = (parentBlock.x + (parentBlock.width / 2)) - (childBlock.width / 2);
          childBlock.y = parentBlock.y + parentBlock.height + fixedGap;
          affectedIds.add(childBlock.id);
          processQueue.push(childId);
        }
      }
    }

    this.cdr.detectChanges();
    await this.nextFrame();

    this.jsPlumbFlowService.batch(() => {
      for (const id of affectedIds) {
        this.jsPlumbFlowService.revalidate(`block-${id}`);
      }
      this.jsPlumbFlowService.repaintAllConnections();
    });
  }

  onWheel(event: WheelEvent) {
    event.preventDefault(); 
    if (event.ctrlKey) {
      const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      this.zoomLevel = parseFloat(Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta)).toFixed(2));
    } else {
      this.panOffsetY -= event.deltaY;
    }
    this.updateCanvasTransform();
    this.jsPlumbFlowService.repaintAllConnections();
  }

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    if (event.target === this.canvasWrapper.nativeElement || event.target === this.canvasContent.nativeElement) {
      this.isPanning = true;
      this.panStartX = event.clientX - this.panOffsetX;
      this.panStartY = event.clientY - this.panOffsetY;
      this.canvasWrapper.nativeElement.style.cursor = 'grabbing';
      if (this.selectedBlock) this.closeSidebar();
    }
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      this.panOffsetX = event.clientX - this.panStartX;
      this.panOffsetY = event.clientY - this.panStartY;
      this.updateCanvasTransform();
    }
    if (this.isDraggingFromPalette) {
      this.isOverDropZone = true;
      this.dropPreviewPosition = { x: event.clientX, y: event.clientY };
    }
  }

  @HostListener('mouseup') onMouseUp() {
    this.isPanning = false;
    this.canvasWrapper.nativeElement.style.cursor = 'default';
  }

  duplicateCanvasBlock(block: ChatbotBlock) {
    const newBlockId = `${block.type}-${Date.now()}-dup`;
    
    const newBlock: ChatbotBlock = { 
      ...block, 
      id: newBlockId, 
      x: (block.x || 0) + 40, 
      y: (block.y || 0) + 40,
      connections: { input: [], output: [] }
    };

    this.canvasBlocks.push(newBlock);
    
    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`);
      this.selectBlock(newBlock);
      this.attachResizeObserver(newBlock);
    }, 80);
  }

  onBlockUpdated(updatedBlock: ChatbotBlock) {
    const index = this.canvasBlocks.findIndex(b => b.id === updatedBlock.id);
    if (index > -1) {
      this.canvasBlocks[index] = updatedBlock;
      if (this.selectedBlock?.id === updatedBlock.id) this.selectedBlock = updatedBlock;
      setTimeout(() => {
        this.updateBlockDimensions(updatedBlock);
        this.jsPlumbFlowService.repaintAllConnections();
        if (updatedBlock.type === 'textResponse' && updatedBlock.quickReplies && updatedBlock.quickReplies.length > 0) {
          this.initializeQuickReplyConnections(updatedBlock);
        }
      }, 80);
    }
  }

  updateBlockDimensions(block: ChatbotBlock) {
    const blockElement = document.getElementById(`block-${block.id}`);
    if (blockElement) { 
      block.width = blockElement.offsetWidth; 
      block.height = blockElement.offsetHeight; 
    }
  }

  private attachResizeObserver(block: ChatbotBlock): void {
    const elementId = `block-${block.id}`;
    if (this.resizeObservers.has(block.id)) return;
    const el = document.getElementById(elementId);
    if (!el || (typeof (window as any).ResizeObserver === 'undefined')) return;
    const observer = new ResizeObserver(() => {
      const existingTimer = this.layoutDebounceTimers.get(block.id);
      if (existingTimer) clearTimeout(existingTimer);
      const timer = setTimeout(async () => {
        this.updateBlockDimensions(block);
        await this.enforceVerticalLayout(block.id);
        this.jsPlumbFlowService.batch(() => {
          this.jsPlumbFlowService.revalidate(elementId);
          this.jsPlumbFlowService.repaintAllConnections();
        });
      }, 40);
      this.layoutDebounceTimers.set(block.id, timer);
    });
    observer.observe(el);
    this.resizeObservers.set(block.id, observer);
  }

  private detachResizeObserver(blockId: string): void {
    const obs = this.resizeObservers.get(blockId);
    const el = document.getElementById(`block-${blockId}`);
    if (obs && el) {
      try { obs.unobserve(el); } catch {}
    }
    if (obs) {
      try { obs.disconnect(); } catch {}
    }
    this.resizeObservers.delete(blockId);
  }

  private detachAllResizeObservers(): void {
    this.resizeObservers.forEach((obs, id) => {
      const el = document.getElementById(`block-${id}`);
      if (el) {
        try { obs.unobserve(el); } catch {}
      }
      try { obs.disconnect(); } catch {}
    });
    this.resizeObservers.clear();
  }

  updateCanvasTransform() {
    if (this.canvasContent) {
      const el = this.canvasContent.nativeElement as HTMLElement;
      el.style.position = 'absolute';
      el.style.left = `${this.panOffsetX}px`;
      el.style.top = `${this.panOffsetY}px`;
      el.style.transform = `scale(${this.zoomLevel})`;
      this.jsPlumbFlowService.setZoom(this.zoomLevel);
    }
  }

  editCanvasBlock(block: ChatbotBlock) { this.selectBlock(block); }

  onAddKeywordGroupBlockToCanvas(): void {
    const blueprint = this.allBlocks.find(b => b.type === 'userInput' && b.subType === 'keywordGroup');
    if (blueprint) {
      const canvasRect = this.canvasWrapper.nativeElement.getBoundingClientRect();
      this.addBlockToCanvasAtPosition(blueprint, canvasRect.left + canvasRect.width / 2, canvasRect.top + canvasRect.height / 2);
    }
  }
  
  saveFlow() {
    const flowData = {
      blocks: this.canvasBlocks,
    };
    console.log('Chatbot flow saved!', flowData);
  }

  zoomIn() { this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep); this.updateCanvasTransform(); this.jsPlumbFlowService.repaintAllConnections(); }
  zoomOut() { this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep); this.updateCanvasTransform(); this.jsPlumbFlowService.repaintAllConnections(); }
  resetZoom() { this.zoomLevel = 1.0; this.panOffsetX = 0; this.panOffsetY = 0; this.updateCanvasTransform(); this.jsPlumbFlowService.repaintAllConnections(); }
  
  scrollCanvas(direction: 'up' | 'down'): void {
    const scrollAmount = 150; 
    this.panOffsetY += (direction === 'down' ? -scrollAmount : scrollAmount);
    this.updateCanvasTransform();
    this.jsPlumbFlowService.repaintAllConnections();
  }

  selectBlock(block: ChatbotBlock) {
    this.selectedBlock = block;
    this.rightSidebarOpen = true;
    requestAnimationFrame(() => this.jsPlumbFlowService.repaintAllConnections());
    setTimeout(() => this.jsPlumbFlowService.repaintAllConnections(), 320);
    if (block.type === 'textResponse' && block.quickReplies && block.quickReplies.length > 0) {
      setTimeout(() => this.initializeQuickReplyConnections(block), 50);
    }
  }
  
  closeSidebar() { 
    this.rightSidebarOpen = false; 
    this.selectedBlock = null; 
    requestAnimationFrame(() => this.jsPlumbFlowService.repaintAllConnections());
    setTimeout(() => this.jsPlumbFlowService.repaintAllConnections(), 320);
  }

  toggleJarvis(): void {
    this.isJarvisVisible = !this.isJarvisVisible;
  }

  getStatusColor(status: string): string { return '#4CAF50'; }
  getTypeColor(type: string): string { return '#F5F5F5'; }

  private initializeQuickReplyConnections(parent: ChatbotBlock): void {
    const parentId = `block-${parent.id}`;
    const noQrId = `block-${parent.id}-noqr`;
    const qrId = `block-${parent.id}-qr`;

    const ensureEl = (id: string) => !!document.getElementById(id);
    if (!ensureEl(noQrId) || !ensureEl(qrId)) { return; }

    this.jsPlumbFlowService.setupBlock(noQrId);
    this.jsPlumbFlowService.setupBlock(qrId);
    
    this.jsPlumbFlowService.connectBlocks(parentId, noQrId);
    this.jsPlumbFlowService.connectBlocks(parentId, qrId);

    const replies = parent.quickReplies || [];
    replies.forEach((_: any, idx: any) => {
      const replyId = `block-${parent.id}-qr-${idx}`;
      if (ensureEl(replyId)) {
        this.jsPlumbFlowService.setupBlock(replyId);
        this.jsPlumbFlowService.connectBlocks(qrId, replyId);
      }
    });
    
    this.jsPlumbFlowService.repaintAllConnections();
    
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }
  
  onQuickReplyConnection(sourceBlockId: string, targetBlockId: string): void {
    console.log(`Quick reply connection: ${sourceBlockId} -> ${targetBlockId}`);
  }
  
  onQuickReplyStartConnection(connectionInfo: {event: MouseEvent, type: string}): void {
    const { event, type } = connectionInfo;
    const parentBlockId = event.target ? (event.target as HTMLElement).closest('.quick-reply-cards-wrapper')?.getAttribute('data-parent-id') : null;
    
    if (parentBlockId) {
      console.log(`Starting connection from quick reply endpoint: ${type} of parent ${parentBlockId}`);
    }
  }
  
  private handleConnectionCreated(info: ConnectionInfo): void {
    const sourceId = info.sourceId.replace('block-', '');
    const targetId = info.targetId.replace('block-', '');

    const sourceBlock = this.canvasBlocks.find(b => b.id === sourceId);
    const targetBlock = this.canvasBlocks.find(b => b.id === targetId);
    
    if (sourceBlock && targetBlock) {
      if (!sourceBlock.connections) sourceBlock.connections = { input: [], output: [] };
      if (!targetBlock.connections) targetBlock.connections = { input: [], output: [] };

      if (!sourceBlock.connections.output!.includes(targetId)) {
        sourceBlock.connections.output!.push(targetId);
      }

      if (!targetBlock.connections.input!.includes(sourceId)) {
        targetBlock.connections.input!.push(sourceId);
      }

      console.log(`Connection created: ${sourceId} -> ${targetId}`);
      this.cdr.detectChanges();
    }
  }

  private handleConnectionDeleted(info: ConnectionInfo): void {
    const sourceId = info.sourceId.replace('block-', '');
    const targetId = info.targetId.replace('block-', '');
    
    const sourceBlock = this.canvasBlocks.find(b => b.id === sourceId);
    const targetBlock = this.canvasBlocks.find(b => b.id === targetId);
    
    if (sourceBlock && sourceBlock.connections && sourceBlock.connections.output) {
      sourceBlock.connections.output = sourceBlock.connections.output.filter((id: string) => id !== targetId);
    }
    
    if (targetBlock && targetBlock.connections && targetBlock.connections.input) {
      targetBlock.connections.input = targetBlock.connections.input.filter((id: string) => id !== sourceId);
    }
    
    console.log(`Connection deleted: ${sourceId} -> ${targetId}`);
    this.cdr.detectChanges();
  }
}