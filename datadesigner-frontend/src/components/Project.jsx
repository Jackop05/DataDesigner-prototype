import React, { useState, useRef, useEffect } from 'react';
import { FiTable, FiColumns, FiKey, FiPlus, FiMinus, FiTrash2, FiX } from 'react-icons/fi';
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
  ];

  const fieldTypes = ['integer', 'text', 'varchar', 'boolean', 'timestamp', 'date', 'float', 'json'];
  const relationshipTypes = ['one-to-one', 'one-to-many', 'many-to-many'];

  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
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
    }
  }, [projectId, navigate]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (!projectId || loading) return;
      
      try {
        setSaving(true);
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/projects/${projectId}`, {
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

    const saveInterval = setInterval(autoSave, 30000);
    return () => clearInterval(saveInterval);
  }, [projectId, elements, connections, loading]);

  // Calculate required width based on content
  const calculateRequiredWidth = (fields) => {
    const fieldNameWidths = fields.map(f => f.name.length * 8);
    const fieldTypeWidths = fields.map(f => f.type.length * 8);
    return Math.max(200, Math.max(...fieldNameWidths) + Math.max(...fieldTypeWidths) + 100);
  };

  // Add new table to the board
  const addTable = () => {
    const baseHeight = 120;
    const fieldHeight = 30;
    const initialFields = [
      { id: `field-${Date.now()}`, name: 'id', type: 'integer', isPrimary: true },
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
  };

  // Save project manually
  const saveProject = async () => {
    if (!projectId) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/projects/${projectId}`, {
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

  // Update table name
  const updateElementName = (id, newName) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, name: newName } : el
    ));
  };

  // Add new field to table
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

  // Delete a field from table
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

  // Handle table movement
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
            type: 'one-to-many', // Default relationship type
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

  // Calculate connection path points
  const calculateConnectionPath = (fromEl, toEl, fromFieldId = null, toFieldId = null) => {
    // If connecting specific fields
    if (fromFieldId && toFieldId) {
      const fromFieldIndex = fromEl.fields.findIndex(f => f.id === fromFieldId);
      const toFieldIndex = toEl.fields.findIndex(f => f.id === toFieldId);
      
      const fromX = fromEl.x + fromEl.width;
      const fromY = fromEl.y + 60 + (fromFieldIndex * 30); // 60 is header height + padding
      
      const toX = toEl.x;
      const toY = toEl.y + 60 + (toFieldIndex * 30);
      
      return { fromX, fromY, toX, toY };
    }
    
    // Default connection between tables (center points)
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
      
      // Calculate control points for smooth curve
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
          
          {/* Connection label */}
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

  if (!loading) {
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

        {/* Database tables */}
        {elements.map((element) => {
          const elementType = elementTypes.find(t => t.type === element.type);
          return (
            <div
              key={element.id}
              className={`absolute rounded-lg border-2 shadow-md min-w-[300px] ${elementType.color} ${selectedElement === element.id ? 'border-purple-500' : 'border-gray-300'}`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                minHeight: '120px'
              }}
              onClick={() => setSelectedElement(element.id)}
              onMouseDown={(e) => handleElementMove(element.id, e)}
            >
              {/* Element header */}
              <div className={`flex items-center p-2 border-b ${elementType.textColor} font-medium`}>
                {editingField === `name-${element.id}` ? (
                  <>
                    {elementType.icon}
                    <input
                      type="text"
                      value={element.name}
                      onChange={(e) => updateElementName(element.id, e.target.value)}
                      onBlur={() => setEditingField(null)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingField(null)}
                      className="w-full bg-transparent border-b border-gray-400 focus:outline-none ml-2"
                      autoFocus
                    />
                  </>
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
              </div>

              {/* Table fields */}
              <div className="p-2">
                {element.fields?.map((field) => (
                  <div 
                    key={field.id} 
                    className="flex items-center py-1 px-2 text-sm hover:bg-white hover:bg-opacity-30 rounded group"
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
                  >
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
                          className={`p-1 mr-1 ${field.isPrimary ? 'text-yellow-600' : 'text-gray-400'}`}
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
                    className="flex-1 text-sm ml-2 border-b border-gray-400 focus:outline-none bg-transparent max-w-[150px]"
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
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${isConnecting ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  title={isConnecting ? 'Complete connection' : 'Start new connection'}
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 text-sm text-gray-600 flex justify-between">
        <div>
          {elements.length} tables | {connections.length} relationships
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