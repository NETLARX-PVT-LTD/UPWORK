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

import { UserInputBlockComponent } from './blocks/user-input-block/user-input-block.component';
import { TextResponseBlockComponent } from './blocks/text-response-block/text-response-block.component';
import { TypingDelayBlockComponent } from './blocks/typing-delay-block/typing-delay-block.component';
import { MediaBlockComponent } from './blocks/media-block/media-block.component';
import { LinkStoryBlockComponent } from './blocks/link-story-block/link-story-block.component';
import { ConversationalFormBlockComponent } from './blocks/conversational-form-block/conversational-form-block.component';
import { JsonApiIntegrationBlockComponent } from './blocks/json-api-integration-block/json-api-integration-block.component';
import { JarvishBlockComponent } from './blocks/jarvish-block/jarvish-block.component';
import { JsPlumbFlowService } from './services/jsplumb-flow.service';

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
    JsonApiIntegrationBlockComponent, JarvishBlockComponent
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
      width: 0, height: 0
    });
  }

  ngAfterViewInit(): void {
    this.jsPlumbFlowService.initialize(this.canvasContent.nativeElement);

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
      });
    }, 80);
  }

  ngOnDestroy(): void {
    this.jsPlumbFlowService.reset();
  }

  onJsPlumbDragStarted(): void {
    this.isDraggingBlock = true;
  }

  onJsPlumbDragEnded(): void {
    this.isDraggingBlock = false;
    // After a block is dragged manually, repaint connections
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

  // =================================================================
  // ==               START: FULLY REVISED LOGIC                    ==
  // =================================================================

  /**
   * [NEW HELPER METHOD] Finds the best block to drop onto.
   */
  private findBlockAtPosition(x: number, y: number, excludeId: string): ChatbotBlock | null {
    // Allow a small tolerance so dropping slightly above/below still selects the block
    const tolerance = 24 / this.zoomLevel;
    let bestMatch: ChatbotBlock | null = null;
    let bestDistance = Infinity;

    for (const block of this.canvasBlocks) {
      if (block.id === excludeId) continue;
      this.updateBlockDimensions(block);
      const withinX = x >= (block.x - tolerance) && x <= (block.x + block.width + tolerance);
      const withinY = y >= (block.y - tolerance) && y <= (block.y + block.height + tolerance);
      if (withinX && withinY) {
        const centerX = block.x + block.width / 2;
        const centerY = block.y + block.height / 2;
        const dist = Math.hypot(x - centerX, y - centerY);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestMatch = block;
        }
      }
    }
    return bestMatch;
  }

  /**
   * Handles adding a block, inserting it into the flow, and updating the layout smoothly.
   */
  async addBlockToCanvasAtPosition(block: ChatbotBlock, screenX: number, screenY: number): Promise<void> {
    const newBlockId = `${block.type}-${Date.now()}`;
    const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
    // IMPORTANT: canvasContent is already transformed via CSS translate/scale.
    // To map screen -> content coordinates, do NOT subtract pan offsets again.
    const canvasX = (screenX - canvasRect.left) / this.zoomLevel;
    const canvasY = (screenY - canvasRect.top) / this.zoomLevel;

    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: canvasX,
      y: canvasY,
      width: 0,
      height: 0,
      content: block.type === 'textResponse' ? '' : undefined,
      keywordGroups: block.subType === 'keywordGroup' ? [[]] : undefined,
    };

    // Add block and allow DOM to render for correct measurements
    this.canvasBlocks.push(newBlock);
    await this.nextFrame();
    this.updateBlockDimensions(newBlock);
    this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`);
    this.jsPlumbFlowService.revalidate(`block-${newBlock.id}`);
    this.selectBlock(newBlock);

    // Only insert when dropped on a connection line (no auto-connect when dropped on blocks)
    let parentBlock: ChatbotBlock | null = null;
    let childrenToReconnectIds: string[] = [];

    // Prefer circular hotspot around the connection's midpoint for precise targeting
    let connectionToBreak = this.getConnectionByCircularHotspot(canvasX, canvasY, 0.18, 28, 180);
    // Fallbacks: smaller radius and finally line distance with leeway
    if (!connectionToBreak) connectionToBreak = this.getConnectionByCircularHotspot(canvasX, canvasY, 0.12, 24, 160);
    if (!connectionToBreak) connectionToBreak = this.getClosestConnectionToPoint(canvasX, canvasY, 64);
    if (connectionToBreak) {
      const parentId = connectionToBreak.sourceId.replace('block-', '');
      const childId = connectionToBreak.targetId.replace('block-', '');
      parentBlock = this.canvasBlocks.find(b => b.id === parentId) ?? null;

      // Position new block slightly closer to the child to avoid overlapping the parent
      if (parentBlock) {
        const childBlock = this.canvasBlocks.find(b => b.id === childId) ?? null;
        if (childBlock) {
          this.updateBlockDimensions(parentBlock);
          this.updateBlockDimensions(childBlock);
          const x1 = parentBlock.x + parentBlock.width / 2;
          const y1 = parentBlock.y + parentBlock.height;
          const x2 = childBlock.x + childBlock.width / 2;
          const y2 = childBlock.y;
          const bias = 0.6; // bias toward child to reduce parent overlap
          newBlock.x = (x1 * (1 - bias) + x2 * bias) - newBlock.width / 2;
          newBlock.y = (y1 * (1 - bias) + y2 * bias) - newBlock.height / 2;
        }
      }

      childrenToReconnectIds.push(childId);
      // Batch jsPlumb updates to avoid intermediate angled states
      this.jsPlumbFlowService.batch(() => {
        this.jsPlumbFlowService.deleteJsPlumbConnection(connectionToBreak);
      });
    }

    if (parentBlock) {
      // Reconnect: parent -> newBlock -> previous children
      // Batch connect + layout to prevent transient angled lines
      this.jsPlumbFlowService.batch(() => {
        this.jsPlumbFlowService.connectBlocks(`block-${parentBlock!.id}`, `block-${newBlock.id}`);
        for (const childId of childrenToReconnectIds) {
          this.jsPlumbFlowService.connectBlocks(`block-${newBlock.id}`, `block-${childId}`);
        }
      });
      await this.enforceVerticalLayout(parentBlock.id);
      this.jsPlumbFlowService.repaintAllConnections();
    } else {
      // Special-case: if there is only a single existing block in the canvas and no connections yet,
      // automatically connect that block to the newly dropped block.
      const existingBlocks = this.canvasBlocks.filter(b => b.id !== newBlock.id);
      const hasNoConnections = this.jsPlumbFlowService.getConnections().length === 0;
      if (existingBlocks.length === 1 && hasNoConnections) {
        const root = existingBlocks[0];
        this.updateBlockDimensions(root);
        newBlock.x = (root.x + root.width / 2) - (newBlock.width / 2);
        newBlock.y = root.y + root.height + this.MIN_VERTICAL_GAP;
        this.jsPlumbFlowService.batch(() => {
          this.jsPlumbFlowService.connectBlocks(`block-${root.id}`, `block-${newBlock.id}`);
        });
        await this.enforceVerticalLayout(root.id);
        this.jsPlumbFlowService.repaintAllConnections();
      } else {
        // Not on a connection and not the first-connect case: cancel insert
        this.jsPlumbFlowService.removeBlock(`block-${newBlock.id}`);
        this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== newBlock.id);
        this.rightSidebarOpen = false;
        if (this.selectedBlock?.id === newBlock.id) this.selectedBlock = null;
        this.jsPlumbFlowService.repaintAllConnections();
        return;
      }
    }
  }

  private nextFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  /**
   * [REVISED] This method ONLY creates a connection and does nothing else.
   */
  async createConnection(fromBlockId: string, toBlockId: string): Promise<void> {
    this.jsPlumbFlowService.connectBlocks(`block-${fromBlockId}`, `block-${toBlockId}`);
    return Promise.resolve();
  }

  /**
   * [REVISED] This method now needs to be called explicitly after block deletion.
   */
  async removeCanvasBlock(blockId: string): Promise<void> {
    if (this.selectedBlock?.id === blockId) {
      this.closeSidebar();
    }

    const parentConnections = this.jsPlumbFlowService.getConnections({ target: `block-${blockId}` });
    const childConnections = this.jsPlumbFlowService.getConnections({ source: `block-${blockId}` });

    this.jsPlumbFlowService.removeBlock(`block-${blockId}`);
    this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== blockId);

    // If the deleted block was in the middle of a flow, reconnect the parent to the child
    if (parentConnections.length === 1 && childConnections.length === 1) {
      const parentId = parentConnections[0].sourceId.replace('block-', '');
      const childId = childConnections[0].targetId.replace('block-', '');
      await this.createConnection(parentId, childId);
      // **IMPORTANT**: After creating the connection, we must now manually trigger the layout update.
      await this.enforceVerticalLayout(parentId);
    }
    // If the deleted block was at the end of a branch, just repaint.
    else if (parentConnections.length > 0) {
      const parentId = parentConnections[0].sourceId.replace('block-', '');
      await this.enforceVerticalLayout(parentId);
    } else {
      this.jsPlumbFlowService.repaintAllConnections();
    }
  }

  // =================================================================
  // ==                END: FULLY REVISED LOGIC                     ==
  // =================================================================


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
    let minDistanceInBbox = Infinity;
    let closestInBbox: any = null;

    for (const conn of allConnections) {
      const sourceBlockId = conn.sourceId.replace('block-', '');
      const targetBlockId = conn.targetId.replace('block-', '');
      const sourceBlock = this.canvasBlocks.find(b => b.id === sourceBlockId);
      const targetBlock = this.canvasBlocks.find(b => b.id === targetBlockId);
      if (!sourceBlock || !targetBlock) continue;
      
      this.updateBlockDimensions(sourceBlock);
      this.updateBlockDimensions(targetBlock);

      const x1 = sourceBlock.x + (sourceBlock.width / 2);
      const y1 = sourceBlock.y + sourceBlock.height;
      const x2 = targetBlock.x + (targetBlock.width / 2);
      const y2 = targetBlock.y;

      const distance = this.distanceToLineSegment(x, y, x1, y1, x2, y2);

      // Expanded bounding box filter to prefer the visually intended connection
      const margin = 12 / this.zoomLevel + leeway;
      const minX = Math.min(x1, x2) - margin;
      const maxX = Math.max(x1, x2) + margin;
      const minY = Math.min(y1, y2) - margin;
      const maxY = Math.max(y1, y2) + margin;
      const inBbox = x >= minX && x <= maxX && y >= minY && y <= maxY;

      if (inBbox && distance < minDistanceInBbox) {
        minDistanceInBbox = distance;
        closestInBbox = conn;
      }
      if (distance < minDistance) {
        minDistance = distance;
        closestConnection = conn;
      }
    }

    // Prefer the best connection whose bounding box contains the point
    const threshold = 50 / this.zoomLevel + leeway;
    if (closestInBbox && minDistanceInBbox < threshold) {
      return closestInBbox;
    }
    return minDistance < threshold ? closestConnection : null;
  }

  /**
   * Circular hotspot detection: considers a circle centered at each connection's midpoint.
   * The circle radius scales with the connection length (zoom-aware) and is clamped by min/max.
   * Returns the closest connection whose midpoint circle contains the (x,y) point.
   */
  private getConnectionByCircularHotspot(
    x: number,
    y: number,
    radiusFactor: number = 0.15,
    minRadiusPx: number = 24,
    maxRadiusPx: number = 160
  ): any | null {
    const allConnections = this.jsPlumbFlowService.getConnections();
    let best: any = null;
    let bestDist = Infinity;

    for (const conn of allConnections) {
      const sourceBlockId = conn.sourceId.replace('block-', '');
      const targetBlockId = conn.targetId.replace('block-', '');
      const sourceBlock = this.canvasBlocks.find(b => b.id === sourceBlockId);
      const targetBlock = this.canvasBlocks.find(b => b.id === targetBlockId);
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

      const radius = Math.max(
        minRadiusPx / this.zoomLevel,
        Math.min(maxRadiusPx / this.zoomLevel, length * radiusFactor)
      );

      const dist = Math.hypot(x - midX, y - midY);
      if (dist <= radius && dist < bestDist) {
        bestDist = dist;
        best = conn;
      }
    }

    return best;
  }

  private shiftBlocksDown(startBlock: ChatbotBlock, shiftAmount: number): void {
    const queue: ChatbotBlock[] = [startBlock];
    const visited = new Set<string>();
    visited.add(startBlock.id);
    startBlock.y += shiftAmount;

    while (queue.length > 0) {
      const currentBlock = queue.shift()!;
      const connections = this.jsPlumbFlowService.getConnections({ source: `block-${currentBlock.id}`});
      for (const conn of connections) {
        const childId = conn.targetId.replace('block-', '');
        if (!visited.has(childId)) {
          const childBlock = this.canvasBlocks.find(b => b.id === childId);
          if (childBlock) {
            childBlock.y += shiftAmount;
            visited.add(childId);
            queue.push(childBlock);
          }
        }
      }
    }
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
          childBlock.x = (parentBlock.x + (parentBlock.width / 2)) - (childBlock.width / 2);
          childBlock.y = parentBlock.y + parentBlock.height + this.MIN_VERTICAL_GAP;
          affectedIds.add(childBlock.id);
          processQueue.push(childId);
        }
      }
    }

    this.cdr.detectChanges();
    // Wait a frame to ensure DOM positions are applied
    await this.nextFrame();

    // Batch revalidate all affected endpoints and repaint once
    this.jsPlumbFlowService.batch(() => {
      for (const id of affectedIds) {
        this.jsPlumbFlowService.revalidate(`block-${id}`);
      }
      this.jsPlumbFlowService.repaintAllConnections();
    });
  }

  // --- Host Listeners and other methods remain the same ---

  @HostListener('wheel', ['$event']) onWheel(event: WheelEvent) {
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
    const newBlock: ChatbotBlock = { ...block, id: newBlockId, x: (block.x || 0) + 40, y: (block.y || 0) + 40 };
    this.canvasBlocks.push(newBlock);
    setTimeout(() => {
      this.updateBlockDimensions(newBlock);
      this.jsPlumbFlowService.setupBlock(`block-${newBlock.id}`);
      this.selectBlock(newBlock);
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

  updateCanvasTransform() {
    if (this.canvasContent) {
      const el = this.canvasContent.nativeElement as HTMLElement;
      // Use left/top for panning to ensure layout geometry updates (avoids transient angled lines)
      el.style.position = 'absolute';
      el.style.left = `${this.panOffsetX}px`;
      el.style.top = `${this.panOffsetY}px`;
      // Use scale only for zoom
      el.style.transform = `scale(${this.zoomLevel})`;
      // Keep jsPlumb's internal zoom in sync to avoid offset-induced angled lines
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
      connections: this.jsPlumbFlowService.getConnections().map((conn: any) => ({
        sourceId: conn.sourceId.replace('block-', ''),
        targetId: conn.targetId.replace('block-', ''),
      })),
    };
    console.log('Chatbot flow saved!', flowData);
  }

  zoomIn() { this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep); this.updateCanvasTransform(); this.jsPlumbFlowService.repaintAllConnections(); }
  zoomOut() { this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep); this.updateCanvasTransform(); this.jsPlumbFlowService.repaintAllConnections(); }
  resetZoom() { this.zoomLevel = 1.0; this.panOffsetX = 0; this.panOffsetY = 0; this.updateCanvasTransform(); this.jsPlumbFlowService.repaintAllConnections(); }
  
  scrollCanvas(direction: 'up' | 'down'): void {
    const scrollAmount = 150; 
    
    if (direction === 'down') {
      this.panOffsetY -= scrollAmount;
    } else {
      this.panOffsetY += scrollAmount;
    }

    this.updateCanvasTransform();
    this.jsPlumbFlowService.repaintAllConnections();
  }

  selectBlock(block: ChatbotBlock) { this.selectedBlock = block; this.rightSidebarOpen = true; }
  
  closeSidebar() { 
    this.rightSidebarOpen = false; 
    this.selectedBlock = null; 
  }

  toggleJarvis(): void {
    this.isJarvisVisible = !this.isJarvisVisible;
  }

  getStatusColor(status: string): string { return '#4CAF50'; }
  getTypeColor(type: string): string { return '#F5F5F5'; }
}