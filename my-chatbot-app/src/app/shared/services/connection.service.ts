import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Connection } from '../../models/chatbot-block.model';

export interface ConnectionPoint {
  blockId: string;
  x: number;
  y: number;
  type: 'input' | 'output';
}

export interface ConnectionState {
  isDrawingConnection: boolean;
  connectionStart: { blockId: string; x: number; y: number } | null;
  temporaryConnection: { x1: number; y1: number; x2: number; y2: number } | null;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private connectionsSubject = new BehaviorSubject<Connection[]>([]);
  private connectionStateSubject = new BehaviorSubject<ConnectionState>({
    isDrawingConnection: false,
    connectionStart: null,
    temporaryConnection: null
  });

  public connections$ = this.connectionsSubject.asObservable();
  public connectionState$ = this.connectionStateSubject.asObservable();

  constructor() {}

  // Get current connections
  getConnections(): Connection[] {
    return this.connectionsSubject.value;
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionStateSubject.value;
  }

  // Add a new connection
  addConnection(connection: Connection): void {
    const currentConnections = this.connectionsSubject.value;
    const existingConnection = currentConnections.find(conn =>
      conn.fromBlockId === connection.fromBlockId && conn.toBlockId === connection.toBlockId
    );

    if (!existingConnection) {
      this.connectionsSubject.next([...currentConnections, connection]);
    } else {
      throw new Error('Connection already exists between these blocks.');
    }
  }

  // Remove a connection
  removeConnection(connectionId: string): void {
    const currentConnections = this.connectionsSubject.value;
    const filteredConnections = currentConnections.filter(conn => conn.id !== connectionId);
    this.connectionsSubject.next(filteredConnections);
  }

  // Remove connections related to a block
  removeBlockConnections(blockId: string): void {
    const currentConnections = this.connectionsSubject.value;
    const filteredConnections = currentConnections.filter(conn => 
      conn.fromBlockId !== blockId && conn.toBlockId !== blockId
    );
    this.connectionsSubject.next(filteredConnections);
  }

  // Update connection points
  updateConnectionPoints(connectionId: string, fromPoint: { x: number; y: number }, toPoint: { x: number; y: number }): void {
    const currentConnections = this.connectionsSubject.value;
    const updatedConnections = currentConnections.map(conn => {
      if (conn.id === connectionId) {
        return { ...conn, fromPoint, toPoint };
      }
      return conn;
    });
    this.connectionsSubject.next(updatedConnections);
  }

  // Start connection drawing
  startConnection(blockId: string, x: number, y: number): void {
    this.connectionStateSubject.next({
      isDrawingConnection: true,
      connectionStart: { blockId, x, y },
      temporaryConnection: null
    });
  }

  // Update temporary connection
  updateTemporaryConnection(x1: number, y1: number, x2: number, y2: number): void {
    const currentState = this.connectionStateSubject.value;
    this.connectionStateSubject.next({
      ...currentState,
      temporaryConnection: { x1, y1, x2, y2 }
    });
  }

  // End connection drawing
  endConnection(): void {
    this.connectionStateSubject.next({
      isDrawingConnection: false,
      connectionStart: null,
      temporaryConnection: null
    });
  }

  // Calculate connection point coordinates
  calculateConnectionPoint(element: HTMLElement, canvasElement: HTMLElement, zoomLevel: number = 1): { x: number; y: number } {
    const elementRect = element.getBoundingClientRect();
    const canvasRect = canvasElement.getBoundingClientRect();
    
    return {
      x: (elementRect.left + elementRect.width / 2 - canvasRect.left) / zoomLevel,
      y: (elementRect.top + elementRect.height / 2 - canvasRect.top) / zoomLevel
    };
  }

  // Check if connection is valid
  isValidConnection(fromBlockId: string, toBlockId: string): boolean {
    if (fromBlockId === toBlockId) {
      return false; // Can't connect to itself
    }

    const currentConnections = this.connectionsSubject.value;
    const existingConnection = currentConnections.find(conn =>
      conn.fromBlockId === fromBlockId && conn.toBlockId === toBlockId
    );

    return !existingConnection;
  }

  // Get connections for a specific block
  getBlockConnections(blockId: string): { incoming: Connection[], outgoing: Connection[] } {
    const currentConnections = this.connectionsSubject.value;
    return {
      incoming: currentConnections.filter(conn => conn.toBlockId === blockId),
      outgoing: currentConnections.filter(conn => conn.fromBlockId === blockId)
    };
  }
} 