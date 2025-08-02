# Builder Utilities

This directory contains utility functions and classes for the PineGenie Strategy Builder, including coordinate system transformations and enhanced connection state management for the visual drag-and-drop interface.

## Coordinate System Utilities

The coordinate system utilities provide precise transformations between screen and canvas coordinate spaces, handling zoom levels, canvas offsets, and node handle positioning with mathematical precision.

### Key Features

- **Screen ↔ Canvas Coordinate Transformations**: Convert between screen coordinates (mouse events) and canvas coordinates (node positions)
- **Zoom and Offset Handling**: Accurate calculations across all zoom levels (0.1x to 3.0x) and canvas offsets
- **Node Handle Positioning**: Calculate exact positions of connection handles in screen coordinates
- **Connection Path Generation**: Create smooth bezier curves for connection lines
- **Validation and Error Handling**: Robust input validation with meaningful error messages
- **Performance Optimized**: Efficient calculations suitable for real-time interactions

### Core Functions

#### Coordinate Transformations

```typescript
// Convert screen coordinates to canvas coordinates
const canvasPoint = screenToCanvas(screenPoint, canvasState);

// Convert canvas coordinates to screen coordinates  
const screenPoint = canvasToScreen(canvasPoint, canvasState);
```

#### Handle Position Calculations

```typescript
// Get handle position in screen coordinates
const handleScreenPos = getHandleScreenPosition(
  nodePosition, 
  'input' | 'output', 
  canvasState,
  nodeDimensions?
);

// Get handle position in canvas coordinates
const handleCanvasPos = getHandleCanvasPosition(
  nodePosition,
  'input' | 'output', 
  nodeDimensions?
);
```

#### Connection Path Generation

```typescript
// Generate SVG path for connection line
const svgPath = calculateConnectionPath(startPoint, endPoint);
```

#### Utility Functions

```typescript
// Distance calculation
const distance = calculateDistance(point1, point2);

// Point-in-circle detection (for handle interactions)
const isInside = isPointInCircle(point, center, radius);

// Point-in-rectangle detection
const isInside = isPointInRect(point, rect);

// Value clamping
const clampedValue = clamp(value, min, max);
const clampedZoom = clampZoom(zoom);
```

### Types

```typescript
interface Point {
  x: number;
  y: number;
}

interface CanvasState {
  zoom: number;
  offset: Point;
}

interface NodeDimensions {
  width: number;
  height: number;
}
```

### Constants

```typescript
// Default node dimensions
DEFAULT_NODE_DIMENSIONS = { width: 240, height: 120 }

// Handle positioning
HANDLE_OFFSET = 12  // Distance from node edge
HANDLE_SIZE = 24    // Handle diameter for interactions
```

### Validation and Safety

All functions include comprehensive input validation:

- **Point Validation**: Checks for valid numeric coordinates (no NaN, Infinity)
- **Canvas State Validation**: Ensures positive zoom and valid offset
- **Error Handling**: Throws descriptive errors for invalid inputs
- **Safe Constructors**: `createPoint()` and `createCanvasState()` with fallbacks

### Testing

The coordinate system includes comprehensive test coverage:

- **Unit Tests**: 44 tests covering all functions and edge cases
- **Integration Tests**: 9 tests verifying real-world usage scenarios
- **Performance Tests**: Validates efficiency with 1000+ calculations
- **Precision Tests**: Ensures accuracy across multiple transformations

Run tests with:
```bash
npm test -- src/app/builder/utils/__tests__/
```

### Usage Examples

#### Basic Coordinate Transformation

```typescript
import { screenToCanvas, canvasToScreen } from './coordinate-system';

const canvasState = { zoom: 1.5, offset: { x: 100, y: 50 } };
const mousePosition = { x: 400, y: 300 };

// Convert mouse position to canvas coordinates for node positioning
const nodePosition = screenToCanvas(mousePosition, canvasState);

// Convert node position back to screen coordinates for rendering
const renderPosition = canvasToScreen(nodePosition, canvasState);
```

#### Handle Position Calculation

```typescript
import { getHandleScreenPosition } from './coordinate-system';

const nodePosition = { x: 200, y: 150 };
const canvasState = { zoom: 2.0, offset: { x: 50, y: 25 } };

// Get input handle position for mouse interaction
const inputHandle = getHandleScreenPosition(nodePosition, 'input', canvasState);

// Get output handle position for connection start
const outputHandle = getHandleScreenPosition(nodePosition, 'output', canvasState);
```

#### Connection Line Creation

```typescript
import { getHandleScreenPosition, calculateConnectionPath } from './coordinate-system';

const sourceNode = { x: 100, y: 100 };
const targetNode = { x: 400, y: 200 };
const canvasState = { zoom: 1.2, offset: { x: 0, y: 0 } };

// Get handle positions
const startHandle = getHandleScreenPosition(sourceNode, 'output', canvasState);
const endHandle = getHandleScreenPosition(targetNode, 'input', canvasState);

// Create SVG path for connection line
const connectionPath = calculateConnectionPath(startHandle, endHandle);

// Use in SVG element
<path d={connectionPath} stroke="#60a5fa" strokeWidth="2" fill="none" />
```

### Integration with Canvas Components

The coordinate system utilities are designed to integrate seamlessly with the existing Canvas and Node components:

