import { Injectable, EventEmitter } from '@angular/core';
import { jsPlumb } from 'jsplumb';

interface ConnectionInfo {
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
      ConnectionOverlays: [['Arrow', { location: 1, id: 'arrow', length: 10, width: 10 }]],
      PaintStyle: { 
        stroke: '#4f46e5', 
        strokeWidth: 2 
      },
      HoverPaintStyle: { stroke: '#7c3aed', strokeWidth: 3 },
      EndpointStyle: { 
        fill: '#4f46e5'
      },
      EndpointHoverStyle: { fill: '#7c3aed' },
      Connector: ['Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }]
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

    // Removed click to delete with confirm()
  }

  setupBlock(blockId: string): void {
    const blockElement = document.getElementById(blockId);
    if (!this.instance || !blockElement) { return; }

    this.instance.addEndpoint(blockElement, { anchor: 'Bottom', isSource: true, maxConnections: -1, uuid: `${blockId}-source` });
    this.instance.addEndpoint(blockElement, { anchor: 'Top', isTarget: true, maxConnections: -1, uuid: `${blockId}-target` });

    this.instance.draggable(blockElement, {
      start: (event: any) => {
        this.blockDragStarted.emit({ blockId: blockId.replace('block-', ''), element: event.el });
      },
      stop: (event: any) => {
        this.blockMoved.emit({ blockId: blockId.replace('block-', ''), x: event.pos[0], y: event.pos[1] });
        this.blockDragEnded.emit({ blockId: blockId.replace('block-', ''), element: event.el });
      }
    });
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
    return this.instance.connect({
      source: sourceBlockId,
      target: targetBlockId,
      anchor: ['Bottom', 'Top'],
    });
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
}