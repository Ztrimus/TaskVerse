
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Pattern {
  id: string;
  name: string;
  confidence: number;
  description: string;
  frequency: number;
  category: 'navigation' | 'interaction' | 'content' | 'workflow';
}

const AIPatternRecognition = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([
    {
      id: '1',
      name: 'Social Media Posting Sequence',
      confidence: 94.5,
      description: 'User consistently follows: Navigate → Login → Create Post → Add Media → Publish',
      frequency: 15,
      category: 'workflow'
    },
    {
      id: '2',
      name: 'Search-to-Action Pattern',
      confidence: 87.2,
      description: 'Search query followed by clicking first result within 3 seconds',
      frequency: 8,
      category: 'navigation'
    },
    {
      id: '3',
      name: 'Content Creation Routine',
      confidence: 91.8,
      description: 'Text input followed by media upload in 73% of posting sessions',
      frequency: 12,
      category: 'content'
    },
    {
      id: '4',
      name: 'Multi-tab Navigation',
      confidence: 76.3,
      description: 'Opens external link in new tab, returns to original after 2-5 minutes',
      frequency: 6,
      category: 'navigation'
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getCategoryColor = (category: Pattern['category']) => {
    switch (category) {
      case 'workflow': return 'bg-purple-100 text-purple-800';
      case 'navigation': return 'bg-blue-100 text-blue-800';
      case 'content': return 'bg-green-100 text-green-800';
      case 'interaction': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧠 AI Pattern Recognition
          {isAnalyzing && (
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          )}
        </CardTitle>
        <CardDescription>
          Analyzing user behavior patterns from multimodal inputs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.map((pattern) => (
          <div key={pattern.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{pattern.name}</h4>
                  <Badge className={getCategoryColor(pattern.category)}>
                    {pattern.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{pattern.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`font-medium ${getConfidenceColor(pattern.confidence)}`}>
                    {pattern.confidence}% confidence
                  </span>
                  <span className="text-gray-500">
                    {pattern.frequency} occurrences
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pattern.confidence}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIPatternRecognition;
