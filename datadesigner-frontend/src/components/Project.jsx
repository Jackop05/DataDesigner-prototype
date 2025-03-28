import React, { useState, useRef, useEffect } from 'react';
import { FiDatabase, FiTable, FiColumns, FiKey, FiPlus, FiMinus, FiMove, FiLink2 } from 'react-icons/fi';
import { FaArrowRight } from 'react-icons/fa';

const Project = () => {
  // Database elements state
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [gridSize, setGridSize] = useState(20); // Size of grid dots
  const boardRef = useRef(null);
  const [boardPosition, setBoardPosition] = useState({ x: 0, y: 0 });

  // Sample database element types
  const elementTypes = [
    { type: 'table', icon: <FiTable />, color: 'bg-blue-100', textColor: 'text-blue-800' },
    { type: 'view', icon: <FiDatabase />, color: 'bg-green-100', textColor: 'text-green-800' },
    { type: 'enum', icon: <FiColumns />, color: 'bg-purple-100', textColor: 'text-purple-800' },
  ];

  // Add new element to the board
  const addElement = (type) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      name: `New ${type}`,
      x: 100,
      y: 100,
      width: 200,
      height: 120,
      fields: type === 'table' ? [
        { name: 'id', type: 'integer', isPrimary: true },
        { name: 'created_at', type: 'timestamp' }
      ] : []
    };
    setElements([...elements, newElement]);
  };

  // Handle element movement
  const handleElementMove = (id, e) => {
    if (e.buttons !== 1) return; // Only on left mouse click
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = element.x;
    const startPosY = element.y;
    
    const moveHandler = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      // Snap to grid
      const newX = Math.round((startPosX + dx) / gridSize) * gridSize;
      const newY = Math.round((startPosY + dy) / gridSize) * gridSize;
      
      setElements(elements.map(el => 
        el.id === id ? { ...el, x: newX, y: newY } : el
      ));
    };
    
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };

  // Start creating a connection
  const startConnection = (elementId, isOutput) => {
    setIsConnecting(true);
    setConnectionStart({ elementId, isOutput });
  };

  // Complete connection
  const completeConnection = (elementId) => {
    if (isConnecting && connectionStart) {
      const isOutput = !connectionStart.isOutput;
      if (connectionStart.elementId !== elementId) {
        setConnections([
          ...connections,
          {
            id: `conn-${Date.now()}`,
            from: connectionStart.isOutput ? connectionStart.elementId : elementId,
            to: connectionStart.isOutput ? elementId : connectionStart.elementId
          }
        ]);
      }
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  // Handle board movement
  const handleBoardMove = (e) => {
    if (e.buttons !== 2) return; // Only on right mouse click
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = boardPosition.x;
    const startPosY = boardPosition.y;
    
    const moveHandler = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      setBoardPosition({
        x: startPosX + dx,
        y: startPosY + dy
      });
    };
    
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };

  // Render the grid dots
  const renderGrid = () => {
    const cols = Math.ceil(window.innerWidth / gridSize) + 10;
    const rows = Math.ceil(window.innerHeight / gridSize) + 10;
    
    return Array.from({ length: rows }).map((_, row) => (
      Array.from({ length: cols }).map((_, col) => (
        <div 
          key={`dot-${row}-${col}`}
          className="absolute w-1 h-1 rounded-full bg-gray-300"
          style={{
            left: col * gridSize - boardPosition.x,
            top: row * gridSize - boardPosition.y
          }}
        />
      ))
    ));
  };

  // Render connections between elements
  const renderConnections = () => {
    return connections.map(conn => {
      const fromEl = elements.find(el => el.id === conn.from);
      const toEl = elements.find(el => el.id === conn.to);
      
      if (!fromEl || !toEl) return null;
      
      const fromX = fromEl.x + fromEl.width;
      const fromY = fromEl.y + fromEl.height / 2;
      const toX = toEl.x;
      const toY = toEl.y + toEl.height / 2;
      
      return (
        <svg 
          key={conn.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          <path
            d={`M${fromX},${fromY} C${fromX + 50},${fromY} ${toX - 50},${toY} ${toX},${toY}`}
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      );
    });
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md p-2 flex flex-col space-y-2">
        {elementTypes.map((item) => (
          <button
            key={item.type}
            onClick={() => addElement(item.type)}
            className={`p-2 rounded-md hover:bg-gray-100 ${item.color} ${item.textColor}`}
            title={`Add ${item.type}`}
          >
            {item.icon}
          </button>
        ))}
        <div className="border-t border-gray-200 my-1"></div>
        <button 
          onClick={() => setZoom(zoom + 10)} 
          className="p-2 rounded-md hover:bg-gray-100"
          disabled={zoom >= 200}
        >
          <FiPlus />
        </button>
        <button 
          onClick={() => setZoom(zoom - 10)} 
          className="p-2 rounded-md hover:bg-gray-100"
          disabled={zoom <= 50}
        >
          <FiMinus />
        </button>
        <div className="text-xs text-center">{zoom}%</div>
      </div>

      {/* Board */}
      <div 
        ref={boardRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleBoardMove}
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Grid dots */}
        <div className="absolute inset-0">
          {renderGrid()}
        </div>

        {/* Connections */}
        {renderConnections()}

        {/* Arrowhead marker definition */}
        <svg className="absolute w-0 h-0">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
        </svg>

        {/* Database elements */}
        {elements.map((element) => {
          const elementType = elementTypes.find(t => t.type === element.type);
          return (
            <div
              key={element.id}
              className={`absolute rounded-lg border-2 shadow-md ${elementType.color} ${selectedElement === element.id ? 'border-purple-500' : 'border-gray-300'}`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
              }}
              onClick={() => setSelectedElement(element.id)}
              onMouseDown={(e) => handleElementMove(element.id, e)}
            >
              {/* Element header */}
              <div className={`flex items-center p-2 border-b ${elementType.textColor} font-medium`}>
                {elementType.icon}
                <span className="ml-2">{element.name}</span>
                <div className="ml-auto flex space-x-1">
                  <button 
                    className="p-1 rounded hover:bg-white hover:bg-opacity-30"
                    onMouseDown={(e) => { e.stopPropagation(); startConnection(element.id, true); }}
                    title="Create connection from this element"
                  >
                    <FiLink2 size={14} />
                  </button>
                  <button 
                    className="p-1 rounded hover:bg-white hover:bg-opacity-30"
                    onMouseDown={(e) => { e.stopPropagation(); startConnection(element.id, false); }}
                    title="Create connection to this element"
                  >
                    <FaArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Element fields */}
              <div className="p-2 overflow-auto" style={{ height: `calc(100% - 36px)` }}>
                {element.fields?.map((field, i) => (
                  <div key={i} className="flex items-center py-1 px-2 text-sm hover:bg-white hover:bg-opacity-30 rounded">
                    {field.isPrimary && <FiKey className="mr-2 text-yellow-600" size={12} />}
                    <span className="font-mono">{field.name}</span>
                    <span className="ml-auto text-gray-500 text-xs">{field.type}</span>
                  </div>
                ))}
                {element.fields?.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No fields defined
                  </div>
                )}
              </div>

              {/* Connection points */}
              {isConnecting && connectionStart?.elementId !== element.id && (
                <div 
                  className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none"
                  onClick={() => completeConnection(element.id)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 text-sm text-gray-600 flex justify-between">
        <div>
          {elements.length} elements | {connections.length} connections
        </div>
        <div>
          Grid: {gridSize}px | Zoom: {zoom}%
        </div>
      </div>
    </div>
  );
};

export default Project;