1. **Canvas.tsx**: Use for mouse event coordinate conversion and connection line rendering
2. **N8nNode.tsx**: Use for handle position calculations and drag operations
3. **ConnectionLine.tsx**: Use for accurate path generation and real-time updates

### Performance Considerations

- **Coordinate Caching**: Consider caching calculated positions for frequently accessed nodes
- **Batch Calculations**: Process multiple coordinate transformations together when possible
- **Precision vs Performance**: Functions prioritize precision but are optimized for real-time use

### Debug Utilities

The `CoordinateDebug` object provides debugging tools:

```typescript
import { CoordinateDebug } from './coordinate-system';

// Validate round-trip accuracy
const isAccurate = CoordinateDebug.validateRoundTrip(screenPoint, canvasState);

// Log transformation details
CoordinateDebug.logTransformation(screenPoint, canvasPoint, canvasState, 'screenToCanvas');
```

### Requirements Addressed

This implementation addresses the following requirements from the strategy builder connection fix specification:

- **5.1**: Account for current zoom level and canvas offset in node position calculations
- **5.2**: Use accurate screen coordinates for mouse interactions with connection handles
- **5.3**: Maintain precision across all zoom levels in coordinate conversions
- **5.4**: Use consistent coordinate calculations for connection line start and end points
- **5.5**: Ensure all coordinate-dependent elements update synchronously when canvas state changes

## Enhanced Connection Management

The connection manager provides centralized state management for node connections with advanced validation, circular dependency detection, and coordinate system integration.

### Key Features

- **Centralized State Management**: Single source of truth for all connections
- **Circular Dependency Detection**: Prevents invalid connection cycles using graph traversal algorithms
- **Duplicate Prevention**: Automatically prevents duplicate connections between nodes
- **Real-time Validation**: Validates connections during the creation workflow
- **Coordinate Integration**: Seamlessly integrates with coordinate system utilities
- **Performance Optimized**: Efficient state updates with intelligent caching

### Connection Manager API

```typescript
import { getConnectionManager, ConnectionManager } from './connection-manager';

// Get singleton instance
const connectionManager = getConnectionManager();

// Start creating a connection
connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });

// Update connection position during mouse movement
connectionManager.updateConnectionPosition({ x: 200, y: 150 });

// Complete connection
const success = connectionManager.completeConnection('node2', 'input');

// Delete connection
connectionManager.deleteConnection('connection-id');

// Get all connections
const connections = connectionManager.getConnections();

// Get connection statistics
const stats = connectionManager.getConnectionStats();
```

### Connection Validation

The system provides comprehensive validation including:

- **Self-connection Prevention**: Nodes cannot connect to themselves
- **Direction Validation**: Ensures proper output-to-input connections
- **Duplicate Detection**: Prevents multiple connections between same nodes
- **Circular Dependency Detection**: Uses depth-first search to detect cycles
- **Node Existence Validation**: Ensures both source and target nodes exist
- **Type Compatibility Warnings**: Provides warnings for potentially incompatible node types

### State Management Integration

```typescript
// Subscribe to connection state changes
const unsubscribe = connectionManager.subscribe((state) => {
  setConnections(state.connections);
  setActiveConnection(state.activeConnection);
});

// Update canvas state
connectionManager.updateCanvasState({ zoom, offset: canvasOffset });

// Update nodes
connectionManager.updateNodes(connectionNodes);

// Handle node movement
connectionManager.updateConnectionsForNodeMove(nodeId, newPosition);
```

### Connection Types

```typescript
interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle: 'output';
  targetHandle: 'input';
  created: Date;
  isValid: boolean;
  metadata?: Record<string, unknown>;
}

interface ConnectionNode {
  id: string;
  type: string;
  position: Point;
  data?: {
    label?: string;
    [key: string]: unknown;
  };
}
```

### Testing

The connection management system includes comprehensive test coverage:

- **Unit Tests**: 26 tests covering all connection manager functionality
- **Integration Tests**: 13 tests verifying coordinate system integration
- **Validation Tests**: Comprehensive testing of circular dependency detection
- **Performance Tests**: Validates efficiency with complex connection scenarios

Run connection tests with:
```bash
npm test -- src/app/builder/utils/__tests__/connection-manager.test.ts --run
npm test -- src/app/builder/utils/__tests__/connection-integration.test.ts --run
```

### Requirements Addressed

The enhanced connection system addresses the following requirements:

- **1.3**: Permanent connection creation between nodes with proper validation
- **1.4**: Connection cancellation and error handling with state cleanup
- **6.1**: Prevention of self-connections with clear visual feedback
- **6.2**: Duplicate connection prevention with validation messages
- **6.3**: Circular dependency detection using graph traversal algorithms

### Future Enhancements

Potential improvements for future versions:

#### Coordinate System
- **Coordinate Caching**: Implement intelligent caching for performance optimization
- **Animation Support**: Add utilities for smooth coordinate transitions
- **Touch Support**: Extend for mobile touch interactions
- **Coordinate Snapping**: Add grid snapping and alignment utilities
- **Viewport Culling**: Add utilities for efficient rendering of off-screen elements

#### Connection Management
- **Connection Styling**: Advanced visual customization options
- **Connection Types**: Support for different connection types (data, control, etc.)
- **Batch Operations**: Bulk connection creation/deletion
- **Undo/Redo Integration**: Integration with history system
- **Persistence**: Database storage and retrieval
- **Performance Monitoring**: Real-time performance metrics