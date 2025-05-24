
import Navbar from "@/components/Navbar";
import LinkedInWorkflowGraph from "@/components/LinkedInWorkflowGraph";
import AIPatternRecognition from "@/components/AIPatternRecognition";
import ExecutionEngine from "@/components/ExecutionEngine";

const GraphEditor = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Multimodal Workflow
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}Knowledge Graph
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AI-powered workflow generation from multimodal browser inputs: voice, clicks, keyboard, and vision
            </p>
          </div>

          {/* LinkedIn Demo Section */}
          <section className="mb-12">
            <LinkedInWorkflowGraph />
          </section>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* AI Pattern Recognition */}
            <AIPatternRecognition />
            
            {/* Execution Engine */}
            <ExecutionEngine />
          </div>

          {/* Features Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">🎙️</div>
              <h3 className="text-xl font-semibold mb-2">Voice Commands</h3>
              <p className="text-gray-600 text-sm">
                Natural language instructions converted to browser automation sequences
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold mb-2">Computer Vision</h3>
              <p className="text-gray-600 text-sm">
                AI identifies UI elements and user interactions for precise automation
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">Smart Patterns</h3>
              <p className="text-gray-600 text-sm">
                Machine learning identifies repeatable patterns in user behavior
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GraphEditor;
