
import Navbar from "@/components/Navbar";
import WorkflowGraph from "@/components/WorkflowGraph";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Automate Your World with
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}Smart Workflows
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect your favorite apps and services to create powerful automations that save time and reduce manual work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/graph-editor">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Try Graph Editor
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" size="lg">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See Multimodal Workflows in Action
            </h2>
            <p className="text-lg text-gray-600">
              Watch how voice commands, clicks, and AI vision create automated LinkedIn posts
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-white mb-4 mx-auto" />
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md">
                  <h3 className="text-white text-xl font-semibold mb-2">
                    LinkedIn Automation Demo
                  </h3>
                  <p className="text-white/80 mb-4">
                    Voice: "Create a LinkedIn post about my AI project with an image"
                  </p>
                  <Link to="/graph-editor">
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Video className="w-4 h-4 mr-2" />
                      View Live Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Graph Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Real-time Workflow Monitoring
            </h2>
            <p className="text-lg text-gray-600">
              Track your automations as they execute in real-time
            </p>
          </div>
          
          <WorkflowGraph />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of companies already automating their workflows with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/graph-editor">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Building
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
