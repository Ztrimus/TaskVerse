
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      title: "Visual Workflow Builder",
      description: "Create complex automations with our intuitive drag-and-drop interface",
      icon: "🎨"
    },
    {
      title: "500+ Integrations",
      description: "Connect with all your favorite apps and services seamlessly",
      icon: "🔗"
    },
    {
      title: "Real-time Monitoring",
      description: "Track workflow execution and performance with detailed analytics",
      icon: "📊"
    },
    {
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance and data encryption",
      icon: "🔒"
    },
    {
      title: "Template Marketplace",
      description: "Choose from thousands of pre-built workflow templates",
      icon: "🏪"
    },
    {
      title: "24/7 Support",
      description: "Get help when you need it with our expert support team",
      icon: "🛟"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Choose a Template",
      description: "Browse our marketplace and select a workflow template that fits your needs"
    },
    {
      step: "2",
      title: "Customize & Connect",
      description: "Modify the workflow and connect your apps with secure authentication"
    },
    {
      step: "3",
      title: "Activate & Monitor",
      description: "Turn on your workflow and watch it automate your processes in real-time"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Workflow Automation
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}Made Simple
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              WorkflowHub is the leading platform for creating, sharing, and managing automated workflows. 
              Connect your apps, automate repetitive tasks, and focus on what matters most.
            </p>
          </div>

          {/* How it Works */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Features Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-3xl font-bold mb-2">10M+</div>
                <div className="text-purple-100">Workflows Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-purple-100">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-purple-100">App Integrations</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-purple-100">Uptime</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Automate Your Workflows?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of companies that trust WorkflowHub to streamline their operations and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Free Trial
              </Button>
              <Link to="/marketplace">
                <Button variant="outline" size="lg">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
