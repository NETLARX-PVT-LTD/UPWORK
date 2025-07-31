# Distributed Connection System

This document explains how the connection logic has been distributed across components to improve maintainability and reduce coupling.

## Overview

The connection system has been refactored from a centralized approach in `ChatbotFlowComponent` to a distributed approach where each block component handles its own connection logic through a shared service.

## Architecture

### 1. ConnectionService (`src/app/shared/services/connection.service.ts`)

The central service that manages all connection state and operations:

- **State Management**: Manages connections and connection drawing state using RxJS BehaviorSubjects
- **Connection Operations**: Add, remove, update connections
- **Validation**: Checks for valid connections and prevents duplicates
- **Coordinate Calculation**: Calculates connection point coordinates

### 2. BaseConnectionComponent (`src/app/shared/components/base-connection.component.ts`)

An abstract base class that provides common connection functionality:

- **Connection Event Handling**: `onStartConnection()`, `onEndConnection()`
- **Visual Feedback**: `onConnectionInputEnter()`, `onConnectionInputLeave()`
- **Connection Updates**: `updateConnectionPoints()` for when blocks move
- **Common Actions**: Block selection, removal, duplication, editing

### 3. Block Components

Individual block components extend `BaseConnectionComponent` to inherit connection functionality:

- **UserInputBlockComponent**: Already updated to use the base class
- **TextResponseBlockComponent**: Already updated to use the base class
- **Other Block Components**: Can be updated similarly

## Benefits

### 1. **Reduced Coupling**
- Block components no longer depend on the main flow component for connection logic
- Each component is self-contained for connection handling

### 2. **Improved Maintainability**
- Connection logic is centralized in the service
- Common functionality is shared through the base class
- Changes to connection behavior only need to be made in one place

### 3. **Better Separation of Concerns**
- Main flow component focuses on canvas management and block coordination
- Block components handle their own connection interactions
- Service manages connection state and validation

### 4. **Easier Testing**
- Connection logic can be tested independently
- Mock services can be easily injected for testing

## Usage

### For New Block Components

1. **Extend BaseConnectionComponent**:
```typescript
export class NewBlockComponent extends BaseConnectionComponent implements OnInit {
  constructor(@Inject(ConnectionService) connectionService: ConnectionService) {
    super(connectionService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Your initialization logic
  }

  override onContentChange(): void {
    this.blockUpdated.emit(this.block);
  }
}
```

2. **Update HTML Template**:
```html
<!-- Output connection point -->
<div 
  class="connection-point connection-output"
  (mousedown)="onStartConnection($event)"
>
  <div class="connection-dot"></div>
</div>

<!-- Input connection point -->
<div 
  class="connection-point connection-input"
  (mousedown)="onEndConnection($event)"
  (mouseenter)="onConnectionInputEnter($event)"
  (mouseleave)="onConnectionInputLeave($event)"
>
  <div class="connection-dot"></div>
</div>
```

### For the Main Flow Component

The main component now only needs to:
- Subscribe to connections from the service
- Pass the zoom level to block components
- Handle block removal through the service

```typescript
ngOnInit(): void {
  // Subscribe to connections from the service
  this.connectionService.connections$.subscribe(connections => {
    this.connections = connections;
  });
}

removeCanvasBlock(blockId: string) {
  // Remove connections using the service
  this.connectionService.removeBlockConnections(blockId);
  // ... other removal logic
}
```

## Migration Guide

### Updating Existing Block Components

1. **Import the base class and service**:
```typescript
import { BaseConnectionComponent } from '../../../shared/components/base-connection.component';
import { ConnectionService } from '../../../shared/services/connection.service';
```

2. **Extend BaseConnectionComponent**:
```typescript
export class YourBlockComponent extends BaseConnectionComponent implements OnInit {
```

3. **Add constructor with service injection**:
```typescript
constructor(@Inject(ConnectionService) connectionService: ConnectionService) {
  super(connectionService);
}
```

4. **Override ngOnInit**:
```typescript
override ngOnInit(): void {
  super.ngOnInit();
  // Your existing initialization logic
}
```

5. **Override onContentChange**:
```typescript
override onContentChange(): void {
  this.blockUpdated.emit(this.block);
}
```

6. **Remove duplicate methods** that are already in the base class:
   - `onBlockClick()`
   - `onStartConnection()`
   - `onEndConnection()`
   - `onRemoveBlock()`
   - `onDuplicateBlock()`
   - `onEditBlock()`
   - `closeSidebar()`

7. **Update HTML template** to use the new connection event handlers.

## Future Enhancements

- **Connection Types**: Support for different types of connections (conditional, data flow, etc.)
- **Connection Validation**: More sophisticated validation rules
- **Visual Enhancements**: Better visual feedback during connection creation
- **Undo/Redo**: Connection history management
- **Connection Groups**: Support for grouped connections 