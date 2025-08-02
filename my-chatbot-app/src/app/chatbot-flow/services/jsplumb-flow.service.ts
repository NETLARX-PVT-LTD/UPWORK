import { Injectable, EventEmitter } from '@angular/core';
import { jsPlumb } from 'jsplumb'; // Ensure jsPlumb is imported

// Define interfaces if they are not globally available in this service context
// You might already have them in chatbot-block.model.ts,
// but if this service needs to define its own for strict typing, do it here.
interface ConnectionInfo {
  sourceId: string;
  targetId: string;
  connectionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class JsPlumbFlowService {
  private instance: any;
  private jsPlumbConnections: any[] = []; // Internal tracking of jsPlumb connections

  // Event emitters to communicate connection changes back to components
  public connectionCreated = new EventEmitter<ConnectionInfo>();
  public connectionDeleted = new EventEmitter<ConnectionInfo>();
  public blockMoved = new EventEmitter<string>(); // Emits blockId when a block is moved

  constructor() { }

  /**
   * Initializes the jsPlumb instance on the provided container element.
   * @param containerEl The HTML element that will contain the jsPlumb flow.
   */
  initialize(containerEl: HTMLElement): void {
    if (this.instance) {
      this.instance.reset(); // Reset existing instance if re-initializing
    }

    this.instance = jsPlumb.getInstance({
      Container: containerEl,
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

    // Bind events for connection creation and deletion
    this.instance.bind('connection', (info: any, originalEvent: Event) => {
      // Avoid duplicate connections on programmatic calls if not desired
      const newConnectionInfo: ConnectionInfo = {
        sourceId: info.sourceId,
        targetId: info.targetId,
        connectionId: info.connection.id
      };
      this.jsPlumbConnections.push(info.connection);
      this.connectionCreated.emit(newConnectionInfo);
      console.log('jsPlumb Connection created:', newConnectionInfo);
    });

    this.instance.bind('connectionDetached', (info: any, originalEvent: Event) => {
      const detachedConnectionInfo: ConnectionInfo = {
        sourceId: info.sourceId,
        targetId: info.targetId,
        connectionId: info.connection.id
      };
      this.jsPlumbConnections = this.jsPlumbConnections.filter(conn => conn.id !== info.connection.id);
      this.connectionDeleted.emit(detachedConnectionInfo);
      console.log('jsPlumb Connection detached:', detachedConnectionInfo);
    });

    // Handle connection clicks for deletion
    this.instance.bind('click', (connection: any) => {
      if (confirm('Delete this connection?')) {
        this.instance.deleteConnection(connection);
        // connectionDetached event will handle removal from jsPlumbConnections array
      }
    });

    // Bind to the stop event of the drag to emit block movement
    this.instance.bind("stop", (params: any) => {
        // params.el is the DOM element that was dragged
        // We can extract its ID to identify the block
        this.blockMoved.emit(params.el.id.replace('block-', '')); // Emit the actual block ID
        console.log(`Block dragged and stopped: ${params.el.id}`);
        // No need to repaintEverything here, as jsPlumb handles connection repainting automatically on drag
    });
  }

  /**
   * Sets up jsPlumb endpoints and draggability for a given block element.
   * @param blockId The ID of the block (e.g., 'block-1', not just '1').
   */
  setupBlock(blockId: string): void {
    const blockElement = document.getElementById(blockId);
    if (!this.instance || !blockElement) {
      console.warn(`jsPlumb instance not initialized or block element not found: ${blockId}`);
      return;
    }

    // Make the block draggable
    this.instance.draggable(blockElement, {
      grid: [10, 10],
      // containment: 'parent' // Removed for now, can be added back if needed based on canvas setup
      stop: (params: any) => {
        // This 'stop' event will also be handled by the global 'stop' bind,
        // but can be used for block-specific logic if necessary.
        this.blockMoved.emit(blockId.replace('block-', ''));
      }
    });

    // Add source endpoint (output) - positioned at bottom center
    this.instance.addEndpoint(blockElement, {
      anchor: 'Bottom',
      isSource: true,
      maxConnections: -1,
      // endpoint: ['Dot', { radius: 8 }],
      paintStyle: {
        // stroke: '#F1F2F3',
        // strokeWidth: 5,
        // fill: '#4f46e5'
      },
      // connectorStyle: { stroke: '#4f46e5', strokeWidth: 2 },
      connector: ['Flowchart', { stub: [20, 30], gap: 5, cornerRadius: 5 }],
      overlays: [
        ['Arrow', { location: 1, length: 10, width: 10 }]
      ],
      uuid: `${blockId}-source` // Unique ID for this endpoint
    });

    // Add target endpoint (input) - positioned at top center
    this.instance.addEndpoint(blockElement, {
      anchor: 'Top',
      isTarget: true,
      maxConnections: -1,
      // endpoint: ['Dot', { radius:  8}],
      paintStyle: {
        // stroke: '#F1F2F3',
        // strokeWidth: 5,
        // fill: '#10b981'
      },
      // hoverPaintStyle: { fill: '#059669' },
      uuid: `${blockId}-target` // Unique ID for this endpoint
    });

    console.log(`jsPlumb setup completed for block: ${blockId}`);
  }

  /**
   * Removes all jsPlumb endpoints and draggability from a block.
   * @param blockId The ID of the block to remove (e.g., 'block-1').
   */
  removeBlock(blockId: string): void {
    const elementId = blockId; // Assuming blockId already includes 'block-' prefix
    const blockElement = document.getElementById(elementId);

    if (blockElement && this.instance) {
      // Remove all connections and endpoints associated with this element
      this.instance.remove(blockElement);

      // Filter out connections involving this block from our internal list
      this.jsPlumbConnections = this.jsPlumbConnections.filter(conn =>
        conn.sourceId !== elementId && conn.targetId !== elementId
      );
      console.log(`jsPlumb removed for block: ${blockId}`);
    }
  }

  /**
   * Creates a connection between two block elements.
   * @param sourceBlockId The ID of the source block (e.g., 'block-sourceId').
   * @param targetBlockId The ID of the target block (e.g., 'block-targetId').
   * @returns The created connection object, or null if connection fails or already exists.
   */
  /**
   * Finds the first jsPlumb connection that is within `tolerance` pixels of
   * the supplied point (coordinates are relative to the jsPlumb container).
   */
  findConnectionNear(x: number, y: number, tolerance = 20): any | null {
    if (!this.instance) { return null; }

    const containerRect = (this.instance.getContainer() as HTMLElement).getBoundingClientRect();

    const connections = this.instance.getAllConnections();
    for (const conn of connections) {
      const ep1 = conn.endpoints[0].canvas.getBoundingClientRect();
      const ep2 = conn.endpoints[1].canvas.getBoundingClientRect();

      // Mid-points of endpoints relative to container
      const x1 = ep1.left + ep1.width / 2 - containerRect.left;
      const y1 = ep1.top + ep1.height / 2 - containerRect.top;
      const x2 = ep2.left + ep2.width / 2 - containerRect.left;
      const y2 = ep2.top + ep2.height / 2 - containerRect.top;

      const dist = this.#pointToSegmentDistance(x, y, x1, y1, x2, y2);
      if (dist <= tolerance) {
        return conn;
      }
    }
    return null;
  }

  /**
   * Removes the given connection from the canvas and internal list.
   */
  deleteJsPlumbConnection(connection: any): void {
    if (!this.instance) { return; }
    this.instance.deleteConnection(connection);
    this.jsPlumbConnections = this.jsPlumbConnections.filter(c => c.id !== connection.id);
  }

  // Helper – shortest distance from P to line segment AB
  #pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) {
      return Math.hypot(px - x1, py - y1);
    }
    const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    const clampedT = Math.max(0, Math.min(1, t));
    const cx = x1 + clampedT * dx;
    const cy = y1 + clampedT * dy;
    return Math.hypot(px - cx, py - cy);
  }

  connectBlocks(sourceBlockId: string, targetBlockId: string): any | null {
    if (!this.instance) {
      console.error('jsPlumb instance not initialized.');
      return null;
    }

    // Check if connection already exists using source and target IDs
    const existingConnection = this.instance.getConnections({
      source: sourceBlockId,
      target: targetBlockId
    });

    if (existingConnection && existingConnection.length > 0) {
      console.warn(`Connection already exists between ${sourceBlockId} and ${targetBlockId}`);
      return null;
    }

    const connection = this.instance.connect({
      source: sourceBlockId,
      target: targetBlockId,
      anchor: ['Bottom', 'Top'], // Source bottom, Target top
      endpoint: ['Dot', { radius: 5 }],
      connector: ['Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5 }],
      paintStyle: { stroke: '#4f46e5', strokeWidth: 2 },
      overlays: [
        ['Arrow', { location: 1, length: 10, width: 10 }]
      ]
    });

    if (connection) {
      // The 'connection' event listener will add it to jsPlumbConnections and emit
      return connection;
    }
    return null;
  }

  /**
   * Repaints all existing jsPlumb connections. Useful after zoom or pan.
   */
  repaintAllConnections(): void {
    if (this.instance) {
      this.instance.repaintEverything();
      console.log('jsPlumb: Repainting all connections.');
    }
  }

  /**
   * Gets all active jsPlumb connections.
   * @returns An array of jsPlumb connection objects.
   */
  getConnections(): any[] {
    return this.jsPlumbConnections;
  }

  /**
   * Resets the jsPlumb instance, clearing all elements and connections.
   */
  reset(): void {
    if (this.instance) {
      this.instance.reset();
      this.jsPlumbConnections = [];
      console.log('jsPlumb instance reset.');
    }
  }
}