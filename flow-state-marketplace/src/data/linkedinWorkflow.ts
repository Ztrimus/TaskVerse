
export interface WorkflowEvent {
  id: string;
  action: string;
  description: string;
  url?: string;
  filePath?: string;
  x: number;
  y: number;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export const linkedinWorkflowEvents: WorkflowEvent[] = [
  {
    id: '1',
    action: 'navigate',
    description: 'Open Browser & Go to Yahoo',
    url: 'https://www.yahoo.com',
    x: 50,
    y: 100,
    status: 'pending'
  },
  {
    id: '2',
    action: 'type',
    description: 'Search for LinkedIn',
    x: 200,
    y: 100,
    status: 'pending'
  },
  {
    id: '3',
    action: 'press',
    description: 'Submit the search',
    x: 350,
    y: 100,
    status: 'pending'
  },
  {
    id: '4',
    action: 'click',
    description: 'Click LinkedIn homepage result',
    x: 500,
    y: 100,
    status: 'pending'
  },
  {
    id: '5',
    action: 'click',
    description: 'Click Start a post button',
    x: 650,
    y: 100,
    status: 'pending'
  },
  {
    id: '6',
    action: 'type',
    description: 'Type: "Excited to share my latest project on AI automation! 🚀"',
    x: 800,
    y: 100,
    status: 'pending'
  },
  {
    id: '7',
    action: 'upload',
    description: 'Upload image for the post',
    filePath: './images/ai_project.png',
    x: 950,
    y: 100,
    status: 'pending'
  },
  {
    id: '8',
    action: 'click',
    description: 'Click Post button to publish',
    x: 1100,
    y: 100,
    status: 'pending'
  }
];

export const workflowEdges = [
  { from: '1', to: '2' },
  { from: '2', to: '3' },
  { from: '3', to: '4' },
  { from: '4', to: '5' },
  { from: '5', to: '6' },
  { from: '6', to: '7' },
  { from: '7', to: '8' }
];
