// src/app/chatbot-flow/chatbot-flow.component.ts
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDragEnd, CdkDrag } from '@angular/cdk/drag-drop'; // Ensure CdkDragDrop is imported
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { ChatbotBlock, Connection } from '../models/chatbot-block.model';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-chatbot-flow',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule
  ],
  templateUrl: './chatbot-flow.component.html',
  styleUrls: ['./chatbot-flow.component.scss']
})
export class ChatbotFlowComponent implements OnInit, AfterViewInit {
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
      id: '4', name: 'Text Response', icon: 'chat_bubble_outline', type: 'textResponse', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '5', name: 'Media block', icon: 'image', type: 'mediaBlock', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '6', name: 'Link Story', icon: 'link', type: 'linkStory', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '7', name: 'Notify Human Agent', icon: 'support_agent', type: 'notifyAgent', status: 'error', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '8', name: 'Conversational Form', icon: 'description', type: 'conversationalForm', status: 'new', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '9', name: 'Typing Delay', icon: 'hourglass_empty', type: 'typingDelay', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '10', name: 'Conditional Redirect', icon: 'call_split', type: 'conditionalRedirect', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '11', name: 'RSS Feed Integration', icon: 'rss_feed', type: 'rssFeed', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '12', name: 'JSON API Integration', icon: 'code', type: 'jsonApi', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0
    },
    {
      id: '13', name: 'Shopify Integration', icon: 'storefront', type: 'shopify', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0
    }
  ];

  canvasBlocks: ChatbotBlock[] = [];
  connections: Connection[] = [];
  filteredBlocks$: Observable<ChatbotBlock[]> | undefined;
  searchControl = new FormControl('');

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
      content: 'Hello 👋', // This is correctly set for the initial block
      keywords: ['Hello', 'Hi'],
      description: 'Define keywords that trigger the conversations',
      width: 0,
      height: 0
    });
  }

  ngAfterViewInit(): void {
    this.updateCanvasTransform();
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
      this.zoomLevel = parseFloat(newZoom.toFixed(2));
      this.updateCanvasTransform();
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.target === this.canvasWrapper.nativeElement) {
      this.isPanning = true;
      this.panStartX = event.clientX - this.panOffsetX;
      this.panStartY = event.clientY - this.panOffsetY;
      this.canvasWrapper.nativeElement.style.cursor = 'grabbing';
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
      this.temporaryConnection = {
        x1: this.connectionStart.x,
        y1: this.connectionStart.y,
        x2: (event.clientX - rect.left - this.panOffsetX) / this.zoomLevel,
        y2: (event.clientY - rect.top - this.panOffsetY) / this.zoomLevel
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

  // Block management
  addBlockToCanvas(block: ChatbotBlock) {
    const newBlockId = `${block.type}-${Date.now()}`;
    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: 300 + (this.canvasBlocks.length * 50),
      y: 100 + (this.canvasBlocks.length * 200),
      content: block.subType === 'keywordGroup' ? 'Hello 👋' : undefined,
      keywords: block.subType === 'keywordGroup' ? ['Hello', 'Hi'] : undefined
    };
    this.canvasBlocks.push(newBlock);
  }

  onBlockDragEnded(event: CdkDragEnd, block: ChatbotBlock) {
    const transform = event.source.getFreeDragPosition();
    block.x = (block.x || 0) + transform.x / this.zoomLevel;
    block.y = (block.y || 0) + transform.y / this.zoomLevel;
    event.source._dragRef.reset();
    this.updateConnections();
  }

  editCanvasBlock(block: ChatbotBlock) {
    console.log(`Editing block: ${block.name} (ID: ${block.id})`);
  }

  removeCanvasBlock(blockId: string) {
    this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== blockId);
    this.connections = this.connections.filter(c =>
      c.fromBlockId !== blockId && c.toBlockId !== blockId
    );
  }

  duplicateCanvasBlock(block: ChatbotBlock) {
    const newBlockId = `${block.type}-${Date.now()}-dup`;
    const newBlock: ChatbotBlock = {
      ...block,
      id: newBlockId,
      x: (block.x || 0) + 30,
      y: (block.y || 0) + 30
    };
    this.canvasBlocks.push(newBlock);
  }

  // CONNECTION DRAG & DROP: This is the missing method!
  drop(event: CdkDragDrop<ChatbotBlock[]>) {
    // This method is used for reordering items within the `allBlocks` array (left sidebar)
    moveItemInArray(this.allBlocks, event.previousIndex, event.currentIndex);
  }

  // Connection management
  startConnection(event: MouseEvent, block: ChatbotBlock) {
    event.stopPropagation();
    this.isDrawingConnection = true;
    this.connectionStart = {
      blockId: block.id,
      // These coordinates need to be relative to the SVG canvas's top-left corner
      // considering the block's position and zoom/pan of the parent canvas content.
      // For now, these are approximate center points of the connection dot at the bottom of the block
      x: block.x + (block.width || 200) / 2, // Assuming average block width of 200px if not defined
      y: block.y + (block.height || 120) // Assuming average block height of 120px if not defined
    };
  }

  endConnection(event: MouseEvent, block: ChatbotBlock) {
    event.stopPropagation();
    if (this.isDrawingConnection && this.connectionStart && this.connectionStart.blockId !== block.id) {
      // Calculate target point relative to the SVG canvas's top-left
      const targetX = block.x + (block.width || 200) / 2;
      const targetY = block.y; // Top center of the target block

      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        fromBlockId: this.connectionStart.blockId,
        toBlockId: block.id,
        fromPoint: { x: this.connectionStart.x, y: this.connectionStart.y },
        toPoint: { x: targetX, y: targetY }
      };
      this.connections.push(newConnection);
    }
    this.isDrawingConnection = false;
    this.temporaryConnection = null;
    this.connectionStart = null;
  }

  updateConnections() {
    // This method recalculates connection points based on current block positions.
    // It's important for the SVG lines to follow the blocks.
    this.connections.forEach(conn => {
      const fromBlock = this.canvasBlocks.find(b => b.id === conn.fromBlockId);
      const toBlock = this.canvasBlocks.find(b => b.id === conn.toBlockId);

      if (fromBlock && toBlock) {
        // Recalculate fromPoint (bottom center of fromBlock)
        conn.fromPoint = {
          x: fromBlock.x + (fromBlock.width || 200) / 2,
          y: fromBlock.y + (fromBlock.height || 120)
        };
        // Recalculate toPoint (top center of toBlock)
        conn.toPoint = {
          x: toBlock.x + (toBlock.width || 200) / 2,
          y: toBlock.y
        };
      }
    });
  }


  // Zoom controls
  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel + this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections(); // Update connections on zoom
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel - this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
      this.updateConnections(); // Update connections on zoom
    }
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panOffsetX = 0;
    this.panOffsetY = 0;
    this.updateCanvasTransform();
    this.updateConnections(); // Update connections on reset
  }

  updateCanvasTransform() {
    if (this.canvasContent) {
      // Apply pan and zoom to the canvas content div
      this.canvasContent.nativeElement.style.transform =
        `translate(${this.panOffsetX}px, ${this.panOffsetY}px) scale(${this.zoomLevel})`;
      this.canvasContent.nativeElement.style.transformOrigin = '0 0';
    }

    // Also update the SVG position and scale to match the canvas content
    // The SVG needs to be precisely aligned with the canvas-content for lines to match blocks.
    if (this.svgCanvas) {
      this.svgCanvas.nativeElement.style.transform =
        `translate(${this.panOffsetX}px, ${this.panOffsetY}px) scale(${this.zoomLevel})`;
      this.svgCanvas.nativeElement.style.transformOrigin = '0 0';
    }
  }

  // Keywords management
  removeKeyword(block: ChatbotBlock, keyword: string) {
    if (block.keywords) {
      block.keywords = block.keywords.filter(k => k !== keyword);
    }
  }

  addKeyword(block: ChatbotBlock, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Enter' && input.value.trim()) {
      if (!block.keywords) block.keywords = [];
      block.keywords.push(input.value.trim());
      input.value = '';
      event.preventDefault();
    }
  }

  // Save functionality
  saveFlow() {
    const flowData = {
      blocks: this.canvasBlocks,
      connections: this.connections
    };
    console.log('Chatbot flow saved!', flowData);
    alert('Chatbot flow saved! Check console for the current flow data.');
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
}