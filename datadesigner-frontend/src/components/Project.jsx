import React, { useState, useRef, useEffect } from 'react';
import { FiTable, FiPlus, FiMinus, FiTrash2, FiX, FiHome, FiMenu, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Database elements state
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [gridSize] = useState(20); // Fixed grid size
  const [editingFields, setEditingFields] = useState({});
  const [newFieldNames, setNewFieldNames] = useState({});
  const [newFieldTypes, setNewFieldTypes] = useState({});
  const boardRef = useRef(null);
  const [boardPosition, setBoardPosition] = useState({ x: 0, y: 0 });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState(null);

  // Element and field configuration
  const elementTypes = [
    { type: 'table', icon: <FiTable />, color: 'bg-blue-100', textColor: 'text-blue-800' },
  ];

  const fieldTypes = ['integer', 'text', 'varchar', 'boolean', 'timestamp', 'date', 'float', 'json'];
  const relationshipTypes = ['one-to-one', 'one-to-many', 'many-to-many'];

  // Check if mobile device
  const isMobile = () => window.innerWidth < 768;

  // Transform API data to internal format
  const transformApiData = (apiData) => {
    if (!apiData || !apiData.project) return { elements: [], connections: [] };
    
    const transformedElements = apiData.project.elements.map(element => ({
      id: element.id,
      type: 'table',
      name: element.name,
      x: element.x || 100 + Math.random() * 200,
      y: element.y || 100 + Math.random() * 200,
      width: element.width || 200,
      height: element.height || 120,
      fields: element.fields || []
    }));

    const transformedConnections = apiData.project.connections || [];

    return {
      elements: transformedElements,
      connections: transformedConnections
    };
  };

  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/get-project-data/${projectId}`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "true"
          }
        });
        
        const transformedData = transformApiData(response.data);
        setElements(transformedData.elements);
        setConnections(transformedData.connections);
        
        const initialFieldStates = {};
        transformedData.elements.forEach(el => {
          initialFieldStates[el.id] = {};
          el.fields?.forEach(field => {
            initialFieldStates[el.id][field.id] = false;
          });
        });
        setEditingFields(initialFieldStates);
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, navigate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isMobile()) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate required width based on content
  const calculateRequiredWidth = (fields) => {
    const minWidth = isMobile() ? 150 : 200;
    const fieldNameWidths = fields.map(f => f.name.length * (isMobile() ? 6 : 8));
    const fieldTypeWidths = fields.map(f => f.type.length * (isMobile() ? 6 : 8));
    return Math.max(minWidth, Math.max(...fieldNameWidths) + Math.max(...fieldTypeWidths) + (isMobile() ? 60 : 100));
  };

  // Add new table to the board
  const addTable = () => {
    const baseHeight = 120;
    const fieldHeight = isMobile() ? 25 : 30;
    const initialFields = [
      { id: `field-${Date.now()}`, name: 'id', type: 'integer' },
      { id: `field-${Date.now() + 1}`, name: 'created_at', type: 'timestamp' }
    ];

    const newElement = {
      id: `element-${Date.now()}`,
      type: 'table',
      name: `New Table`,
      x: 100,
      y: 100,
      width: calculateRequiredWidth(initialFields),
      height: baseHeight + (initialFields.length * fieldHeight),
      fields: initialFields
    };
    
    setElements([...elements, newElement]);
    setEditingFields({
      ...editingFields,
      [newElement.id]: {}
    });
    setShowMobileMenu(false);
  };

  // Save project manually
  const saveProject = async () => {
    if (!projectId) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const apiData = {
        elements: elements.map(element => ({
          id: element.id,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          type: element.type,
          name: element.name,
          fields: element.fields.map(field => ({
            id: field.id,
            name: field.name,
            type: field.type
          })),
          connections: connections
            .filter(conn => conn.from === element.id)
            .map(conn => ({ id: conn.id }))
        })),
        connections: connections.map(connection => ({
          id: connection.id,
          from: connection.from,
          to: connection.to,
          type: connection.type,
          fromField: connection.fromField,
          toField: connection.toField
        }))
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/element/${projectId}/post-project-data`, apiData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": "true"
        }
      });
      setShowMobileMenu(false);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setSaving(false);
    }
  };

  // Update table name
  const updateElementName = (id, newName) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, name: newName } : el
    ));
  };

  // Add new field to table
  const addField = (elementId) => {
    const fieldName = newFieldNames[elementId] || 'new_field';
    const fieldType = newFieldTypes[elementId] || 'text';
    
    setElements(elements.map(el => {
      if (el.id === elementId) {
        const newFields = [...el.fields, { 
          id: `field-${Date.now()}`, 
          name: fieldName,
          type: fieldType
        }];
        
        return {
          ...el, 
          fields: newFields,
          height: 120 + (newFields.length * (isMobile() ? 25 : 30)),
          width: calculateRequiredWidth(newFields)
        };
      }
      return el;
    }));
    
    setNewFieldNames({
      ...newFieldNames,
      [elementId]: ''
    });
    setNewFieldTypes({
      ...newFieldTypes,
      [elementId]: 'text'
    });
  };

  // Delete a field from table
  const deleteField = (elementId, fieldId) => {
    setElements(elements.map(el => {
      if (el.id === elementId) {
        const newFields = el.fields.filter(f => f.id !== fieldId);
        return {
          ...el, 
          fields: newFields,
          height: Math.max(120, 120 + (newFields.length * (isMobile() ? 25 : 30))),
          width: calculateRequiredWidth(newFields)
        };
      }
      return el;
    }));
    
    setEditingFields({
      ...editingFields,
      [elementId]: {
        ...editingFields[elementId],
        [fieldId]: false
      }
    });
  };

  // Update field properties
  const updateField = (elementId, fieldId, updates) => {
    setElements(elements.map(el => {
      if (el.id === elementId) {
        const newFields = el.fields.map(f => 
          f.id === fieldId ? { ...f, ...updates } : f
        );
        
        return {
          ...el,
          fields: newFields,
          width: calculateRequiredWidth(newFields)
        };
      }
      return el;
    }));
  };

  // Toggle field editing mode
  const toggleFieldEditing = (elementId, fieldId) => {
    setEditingFields({
      ...editingFields,
      [elementId]: {
        ...editingFields[elementId],
        [fieldId]: !editingFields[elementId]?.[fieldId]
      }
    });
  };

  // Handle table movement
  const handleElementMove = (id, e) => {
    if (e.buttons !== 1 && !e.touches) return;
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const startX = e.clientX || e.touches[0].clientX;
    const startY = e.clientY || e.touches[0].clientY;
    const startPosX = element.x;
    const startPosY = element.y;
    
    const moveHandler = (moveEvent) => {
      const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      
      if (currentX === undefined || currentY === undefined) return;
      
      const dx = currentX - startX;
      const dy = currentY - startY;
      
      const newX = Math.round((startPosX + dx) / gridSize) * gridSize;
      const newY = Math.round((startPosY + dy) / gridSize) * gridSize;
      
      setElements(elements.map(el => 
        el.id === id ? { ...el, x: newX, y: newY } : el
      ));
    };
    
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.removeEventListener('touchend', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchend', upHandler);
  };

  // Connection management
  const startConnection = (elementId, fieldId = null) => {
    setIsConnecting(true);
    setConnectionStart({ elementId, fieldId });
  };

  const completeConnection = (elementId, fieldId = null) => {
    if (isConnecting && connectionStart) {
      if (connectionStart.elementId !== elementId) {
        const fromField = connectionStart.fieldId 
          ? elements.find(el => el.id === connectionStart.elementId)?.fields?.find(f => f.id === connectionStart.fieldId)
          : null;
        
        const toField = fieldId 
          ? elements.find(el => el.id === elementId)?.fields?.find(f => f.id === fieldId)
          : null;

        setConnections([
          ...connections,
          {
            id: `conn-${Date.now()}`,
            from: connectionStart.elementId,
            to: elementId,
            fromField: connectionStart.fieldId,
            toField: fieldId,
            type: 'one-to-many',
            fromFieldName: fromField?.name,
            toFieldName: toField?.name
          }
        ]);
      }
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const updateConnection = (connectionId, updates) => {
    setConnections(connections.map(conn => 
      conn.id === connectionId ? { ...conn, ...updates } : conn
    ));
  };

  const deleteConnection = (connectionId) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
  };

  const deleteSelectedElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement));
      setConnections(connections.filter(conn => 
        conn.from !== selectedElement && conn.to !== selectedElement
      ));
      setSelectedElement(null);
      setShowMobileMenu(false);
    }
  };

  // Handle board movement
  const handleBoardMove = (e) => {
  if ((e.buttons !== 2 && !isDraggingBoard) || (e.touches && e.touches.length !== 1)) return;
  
  const startX = e.clientX || e.touches[0].clientX;
  const startY = e.clientY || e.touches[0].clientY;
  const startPosX = boardPosition.x;
  const startPosY = boardPosition.y;
  
  const moveHandler = (moveEvent) => {
    const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
    const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
    
    if (currentX === undefined || currentY === undefined) return;
    
    const dx = currentX - startX;
    const dy = currentY - startY;
    
    setBoardPosition({
      x: startPosX + dx,
      y: startPosY + dy
    });
  };
  
    
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.removeEventListener('touchend', upHandler);
      setIsDraggingBoard(false);
    };
    
    setIsDraggingBoard(true);
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchend', upHandler);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setTouchStartPos({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartPos) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    // Check if it was a tap (not a drag)
    const distance = Math.sqrt(
      Math.pow(endX - touchStartPos.x, 2) + 
      Math.pow(endY - touchStartPos.y, 2)
    );
    
    if (distance < 5) {
      // It's a tap, handle selection
      const element = document.elementFromPoint(endX, endY)?.closest('.draggable-element');
      if (element) {
        const elementId = element.getAttribute('data-id');
        setSelectedElement(elementId);
      } else {
        setSelectedElement(null);
      }
    }
    
    setTouchStartPos(null);
  };

  // Render the grid dots
  const renderGrid = () => {
  const viewportWidth = window.innerWidth * (100 / zoom);
  const viewportHeight = window.innerHeight * (100 / zoom);
  
  // Calculate visible grid area
  const startX = Math.floor(-boardPosition.x / gridSize) * gridSize;
  const startY = Math.floor(-boardPosition.y / gridSize) * gridSize;
  
  const cols = Math.ceil(viewportWidth / gridSize) + 2;
  const rows = Math.ceil(viewportHeight / gridSize) + 2;
  
  return Array.from({ length: rows }).map((_, row) => (
    Array.from({ length: cols }).map((_, col) => (
      <div 
        key={`dot-${row}-${col}`}
        className="absolute w-1 h-1 rounded-full bg-gray-300"
        style={{
          left: startX + col * gridSize,
          top: startY + row * gridSize,
        }}
      />
    ))));
  };

  // Calculate connection path points
  const calculateConnectionPath = (fromEl, toEl, fromFieldId = null, toFieldId = null) => {
    if (fromFieldId && toFieldId) {
      const fromFieldIndex = fromEl.fields.findIndex(f => f.id === fromFieldId);
      const toFieldIndex = toEl.fields.findIndex(f => f.id === toFieldId);
      
      const fromX = fromEl.x + fromEl.width;
      const fromY = fromEl.y + 60 + (fromFieldIndex * (isMobile() ? 25 : 30));
      const toX = toEl.x;
      const toY = toEl.y + 60 + (toFieldIndex * (isMobile() ? 25 : 30));
      
      return { fromX, fromY, toX, toY };
    }
    
    const fromX = fromEl.x + fromEl.width;
    const fromY = fromEl.y + fromEl.height / 2;
    const toX = toEl.x;
    const toY = toEl.y + toEl.height / 2;
    
    return { fromX, fromY, toX, toY };
  };

  // Render connections between tables
  const renderConnections = () => {
    return connections.map(conn => {
      const fromEl = elements.find(el => el.id === conn.from);
      const toEl = elements.find(el => el.id === conn.to);
      
      if (!fromEl || !toEl) return null;
      
      const { fromX, fromY, toX, toY } = calculateConnectionPath(
        fromEl, 
        toEl, 
        conn.fromField, 
        conn.toField
      );
      
      const controlX1 = fromX + Math.max(50, (toX - fromX) / 2);
      const controlX2 = toX - Math.max(50, (toX - fromX) / 2);
      
      return (
        <svg 
          key={conn.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          <path
            d={`M${fromX},${fromY} C${controlX1},${fromY} ${controlX2},${toY} ${toX},${toY}`}
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          
          <foreignObject 
            x={(fromX + toX) / 2 - 50} 
            y={(fromY + toY) / 2 - 15} 
            width="100" 
            height="30"
            className="pointer-events-auto"
          >
            <div className="flex flex-col items-center">
              <select
                value={conn.type}
                onChange={(e) => updateConnection(conn.id, { type: e.target.value })}
                className="text-xs bg-white border border-gray-300 rounded p-1 mb-1"
              >
                {relationshipTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button 
                onClick={() => deleteConnection(conn.id)}
                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </foreignObject>
        </svg>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[90vh] bg-gray-50 overflow-hidden flex flex-row justify-center">
      {/* Mobile menu button */}
      <button 
        className="md:hidden absolute top-4 left-4 z-20 bg-white rounded-lg shadow-md p-2"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <FiMenu />
      </button>

      {/* Toolbar - Desktop */}
      <div className={`hidden md:flex absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md p-2 flex-col space-y-2`}>
        <Link 
          to="/"
          onClick={saveProject}
          className="p-2 rounded-md hover:bg-gray-100 text-red-500"
          title="Link to home page"
        >
          <FiHome />
        </Link>
        <button
          onClick={addTable}
          className="p-2 rounded-md hover:bg-gray-100 bg-blue-100 text-blue-800"
          title="Add table"
        >
          <FiTable />
        </button>
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
        {selectedElement && (
          <button 
            onClick={deleteSelectedElement}
            className="p-2 rounded-md hover:bg-gray-100 text-red-500"
            title="Delete selected table"
          >
            <FiTrash2 />
          </button>
        )}
        {projectId && (
          <button 
            onClick={saveProject}
            disabled={saving}
            className="p-2 rounded-md hover:bg-gray-100 text-green-600 flex items-center justify-center"
            title="Save project"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiSave />
            )}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-16 left-4 z-20 bg-white rounded-lg shadow-md p-2 flex flex-col space-y-2 w-48">
          <Link 
            to="/"
            className="p-2 rounded-md hover:bg-gray-100 text-red-500 flex items-center"
            onClick={() => setShowMobileMenu(false)}
          >
            <FiHome className="mr-2" />
            Home
          </Link>
          <button
            onClick={addTable}
            className="p-2 rounded-md hover:bg-gray-100 bg-blue-100 text-blue-800 flex items-center"
          >
            <FiTable className="mr-2" />
            Add Table
          </button>
          <div className="flex items-center justify-between p-2">
            <button 
              onClick={() => setZoom(zoom + 10)} 
              className="p-1 rounded-md hover:bg-gray-100"
              disabled={zoom >= 200}
            >
              <FiPlus />
            </button>
            <span className="text-sm">Zoom: {zoom}%</span>
            <button 
              onClick={() => setZoom(zoom - 10)} 
              className="p-1 rounded-md hover:bg-gray-100"
              disabled={zoom <= 50}
            >
              <FiMinus />
            </button>
          </div>
          {selectedElement && (
            <button 
              onClick={deleteSelectedElement}
              className="p-2 rounded-md hover:bg-gray-100 text-red-500 flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete Table
            </button>
          )}
          {projectId && (
            <button 
              onClick={saveProject}
              disabled={saving}
              className="p-2 rounded-md hover:bg-gray-100 text-green-600 flex items-center"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Project
                </>
              )}
            </button>
          )}
          <button 
            onClick={() => setShowMobileMenu(false)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 border-t border-gray-200 mt-2"
          >
            Close Menu
          </button>
        </div>
      )}

      {/* Board */}
      <div 
        ref={boardRef}
        className={`absolute inset-0 ${isDraggingBoard ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleBoardMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${zoom / 100}) translate(${boardPosition.x}px, ${boardPosition.y}px)`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%'
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

        {/* Database tables */}
        {elements.map((element) => {
          const elementType = elementTypes.find(t => t.type === element.type);
          return (
            <div
              key={element.id}
              data-id={element.id}
              className={`draggable-element absolute rounded-lg border-2 shadow-md ${elementType.color} ${
                selectedElement === element.id ? 'border-purple-500' : 'border-gray-300'
              }`}
              // In your element rendering code, update the style to:
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                minHeight: '120px', // Keep original size
                touchAction: 'none'
              }}
              onClick={(e) => {
                if (!isMobile()) {
                  setSelectedElement(element.id);
                }
              }}
              onMouseDown={(e) => handleElementMove(element.id, e)}
              onTouchStart={(e) => {
                e.stopPropagation();
                const fakeMouseEvent = {
                  touches: e.touches,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation()
                };
                handleElementMove(element.id, fakeMouseEvent);
              }}
            >
              {/* Element header */}
              <div className={`flex items-center p-2 border-b ${elementType.textColor} font-medium`}>
                {elementType.icon}
                <span 
                  className="ml-2 cursor-text truncate"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const newName = prompt('Enter new table name:', element.name);
                    if (newName !== null) {
                      updateElementName(element.id, newName || element.name);
                    }
                  }}
                >
                  {element.name}
                </span>
              </div>

              {/* Table fields */}
              <div className="p-1">
                {element.fields?.map((field) => (
                  <div 
                    key={field.id} 
                    className="flex items-center py-1 px-2 text-xs md:text-sm hover:bg-white hover:bg-opacity-30 rounded group"
                    onMouseDown={(e) => {
                      if (isConnecting) {
                        e.stopPropagation();
                        if (connectionStart) {
                          completeConnection(element.id, field.id);
                        } else {
                          startConnection(element.id, field.id);
                        }
                      }
                    }}
                    onTouchStart={(e) => {
                      if (isConnecting) {
                        e.stopPropagation();
                        if (connectionStart) {
                          completeConnection(element.id, field.id);
                        } else {
                          startConnection(element.id, field.id);
                        }
                      }
                    }}
                  >
                    {editingFields[element.id]?.[field.id] ? (
                      <div className="flex items-center w-full">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(element.id, field.id, { name: e.target.value })}
                          onBlur={() => toggleFieldEditing(element.id, field.id)}
                          onKeyPress={(e) => e.key === 'Enter' && toggleFieldEditing(element.id, field.id)}
                          className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none text-xs md:text-sm"
                          autoFocus
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(element.id, field.id, { type: e.target.value })}
                          className="ml-1 md:ml-2 bg-transparent border-b border-gray-400 focus:outline-none text-xs md:text-sm"
                        >
                          {fieldTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button 
                          className="ml-1 md:ml-2 p-1 text-red-500"
                          onClick={() => deleteField(element.id, field.id)}
                          title="Delete field"
                        >
                          <FiTrash2 size={isMobile() ? 10 : 12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span 
                          className="font-mono cursor-text flex-1 truncate"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleFieldEditing(element.id, field.id);
                          }}
                        >
                          {field.name}
                        </span>
                        <span className="text-gray-500 text-xs truncate ml-1">{field.type}</span>
                        <button 
                          className="ml-1 md:ml-2 p-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            deleteField(element.id, field.id);
                          }}
                          title="Delete field"
                        >
                          <FiX size={isMobile() ? 10 : 12} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
                
                {/* Add new field */}
                <div className="mt-1 md:mt-2 flex items-center">
                  <input
                    type="text"
                    value={newFieldNames[element.id] || ''}
                    onChange={(e) => setNewFieldNames({
                      ...newFieldNames,
                      [element.id]: e.target.value
                    })}
                    placeholder="Field name"
                    className="flex-1 text-xs md:text-sm ml-1 md:ml-2 border-b border-gray-400 focus:outline-none bg-transparent max-w-[100px] md:max-w-[150px]"
                    onKeyPress={(e) => e.key === 'Enter' && addField(element.id)}
                  />
                  <select
                    value={newFieldTypes[element.id] || 'text'}
                    onChange={(e) => setNewFieldTypes({
                      ...newFieldTypes,
                      [element.id]: e.target.value
                    })}
                    className="ml-1 md:ml-2 text-xs md:text-sm border-b border-gray-400 focus:outline-none bg-transparent"
                  >
                    {fieldTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <button 
                    className="ml-1 md:ml-2 p-1 text-green-600"
                    onClick={() => addField(element.id)}
                    title="Add field"
                  >
                    <FiPlus size={isMobile() ? 12 : 14} />
                  </button>
                </div>
              </div>

              {/* Connection button */}
              <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isConnecting && connectionStart) {
                      completeConnection(element.id);
                    } else {
                      startConnection(element.id);
                    }
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (isConnecting && connectionStart) {
                      completeConnection(element.id);
                    } else {
                      startConnection(element.id);
                    }
                  }}
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ${
                    isConnecting ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title={isConnecting ? 'Complete connection' : 'Start new connection'}
                >
                  <FiPlus size={isMobile() ? 12 : 14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 text-xs md:text-sm text-gray-600 flex justify-between">
        <div>
          {elements.length} tables | {connections.length} relationships
          {saving && <span className="ml-2 md:ml-4 text-blue-600">Saving...</span>}
        </div>
        <div>
          Zoom: {zoom}%
        </div>
      </div>
    </div>
  );
};
 
export default Project;