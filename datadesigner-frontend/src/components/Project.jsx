import React, { useState, useRef, useEffect } from 'react';
import { FiDatabase, FiTable, FiColumns, FiKey, FiPlus, FiMinus, FiMove, FiLink2, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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
  const [gridSize, setGridSize] = useState(20);
  const [editingField, setEditingField] = useState(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const boardRef = useRef(null);
  const [boardPosition, setBoardPosition] = useState({ x: 0, y: 0 });

  // Element and field configuration
  const elementTypes = [
    { type: 'table', icon: <FiTable />, color: 'bg-blue-100', textColor: 'text-blue-800' },
    { type: 'view', icon: <FiDatabase />, color: 'bg-green-100', textColor: 'text-green-800' },
    { type: 'enum', icon: <FiColumns />, color: 'bg-purple-100', textColor: 'text-purple-800' },
  ];

  const fieldTypes = ['integer', 'text', 'varchar', 'boolean', 'timestamp', 'date', 'float', 'json'];

  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setElements(response.data.elements || []);
        setConnections(response.data.connections || []);
      } catch (error) {
        console.error("Error loading project:", error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    } else {
      setLoading(false);
    }
  }, [projectId, navigate]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (!projectId || loading) return;
      
      try {
        setSaving(true);
        const token = localStorage.getItem('token');
        await axios.put(`/api/projects/${projectId}`, {
          elements,
          connections
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error("Error saving project:", error);
      } finally {
        setSaving(false);
      }
    };

    const saveInterval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(saveInterval);
  }, [projectId, elements, connections, loading]);

  // Calculate required width based on content
  const calculateRequiredWidth = (fields) => {
    const fieldNameWidths = fields.map(f => f.name.length * 8);
    const fieldTypeWidths = fields.map(f => f.type.length * 8);
    return Math.max(200, Math.max(...fieldNameWidths) + Math.max(...fieldTypeWidths) + 100);
  };

  // Add new element to the board
  const addElement = (type) => {
    const baseHeight = 120;
    const fieldHeight = 30;
    const initialFields = type === 'table' ? [
      { id: `field-${Date.now()}`, name: 'id', type: 'integer', isPrimary: true },
      { id: `field-${Date.now() + 1}`, name: 'created_at', type: 'timestamp' }
    ] : [];

    const newElement = {
      id: `element-${Date.now()}`,
      type,
      name: `New ${type}`,
      x: 100,
      y: 100,
      width: calculateRequiredWidth(initialFields),
      height: baseHeight + (initialFields.length * fieldHeight),
      fields: initialFields
    };
    setElements([...elements, newElement]);
  };

  // Save project manually
  const saveProject = async () => {
    if (!projectId) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(`/api/projects/${projectId}`, {
        elements,
        connections
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setSaving(false);
    }
  };

  // Update element name
  const updateElementName = (id, newName) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, name: newName } : el
    ));
  };

  // Add new field to element
  const addField = (elementId) => {
    setElements(elements.map(el => {
      if (el.id === elementId) {
        const newFields = [...el.fields, { 
          id: `field-${Date.now()}`, 
          name: newFieldName || 'new_field', 
          type: newFieldType,
          isPrimary: false 
        }];
        
        return {
          ...el, 
          fields: newFields,
          height: 120 + (newFields.length * 30),
          width: calculateRequiredWidth(newFields)
        };
      }
      return el;
    }));
    setNewFieldName('');
    setNewFieldType('text');
  };

  // Delete a field from element
  const deleteField = (elementId, fieldId) => {
    setElements(elements.map(el => {
      if (el.id === elementId) {
        const newFields = el.fields.filter(f => f.id !== fieldId);
        return {
          ...el, 
          fields: newFields,
          height: Math.max(120, 120 + (newFields.length * 30)),
          width: calculateRequiredWidth(newFields)
        };
      }
      return el;
    }));
    setEditingField(null);
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

  // Toggle primary key status
  const togglePrimaryKey = (elementId, fieldId) => {
    setElements(elements.map(el => 
      el.id === elementId ? { 
        ...el, 
        fields: el.fields.map(f => ({
          ...f,
          isPrimary: f.id === fieldId ? !f.isPrimary : false
        }))
      } : el
    ));
  };

  // Handle element movement
  const handleElementMove = (id, e) => {
    if (e.buttons !== 1) return;
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = element.x;
    const startPosY = element.y;
    
    const moveHandler = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
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

  // Connection management
  const startConnection = (elementId, isOutput, isFromTop = false) => {
    setIsConnecting(true);
    setConnectionStart({ elementId, isOutput, isFromTop });
  };

  const completeConnection = (elementId, isTop = false) => {
    if (isConnecting && connectionStart) {
      if (connectionStart.elementId !== elementId) {
        setConnections([
          ...connections,
          {
            id: `conn-${Date.now()}`,
            from: connectionStart.isOutput ? connectionStart.elementId : elementId,
            to: connectionStart.isOutput ? elementId : connectionStart.elementId,
            fromIsTop: connectionStart.isFromTop,
            toIsTop: isTop
          }
        ]);
      }
    }
    setIsConnecting(false);
    setConnectionStart(null);
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
    }
  };

  // Handle board movement
  const handleBoardMove = (e) => {
    if (e.buttons !== 2) return;
    
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
      
      const fromX = conn.fromIsTop ? fromEl.x + fromEl.width / 2 : fromEl.x + fromEl.width;
      const fromY = conn.fromIsTop ? fromEl.y - 10 : fromEl.y + fromEl.height / 2;
      const toX = conn.toIsTop ? toEl.x + toEl.width / 2 : toEl.x;
      const toY = conn.toIsTop ? toEl.y - 10 : toEl.y + toEl.height / 2;
      
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
          <circle 
            cx={fromX} 
            cy={fromY} 
            r="5" 
            fill="#6366f1" 
            className="cursor-pointer pointer-events-auto"
            onClick={() => deleteConnection(conn.id)}
          />
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
        {selectedElement && (
          <button 
            onClick={deleteSelectedElement}
            className="p-2 rounded-md hover:bg-gray-100 text-red-500"
            title="Delete selected element"
          >
            <FiTrash2 />
          </button>
        )}
        {projectId && (
          <button 
            onClick={saveProject}
            disabled={saving}
            className="p-2 rounded-md hover:bg-gray-100 text-green-600"
            title="Save project"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              'Save'
            )}
          </button>
        )}
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
                minHeight: '120px'
              }}
              onClick={() => setSelectedElement(element.id)}
              onMouseDown={(e) => handleElementMove(element.id, e)}
            >
              {/* Top connection dot */}
              <div 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-gray-400 cursor-pointer hover:bg-gray-600"
                onMouseDown={(e) => { e.stopPropagation(); startConnection(element.id, true, true); }}
                title="Create connection from top"
              />

              {/* Element header */}
              <div className={`flex items-center p-2 border-b ${elementType.textColor} font-medium`}>
                {editingField === `name-${element.id}` ? (
                  <input
                    type="text"
                    value={element.name}
                    onChange={(e) => updateElementName(element.id, e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyPress={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="w-full bg-transparent border-b border-gray-400 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <>
                    {elementType.icon}
                    <span 
                      className="ml-2 cursor-text"
                      onClick={(e) => { e.stopPropagation(); setEditingField(`name-${element.id}`); }}
                    >
                      {element.name}
                    </span>
                  </>
                )}
                <div className="ml-auto flex space-x-1">
                  <button 
                    className={`p-1 rounded hover:bg-white hover:bg-opacity-30 ${element.fields.some(f => f.isPrimary) ? 'text-yellow-600' : 'text-gray-600'}`}
                    onMouseDown={(e) => { e.stopPropagation(); startConnection(element.id, true); }}
                    title="Create connection from this element"
                  >
                    <FiKey size={14} />
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
              <div className="p-2">
                {element.fields?.map((field) => (
                  <div key={field.id} className="flex items-center py-1 px-2 text-sm hover:bg-white hover:bg-opacity-30 rounded group">
                    {editingField === `field-${field.id}` ? (
                      <div className="flex items-center w-full">
                        <button 
                          className={`p-1 mr-1 rounded ${field.isPrimary ? 'text-yellow-600' : 'text-gray-400'}`}
                          onClick={() => togglePrimaryKey(element.id, field.id)}
                          title={field.isPrimary ? 'Primary key' : 'Set as primary key'}
                        >
                          <FiKey size={12} />
                        </button>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(element.id, field.id, { name: e.target.value })}
                          onBlur={() => setEditingField(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingField(null)}
                          className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none"
                          autoFocus
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(element.id, field.id, { type: e.target.value })}
                          className="ml-2 bg-transparent border-b border-gray-400 focus:outline-none"
                        >
                          {fieldTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button 
                          className="ml-2 p-1 text-red-500"
                          onClick={() => deleteField(element.id, field.id)}
                          title="Delete field"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          className={`p-1 mr-1 rounded ${field.isPrimary ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
                          onClick={() => togglePrimaryKey(element.id, field.id)}
                          title={field.isPrimary ? 'Primary key' : 'Set as primary key'}
                        >
                          <FiKey size={12} />
                        </button>
                        <span 
                          className="font-mono cursor-text"
                          onClick={(e) => { e.stopPropagation(); setEditingField(`field-${field.id}`); }}
                        >
                          {field.name}
                        </span>
                        <span className="ml-auto text-gray-500 text-xs">{field.type}</span>
                        <button 
                          className="ml-2 p-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); deleteField(element.id, field.id); }}
                          title="Delete field"
                        >
                          <FiX size={12} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
                
                {/* Add new field */}
                <div className="mt-2 flex items-center">
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Field name"
                    className="flex-1 text-sm border-b border-gray-400 focus:outline-none bg-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addField(element.id)}
                  />
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="ml-2 text-sm border-b border-gray-400 focus:outline-none bg-transparent"
                  >
                    {fieldTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <button 
                    className="ml-2 p-1 text-green-600"
                    onClick={() => addField(element.id)}
                    title="Add field"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
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
          {saving && <span className="ml-4 text-blue-600">Saving...</span>}
        </div>
        <div>
          Grid: {gridSize}px | Zoom: {zoom}%
        </div>
      </div>
    </div>
  );
};

export default Project;