import { Injectable, EventEmitter } from '@angular/core';
import { jsPlumb } from 'jsplumb';

export interface ConnectionInfo {
  sourceId: string;
  targetId: string;
  connectionId: string;
}

interface BlockMoveInfo {
  blockId: string;
  x: number;
  y: number;
}

interface BlockDragEventInfo {
  blockId: string;
  element: HTMLElement;
}

@Injectable({
  providedIn: 'root'
})
export class JsPlumbFlowService {
  private instance: any;

  public connectionCreated = new EventEmitter<ConnectionInfo>();
  public connectionDeleted = new EventEmitter<ConnectionInfo>();
  public blockMoved = new EventEmitter<BlockMoveInfo>();
  public blockDragStarted = new EventEmitter<BlockDragEventInfo>();
  public blockDragEnded = new EventEmitter<BlockDragEventInfo>();

  constructor() { }

  initialize(containerEl: HTMLElement): void {
    if (this.instance) {
      this.instance.reset();
    }
    this.instance = jsPlumb.getInstance({
      Container: containerEl,
      // ConnectionOverlays: [['Arrow', { location: 1, id: 'arrow', length: 10, width: 10 }]],
      PaintStyle: {
        stroke: '#95a5a6',
        strokeWidth: 2,
        
      },
      HoverPaintStyle: { stroke: '#7c3aed', strokeWidth: 3 },
      Endpoint: 'Blank',

      EndpointStyle: {
        fill: '#4f46e5',
      },
      EndpointHoverStyle: { fill: '#7c3aed' },
      
      // *** MODIFIED CONNECTOR ***
      // Using 'stub' creates a main line of a fixed length (e.g., 30px) before
      // it branches out to connect to the target elements. This creates the
      // clean, rectangular branching effect seen in the diagram.
      Connector: ['Flowchart', { stub: 50,  cornerRadius: 5 }]
    });

    this.instance.bind('connection', (info: any) => {
      const newConnectionInfo: ConnectionInfo = {
        sourceId: info.sourceId,
        targetId: info.targetId,
        connectionId: info.connection.id
      };
      this.connectionCreated.emit(newConnectionInfo);
    });

    this.instance.bind('connectionDetached', (info: any) => {
      const detachedConnectionInfo: ConnectionInfo = {
        sourceId: info.sourceId,
        targetId: info.targetId,
        connectionId: info.connection.id
      };
      this.connectionDeleted.emit(detachedConnectionInfo);
    });
  }

  setupBlock(blockId: string): void {
    const blockElement = document.getElementById(blockId);
    if (!this.instance || !blockElement) { return; }

    // Allow unlimited connections on both ends to avoid unexpected refusal to connect
    this.instance.addEndpoint(blockElement, { anchor: 'Bottom', isSource: true, maxConnections: -1, uuid: `${blockId}-source` });
    this.instance.addEndpoint(blockElement, { anchor: 'Top', isTarget: true, maxConnections: -1, uuid: `${blockId}-target` });

    // For synthetic quick-reply visuals, keep them static (non-draggable)
    // but still allow connection anchors so we can draw visual lines.
    const isQuickReplySynthetic = blockId.includes('-qr');
    const isNoQuickReplySynthetic = blockId.includes('-noqr');
    const isSyntheticChild = isQuickReplySynthetic || isNoQuickReplySynthetic;

    if (!isSyntheticChild) {
      this.instance.draggable(blockElement, {
        start: (event: any) => {
          this.blockDragStarted.emit({ blockId: blockId.replace('block-', ''), element: event.el });
        },
        stop: (event: any) => {
          this.blockMoved.emit({ blockId: blockId.replace('block-', ''), x: event.pos[0], y: event.pos[1] });
          this.blockDragEnded.emit({ blockId: blockId.replace('block-', ''), element: event.el });
        }
      });
    } else {
      // For synthetic blocks, ensure they have proper connection endpoints
      // but don't make them draggable - they're part of the visual flow
      console.log(`Setup synthetic block endpoints for: ${blockId}`);
    }
  }

  removeBlock(blockId: string): void {
    const blockElement = document.getElementById(blockId);
    if (blockElement && this.instance) {
      this.instance.remove(blockElement);
    }
  }

  deleteJsPlumbConnection(connection: any): void {
    if (!this.instance) { return; }
    this.instance.deleteConnection(connection);
  }

  connectBlocks(sourceBlockId: string, targetBlockId: string): any | null {
    if (!this.instance) { return null; }
    const existing = this.instance.getConnections({ source: sourceBlockId, target: targetBlockId });
    if (existing.length > 0) { return null; }
    const conn = this.instance.connect({
      uuids: [`${sourceBlockId}-source`, `${targetBlockId}-target`],
      // Using the specific endpoint UUIDs is more reliable than general anchors here.
      // source: sourceBlockId,
      // target: targetBlockId,
      // anchor: ['Bottom', 'Top'],
    });
    // After connecting, ensure jsPlumb computes offsets immediately
    this.instance.revalidate(sourceBlockId);
    this.instance.revalidate(targetBlockId);
    this.instance.repaintEverything();
    return conn;
  }

  repaintAllConnections(): void {
    if (this.instance) {
      this.instance.repaintEverything();
    }
  }

  getConnections(options?: object): any[] {
    return this.instance ? this.instance.getConnections(options) : [];
  }

  reset(): void {
    if (this.instance) {
      this.instance.reset();
    }
  }

  // Batch jsPlumb operations to avoid transient angled lines
  batch<T>(fn: () => T): T {
    if (!this.instance) { return fn(); }
    let result!: T;
    this.instance.batch(() => {
      result = fn();
    });
    return result;
  }

  // Ask jsPlumb to recompute element offsets after DOM changes
  revalidate(blockElementId: string): void {
    if (this.instance) {
      this.instance.revalidate(blockElementId);
    }
  }

  setZoom(zoom: number): void {
    if (this.instance) {
      this.instance.setZoom(zoom);
    }
  }
}