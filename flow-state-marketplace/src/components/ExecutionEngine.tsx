
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExecutionStep {
  id: string;
  action: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  playwrightCode: string;
  duration?: number;
}

const ExecutionEngine = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const executionSteps: ExecutionStep[] = [
    {
      id: '1',
      action: 'navigate',
      description: 'Navigate to Yahoo',
      status: 'pending',
      playwrightCode: `await page.goto('https://www.yahoo.com');`
    },
    {
      id: '2',
      action: 'type',
      description: 'Search for LinkedIn',
      status: 'pending',
      playwrightCode: `await page.fill('input[name="p"]', 'LinkedIn');`
    },
    {
      id: '3',
      action: 'click',
      description: 'Submit search',
      status: 'pending',
      playwrightCode: `await page.click('button[type="submit"]');`
    },
    {
      id: '4',
      action: 'click',
      description: 'Click LinkedIn result',
      status: 'pending',
      playwrightCode: `await page.click('text=LinkedIn');`
    },
    {
      id: '5',
      action: 'click',
      description: 'Start a post',
      status: 'pending',
      playwrightCode: `await page.click('[data-test-id="start-a-post"]');`
    },
    {
      id: '6',
      action: 'type',
      description: 'Type post content',
      status: 'pending',
      playwrightCode: `await page.fill('[contenteditable="true"]', 'Excited to share my latest project on AI automation! 🚀');`
    },
    {
      id: '7',
      action: 'upload',
      description: 'Upload image',
      status: 'pending',
      playwrightCode: `await page.setInputFiles('input[type="file"]', './images/ai_project.png');`
    },
    {
      id: '8',
      action: 'click',
      description: 'Publish post',
      status: 'pending',
      playwrightCode: `await page.click('[data-test-id="post-button"]');`
    }
  ];

  const [steps, setSteps] = useState(executionSteps);

  const executeWorkflow = async () => {
    setIsExecuting(true);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update current step to running
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'running' } : step
      ));
      
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update current step to completed
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'completed', duration: Math.floor(Math.random() * 1000) + 500 } : step
      ));
    }
    
    setIsExecuting(false);
  };

  const resetExecution = () => {
    setSteps(executionSteps);
    setCurrentStep(0);
    setIsExecuting(false);
  };

  const getStatusColor = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'running': return 'bg-blue-500 text-white animate-pulse';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'navigate': return '🌐';
      case 'type': return '⌨️';
      case 'click': return '👆';
      case 'upload': return '📤';
      default: return '⚡';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🚀 Playwright Execution Engine
          <div className="flex gap-2">
            <Button 
              onClick={executeWorkflow} 
              disabled={isExecuting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isExecuting ? 'Executing...' : 'Execute Workflow'}
            </Button>
            <Button variant="outline" onClick={resetExecution} disabled={isExecuting}>
              Reset
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time execution of the LinkedIn posting workflow using Playwright automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`p-3 rounded-lg border transition-all duration-300 ${
                index === currentStep && isExecuting ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(step.status)}>
                    {getActionIcon(step.action)} {step.action}
                  </Badge>
                  <span className="font-medium text-sm">{step.description}</span>
                </div>
                {step.duration && (
                  <span className="text-xs text-gray-500">{step.duration}ms</span>
                )}
              </div>
              <div className="bg-gray-100 rounded p-2 text-xs font-mono text-gray-700">
                {step.playwrightCode}
              </div>
            </div>
          ))}
        </div>
        
        {isExecuting && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Executing step {currentStep + 1} of {steps.length}: {steps[currentStep]?.description}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionEngine;
