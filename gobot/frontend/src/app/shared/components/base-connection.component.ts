import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit, OnDestroy, Inject } from '@angular/core';
import { ConnectionService } from '../../services/connection.service';
import { ChatbotBlock, Connection } from '../../models/chatbot-block.model';
import { Subscription } from 'rxjs';

@Component({
  template: '' // This is a base class, no template needed
})
export abstract class BaseConnectionComponent implements OnInit, OnDestroy {
  @Input() block!: ChatbotBlock;
  @Input() isSelected: boolean = false;
  @Input() isSidebarOpen: boolean = false;
  @Input() zoomLevel: number = 1.0;

  @Output() blockUpdated = new EventEmitter<ChatbotBlock>();
  @Output() selectBlock = new EventEmitter<ChatbotBlock>();
  @Output() removeBlock = new EventEmitter<string>();
  @Output() duplicateBlock = new EventEmitter<ChatbotBlock>();
  @Output() editBlock = new EventEmitter<ChatbotBlock>();
  @Output() closeSidebarEvent = new EventEmitter<void>();

  @ViewChild('blockElement', { static: false }) blockElement!: ElementRef;

  protected connectionState: any = null;
  private connectionStateSubscription: Subscription | null = null;

  constructor(@Inject(ConnectionService) protected connectionService: ConnectionService) {}

  ngOnInit(): void {
    this.subscribeToConnectionState();
  }

  ngOnDestroy(): void {
    if (this.connectionStateSubscription) {
      this.connectionStateSubscription.unsubscribe();
    }
  }

  private subscribeToConnectionState(): void {
    this.connectionStateSubscription = this.connectionService.connectionState$.subscribe(
      state => {
        this.connectionState = state;
      }
    );
  }

  // Handle connection start from output point
  onStartConnection(event: MouseEvent): void {
    event.stopPropagation();
    
    if (!this.blockElement?.nativeElement) return;

    const outputPointElement = this.blockElement.nativeElement.querySelector('.connection-output .connection-dot') as HTMLElement;
    if (!outputPointElement) return;

    // Get canvas element (assuming it's a parent with id 'canvas')
    const canvasElement = this.blockElement.nativeElement.closest('#canvas') as HTMLElement;
    if (!canvasElement) return;

    const connectionPoint = this.connectionService.calculateConnectionPoint(
      outputPointElement, 
      canvasElement, 
      this.zoomLevel
    );

    this.connectionService.startConnection(this.block.id, connectionPoint.x, connectionPoint.y);
  }

  // Handle connection end to input point
  onEndConnection(event: MouseEvent): void {
    event.stopPropagation();
    
    if (!this.connectionState?.isDrawingConnection || 
        !this.connectionState?.connectionStart || 
        this.connectionState.connectionStart.blockId === this.block.id) {
      return;
    }

    if (!this.blockElement?.nativeElement) {
      this.connectionService.endConnection();
      return;
    }

    const inputPointElement = this.blockElement.nativeElement.querySelector('.connection-input .connection-dot') as HTMLElement;
    if (!inputPointElement) {
      this.connectionService.endConnection();
      return;
    }

    // Get canvas element
    const canvasElement = this.blockElement.nativeElement.closest('#canvas') as HTMLElement;
    if (!canvasElement) {
      this.connectionService.endConnection();
      return;
    }

    const connectionPoint = this.connectionService.calculateConnectionPoint(
      inputPointElement, 
      canvasElement, 
      this.zoomLevel
    );

    // Check if connection is valid
    if (this.connectionService.isValidConnection(
      this.connectionState.connectionStart.blockId, 
      this.block.id
    )) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        fromBlockId: this.connectionState.connectionStart.blockId,
        toBlockId: this.block.id,
        fromPoint: { 
          x: this.connectionState.connectionStart.x, 
          y: this.connectionState.connectionStart.y 
        },
        toPoint: { x: connectionPoint.x, y: connectionPoint.y }
      };

      try {
        this.connectionService.addConnection(newConnection);
      } catch (error) {
        console.warn('Connection failed:', error);
        // You could emit an event to show a warning message
      }
    } else {
      console.warn('Invalid connection or connection already exists');
      // You could emit an event to show a warning message
    }

    this.connectionService.endConnection();
  }

  // Handle mouse enter for connection input point
  onConnectionInputEnter(event: MouseEvent): void {
    if (this.connectionState?.isDrawingConnection && 
        this.connectionState.connectionStart?.blockId !== this.block.id) {
      // Highlight the input point to show it's a valid target
      const inputPointElement = (event.target as HTMLElement).closest('.connection-input');
      if (inputPointElement) {
        inputPointElement.classList.add('connection-target-highlight');
      }
    }
  }

  // Handle mouse leave for connection input point
  onConnectionInputLeave(event: MouseEvent): void {
    const inputPointElement = (event.target as HTMLElement).closest('.connection-input');
    if (inputPointElement) {
      inputPointElement.classList.remove('connection-target-highlight');
    }
  }

  // Update connection points when block moves
  updateConnectionPoints(): void {
    if (!this.blockElement?.nativeElement) return;

    const canvasElement = this.blockElement.nativeElement.closest('#canvas') as HTMLElement;
    if (!canvasElement) return;

    // Update outgoing connections
    const outputPointElement = this.blockElement.nativeElement.querySelector('.connection-output .connection-dot') as HTMLElement;
    if (outputPointElement) {
      const outputPoint = this.connectionService.calculateConnectionPoint(
        outputPointElement, 
        canvasElement, 
        this.zoomLevel
      );

      const blockConnections = this.connectionService.getBlockConnections(this.block.id);
      blockConnections.outgoing.forEach(connection => {
        this.connectionService.updateConnectionPoints(
          connection.id, 
          outputPoint, 
          connection.toPoint
        );
      });
    }

    // Update incoming connections
    const inputPointElement = this.blockElement.nativeElement.querySelector('.connection-input .connection-dot') as HTMLElement;
    if (inputPointElement) {
      const inputPoint = this.connectionService.calculateConnectionPoint(
        inputPointElement, 
        canvasElement, 
        this.zoomLevel
      );

      const blockConnections = this.connectionService.getBlockConnections(this.block.id);
      blockConnections.incoming.forEach(connection => {
        this.connectionService.updateConnectionPoints(
          connection.id, 
          connection.fromPoint, 
          inputPoint
        );
      });
    }
  }

  // Common block actions
  onBlockClick(): void {
    this.selectBlock.emit(this.block);
  }

  onRemoveBlock(): void {
    // Remove connections before removing block
    this.connectionService.removeBlockConnections(this.block.id);
    this.removeBlock.emit(this.block.id);
  }

  onDuplicateBlock(): void {
    this.duplicateBlock.emit(this.block);
  }

  onEditBlock(): void {
    this.editBlock.emit(this.block);
  }

  closeSidebar(): void {
    this.closeSidebarEvent.emit();
  }

  // Abstract methods that child components must implement
  abstract onContentChange(): void;
} 