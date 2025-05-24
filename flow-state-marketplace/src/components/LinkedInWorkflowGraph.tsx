
import { useState, useEffect } from "react";
import { linkedinWorkflowEvents, workflowEdges, WorkflowEvent } from "@/data/linkedinWorkflow";

const LinkedInWorkflowGraph = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [events, setEvents] = useState<WorkflowEvent[]>(linkedinWorkflowEvents);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % (events.length + 1);
        
        // Update events status based on current step
        setEvents(prevEvents => 
          prevEvents.map((event, index) => ({
            ...event,
            status: index < next ? 'completed' : 
                   index === next ? 'running' : 'pending'
          }))
        );
        
        return next;
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, [events.length]);

  const getStatusColor = (status: WorkflowEvent['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'navigate': return '🌐';
      case 'type': return '⌨️';
      case 'click': return '👆';
      case 'press': return '⏎';
      case 'upload': return '📤';
      default: return '⚡';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        LinkedIn Post Automation - Live Demo
      </h3>
      
      <div className="relative w-full h-80 overflow-x-auto">
        <svg className="w-full h-full min-w-[1200px]" viewBox="0 0 1250 300">
          {/* Edges */}
          {workflowEdges.map((edge, index) => {
            const fromEvent = events.find(e => e.id === edge.from);
            const toEvent = events.find(e => e.id === edge.to);
            if (!fromEvent || !toEvent) return null;
            
            return (
              <line
                key={index}
                x1={fromEvent.x + 40}
                y1={fromEvent.y + 20}
                x2={toEvent.x}
                y2={toEvent.y + 20}
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
        
        {/* Events */}
        {events.map((event, index) => (
          <div
            key={event.id}
            className="absolute transform -translate-y-1/2"
            style={{ left: event.x, top: event.y + 20 }}
          >
            <div className={`w-12 h-12 rounded-full ${getStatusColor(event.status)} flex items-center justify-center mb-3 shadow-lg`}>
              <span className="text-white text-lg">{getActionIcon(event.action)}</span>
            </div>
            <div className="text-xs text-gray-700 text-center max-w-24 leading-tight font-medium">
              <div className="font-semibold mb-1">{event.action}</div>
              <div className="text-gray-500">{event.description}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 space-y-4">
        <div className="flex justify-center space-x-6 text-sm">
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
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Multimodal Input Demo:</strong> Voice commands + Browser clicks + Keyboard input + Vision AI
          </p>
          <p className="text-xs text-gray-500">
            "Open LinkedIn and create a post about my AI project with an image"
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkedInWorkflowGraph;
