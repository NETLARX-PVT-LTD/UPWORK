// src/app/chatbot-flow/chatbot-flow.component.ts
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { ChatbotBlock, Connection, AvailableMedia, AvailableStory, AvailableForm } from '../models/chatbot-block.model';
import { ChatbotExecutionService } from '../services/chatbot-execution.service';

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
import { TypingDelayBlockComponent } from './blocks/typing-delay-block/typing-delay-block.component';
import { MediaBlockComponent } from './blocks/media-block/media-block.component';
import { LinkStoryBlockComponent } from './blocks/link-story-block/link-story-block.component';
import { ConversationalFormBlockComponent } from './blocks/conversational-form-block/conversational-form-block.component';
import { MessageBoxComponent } from '../shared/components/message-box/message-box.component';
import { JsonApiIntegrationBlockComponent } from './blocks/json-api-integration-block/json-api-integration-block.component';

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
    TypingDelayBlockComponent,
    MediaBlockComponent,
    LinkStoryBlockComponent,
    ConversationalFormBlockComponent,
    MessageBoxComponent,
    JsonApiIntegrationBlockComponent
  ],
  templateUrl: './chatbot-flow.component.html',
  styleUrls: ['./chatbot-flow.component.scss']
})
export class ChatbotFlowComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasWrapper') canvasWrapper!: ElementRef;
  @ViewChild('canvasContent') canvasContent!: ElementRef;

  // Canvas data
  canvasBlocks: ChatbotBlock[] = [];
  connections: Connection[] = [];
  filteredBlocks$: Observable<ChatbotBlock[]> | undefined;
  searchControl = new FormControl('');

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
      content: ''
    },
    {
      id: '5', name: 'Media block', icon: 'image', type: 'mediaBlock', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0,
      description: 'Respond your users with multimedia messages such as Images, Videos etc',
      mediaId: undefined,
      mediaType: undefined,
      mediaUrl: undefined,
      mediaName: undefined
    },
    {
      id: '6', name: 'Link Story', icon: 'link', type: 'linkStory', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0,
      linkStoryId: undefined,
      linkStoryName: undefined
    },
    {
      id: '7', name: 'Conversational Form', icon: 'description', type: 'conversationalForm', status: 'new', x: 0, y: 0,
      width: 0,
      height: 0,
      formId: undefined,
      formName: undefined,
      webhookUrl: undefined,
      sendEmailNotification: undefined,
      notificationEmail: undefined,
      formFields: undefined,
      showAsInlineForm: undefined,
      description: "Ask one question at a time & send responses to your desired location or webservice"
    },
    {
      id: '8', name: 'Typing Delay', icon: 'hourglass_empty', type: 'typingDelay', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0,
      description: 'Add a typing delay between two blocks to mimic a real experience',
      delaySeconds: 1
    },
    {
      id: '9', name: 'JSON API Integration', icon: 'code', type: 'jsonApi', status: 'active', x: 0, y: 0,
      width: 0,
      height: 0,
      description: "Integrate JSON API to fetch or post data to your webservice"
    },
  ];

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

  // Connection drawing
  temporaryConnection: any = null;
  connectionStartBlock: ChatbotBlock | null = null;

  // Right Sidebar properties
  selectedBlock: ChatbotBlock | null = null;
  rightSidebarOpen: boolean = false;

  // Message Box properties
  showMessageBox: boolean = false;
  messageBoxContent: string = '';
  messageBoxType: 'info' | 'success' | 'warning' | 'error' = 'info';

  constructor(private chatbotExecutionService: ChatbotExecutionService) { }

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
    this.updateCanvasTransform();
    
    // Set initial dimensions for the starting block
    setTimeout(() => {
      this.updateBlockDimensions(this.canvasBlocks[0]);
      this.recalculateAllConnectionCoordinates();
    }, 100);
  }

  private recalculateAllConnectionCoordinates(): void {
    this.connections.forEach(connection => {
      const fromBlock = this.canvasBlocks.find(b => b.id === connection.fromBlockId);
      const toBlock = this.canvasBlocks.find(b => b.id === connection.toBlockId);
      
      if (fromBlock) {
        connection.fromPoint = this.calculateConnectionPoint(fromBlock, 'output');
      }
      if (toBlock) {
        connection.toPoint = this.calculateConnectionPoint(toBlock, 'input');
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Test method for debugging connections
  testConnection(): void {
    console.log('=== TESTING CONNECTION ===');
    
    // Add a second block if we only have one
    if (this.canvasBlocks.length === 1) {
      const textResponseBlock = this.allBlocks.find(b => b.type === 'textResponse');
      if (textResponseBlock) {
        this.addBlockToCanvas(textResponseBlock);
        setTimeout(() => {
          this.createTestConnection();
        }, 200);
        return;
      }
    }
    
    if (this.canvasBlocks.length >= 2) {
      this.createTestConnection();
    } else {
      console.log('Need at least 2 blocks to test connection');
    }
  }

  private createTestConnection(): void {
    const firstBlock = this.canvasBlocks[0];
    const secondBlock = this.canvasBlocks[1];
    
    // Position second block to the right of first block
    secondBlock.x = (firstBlock.x || 0) + 350;
    secondBlock.y = (firstBlock.y || 0);
    
    console.log('Creating test connection between:', firstBlock.id, 'and', secondBlock.id);
    
    // Force update connection coordinates after positioning
    setTimeout(() => {
      this.recalculateAllConnectionCoordinates();
      this.createConnection(firstBlock.id, secondBlock.id);
    }, 100);
  }

  createConnection(fromBlockId: string, toBlockId: string): void {
    console.log('=== CREATING CONNECTION ===');
    console.log('From Block ID:', fromBlockId);
    console.log('To Block ID:', toBlockId);
    console.log('Existing connections:', this.connections);
    
    // Check if connection already exists
    const existingConnection = this.connections.find(
      conn => conn.fromBlockId === fromBlockId && conn.toBlockId === toBlockId
    );

    if (existingConnection) {
      console.log('Connection already exists!');
      this.displayMessageBox('Connection already exists between these blocks.', 'warning');
      return;
    }

    // Calculate connection points
    const fromBlock = this.canvasBlocks.find(b => b.id === fromBlockId);
    const toBlock = this.canvasBlocks.find(b => b.id === toBlockId);
    
    if (!fromBlock || !toBlock) {
      console.log('Blocks not found!');
      return;
    }

    const fromPoint = this.calculateConnectionPoint(fromBlock, 'output');
    const toPoint = this.calculateConnectionPoint(toBlock, 'input');

    const connection: Connection = {
      id: `conn-${Date.now()}`,
      fromBlockId: fromBlockId,
      toBlockId: toBlockId,
      fromPoint: fromPoint,
      toPoint: toPoint
    };

    console.log('New connection:', connection);
    this.connections.push(connection);
    console.log('Updated connections array:', this.connections);
    
    this.displayMessageBox('Connection created successfully!', 'success');
  }

  private calculateConnectionPoint(block: ChatbotBlock, type: 'input' | 'output'): { x: number, y: number } {
    const blockElement = this.canvasContent.nativeElement.querySelector(`#${block.id}`);
    if (!blockElement) {
      return { x: block.x || 0, y: block.y || 0 };
    }

    const rect = blockElement.getBoundingClientRect();
    const canvasRect = this.canvasContent.nativeElement.getBoundingClientRect();
    
    if (type === 'output') {
      // Right side of the block
      return {
        x: rect.right - canvasRect.left,
        y: rect.top + rect.height / 2 - canvasRect.top
      };
    } else {
      // Left side of the block
      return {
        x: rect.left - canvasRect.left,
        y: rect.top + rect.height / 2 - canvasRect.top
      };
    }
  }

  private _filter(value: string): ChatbotBlock[] {
    const filterValue = value.toLowerCase();
    return this.allBlocks.filter(block =>
      block.name.toLowerCase().includes(filterValue) ||
      (block.description && block.description.toLowerCase().includes(filterValue))
    );
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

  updateBlockDimensions(block: ChatbotBlock) {
    const blockElement = this.canvasContent.nativeElement.querySelector(`#${block.id}`);
    if (blockElement) {
      block.width = blockElement.offsetWidth;
      block.height = blockElement.offsetHeight;
    }
  }

  updateCanvasTransform() {
    if (this.canvasContent) {
      this.canvasContent.nativeElement.style.transform =
        `translate(${this.panOffsetX}px, ${this.panOffsetY}px) scale(${this.zoomLevel})`;
      this.canvasContent.nativeElement.style.transformOrigin = '0 0';
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
      
      if (this.selectedBlock) {
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
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.isPanning = false;
    this.canvasWrapper.nativeElement.style.cursor = 'default';
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel + this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = parseFloat((this.zoomLevel - this.zoomStep).toFixed(2));
      this.updateCanvasTransform();
    }
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panOffsetX = 0;
    this.panOffsetY = 0;
    this.updateCanvasTransform();
  }

  saveFlow() {
    // Save in the format you showed
    const flowData = this.chatbotExecutionService.saveFlowData(this.canvasBlocks, this.connections);
    
    console.log('Chatbot flow saved!', flowData);
    console.log('Flow data structure:', {
      blocks: flowData.blocks,
      connections: flowData.connections
    });
    
    // Test the execution engine
    this.testChatbotExecution();
    
    this.displayMessageBox('Chatbot flow saved successfully!', 'success');
  }

  /**
   * Test the chatbot execution with sample user input
   */
  private testChatbotExecution() {
    const testUserMessage = "Hi";
    const flow = {
      blocks: this.canvasBlocks,
      connections: this.connections
    };
    
    const responses = this.chatbotExecutionService.executeFlow(testUserMessage, flow);
    console.log('Chatbot execution test:', {
      userMessage: testUserMessage,
      responses: responses
    });
  }

  drop(event: CdkDragDrop<ChatbotBlock[]>) {
    moveItemInArray(this.allBlocks, event.previousIndex, event.currentIndex);
  }

  onBlockDragEnded(event: CdkDragEnd, block: ChatbotBlock) {
    // Update block position based on drag
    const newX = (block.x || 0) + event.distance.x;
    const newY = (block.y || 0) + event.distance.y;
    
    block.x = newX;
    block.y = newY;
    
    console.log(`Block ${block.id} moved to:`, { x: newX, y: newY });
    
    // Update connection coordinates for this block
    this.updateConnectionCoordinates(block.id);
    
    // Reset the drag reference
    event.source._dragRef.reset();
  }

  private updateConnectionCoordinates(blockId: string): void {
    // Update connections that involve this block
    this.connections.forEach(connection => {
      if (connection.fromBlockId === blockId) {
        const fromBlock = this.canvasBlocks.find(b => b.id === blockId);
        if (fromBlock) {
          connection.fromPoint = this.calculateConnectionPoint(fromBlock, 'output');
        }
      }
      if (connection.toBlockId === blockId) {
        const toBlock = this.canvasBlocks.find(b => b.id === blockId);
        if (toBlock) {
          connection.toPoint = this.calculateConnectionPoint(toBlock, 'input');
        }
      }
    });
  }

  onBlockUpdated(updatedBlock: ChatbotBlock) {
    const index = this.canvasBlocks.findIndex(b => b.id === updatedBlock.id);
    if (index > -1) {
      this.canvasBlocks[index] = updatedBlock;
      if (this.selectedBlock?.id === updatedBlock.id) {
        this.selectedBlock = updatedBlock;
      }
    }
  }

  editCanvasBlock(block: ChatbotBlock) {
    this.selectBlock(block);
  }

  removeCanvasBlock(blockId: string) {
    // Remove from canvas blocks
    this.canvasBlocks = this.canvasBlocks.filter(b => b.id !== blockId);
    
    // Remove related connections
    this.connections = this.connections.filter(c =>
      c.fromBlockId !== blockId && c.toBlockId !== blockId
    );
    
    if (this.selectedBlock?.id === blockId) {
      this.selectedBlock = null;
      this.closeSidebar();
    }
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
      this.selectBlock(newBlock);
    }, 100);
  }

  startConnection(event: MouseEvent, block: ChatbotBlock): void {
    event.stopPropagation();
    this.connectionStartBlock = block;
    
    // Add visual feedback for connection mode
    const blockElement = this.canvasContent.nativeElement.querySelector(`#${block.id}`);
    if (blockElement) {
      blockElement.classList.add('connection-mode');
    }
    
    document.addEventListener('mousemove', this.updateTemporaryConnection);
    document.addEventListener('mouseup', this.endTemporaryConnection);
  }

  updateTemporaryConnection = (event: MouseEvent): void => {
    // Update temporary connection visual feedback
    if (this.temporaryConnection) {
      this.temporaryConnection.x2 = event.clientX;
      this.temporaryConnection.y2 = event.clientY;
    }
  }

  endTemporaryConnection = (event: MouseEvent): void => {
    document.removeEventListener('mousemove', this.updateTemporaryConnection);
    document.removeEventListener('mouseup', this.endTemporaryConnection);
    
    // Remove connection mode visual feedback
    if (this.connectionStartBlock) {
      const blockElement = this.canvasContent.nativeElement.querySelector(`#${this.connectionStartBlock.id}`);
      if (blockElement) {
        blockElement.classList.remove('connection-mode');
      }
    }
    
    if (!this.connectionStartBlock) {
      this.temporaryConnection = null;
      return;
    }
    
    const targetElement = document.elementFromPoint(event.clientX, event.clientY);
    if (targetElement) {
      const targetBlockElement = targetElement.closest('.canvas-block');
      if (targetBlockElement && targetBlockElement.id !== this.connectionStartBlock.id) {
        const targetBlock = this.canvasBlocks.find(b => b.id === targetBlockElement.id);
        if (targetBlock) {
          this.createConnection(this.connectionStartBlock.id, targetBlock.id);
        }
      }
    }
    
    this.temporaryConnection = null;
    this.connectionStartBlock = null;
  }

  endConnection(event: MouseEvent, block: ChatbotBlock): void {
    if (this.connectionStartBlock && this.connectionStartBlock.id !== block.id) {
      this.createConnection(this.connectionStartBlock.id, block.id);
    }
    
    this.temporaryConnection = null;
    this.connectionStartBlock = null;
    document.removeEventListener('mousemove', this.updateTemporaryConnection);
    document.removeEventListener('mouseup', this.endTemporaryConnection);
  }
}