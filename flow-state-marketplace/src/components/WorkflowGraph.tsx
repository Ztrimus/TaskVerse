
import { useState, useEffect } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface Edge {
  from: string;
  to: string;
}

const WorkflowGraph = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nodes: Node[] = [
    { id: '1', label: 'Email Received', x: 50, y: 100, status: 'completed' },
    { id: '2', label: 'Extract Data', x: 200, y: 100, status: 'completed' },
    { id: '3', label: 'Validate Info', x: 350, y: 100, status: 'running' },
    { id: '4', label: 'Create Task', x: 500, y: 100, status: 'pending' },
    { id: '5', label: 'Send Notification', x: 650, y: 100, status: 'pending' },
  ];

  const edges: Edge[] = [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '4' },
    { from: '4', to: '5' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getNodeStatus = (nodeIndex: number): Node['status'] => {
    if (nodeIndex < currentStep) return 'completed';
    if (nodeIndex === currentStep) return 'running';
    return 'pending';
  };

  const getStatusColor = (status: Node['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Live Workflow Execution
      </h3>
      
      <div className="relative w-full h-64 overflow-x-auto">
        <svg className="w-full h-full min-w-[700px]" viewBox="0 0 750 200">
          {/* Edges */}
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            
            return (
              <line
                key={index}
                x1={fromNode.x + 40}
                y1={fromNode.y + 20}
                x2={toNode.x}
                y2={toNode.y + 20}
                stroke="#e5e7eb"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          
          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#e5e7eb"
              />
            </marker>
          </defs>
        </svg>
        
        {/* Nodes */}
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="absolute transform -translate-y-1/2"
            style={{ left: node.x, top: node.y + 20 }}
          >
            <div className={`w-10 h-10 rounded-full ${getStatusColor(getNodeStatus(index))} flex items-center justify-center mb-2`}>
              <span className="text-white text-sm font-medium">{index + 1}</span>
            </div>
            <div className="text-xs text-gray-600 text-center max-w-20 leading-tight">
              {node.label}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">Running</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Completed</span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowGraph;
