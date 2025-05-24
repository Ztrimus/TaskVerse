
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useState } from "react";

const Marketplace = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const workflows = [
	{
      id: 1,
      title: "Linkedin Post Automater",
      description: "Automatically Sends a post you want on linkedin",
      category: "Productivity",
      price: "Free",
      rating: 4.8,
      downloads: "2.3k",
      tags: ["Email", "Task Management", "Team Collaboration"]
    },
    {
      id: 2,
      title: "Email to Task Automation",
      description: "Automatically create tasks from important emails and assign them to team members",
      category: "Productivity",
      price: "Free",
      rating: 4.8,
      downloads: "2.3k",
      tags: ["Email", "Task Management", "Team Collaboration"]
    },
    {
      id: 3,
      title: "Social Media Scheduler",
      description: "Schedule and post content across multiple social media platforms automatically",
      category: "Marketing",
      price: "$9.99",
      rating: 4.6,
      downloads: "1.8k",
      tags: ["Social Media", "Content", "Scheduling"]
    },
    {
      id: 4,
      title: "Lead Scoring System",
      description: "Automatically score and route leads based on engagement and demographics",
      category: "Sales",
      price: "$19.99",
      rating: 4.9,
      downloads: "1.2k",
      tags: ["CRM", "Lead Management", "Sales"]
    },
    {
      id: 5,
      title: "Invoice Processing",
      description: "Extract data from invoices and automatically update accounting systems",
      category: "Finance",
      price: "$14.99",
      rating: 4.7,
      downloads: "950",
      tags: ["Accounting", "Data Extraction", "Finance"]
    },
    {
      id: 6,
      title: "Customer Support Bot",
      description: "Automated customer support responses with intelligent ticket routing",
      category: "Support",
      price: "$24.99",
      rating: 4.5,
      downloads: "1.5k",
      tags: ["Support", "Chatbot", "Automation"]
    },
    {
      id: 7,
      title: "Data Backup Workflow",
      description: "Automatically backup and sync important files across cloud storage platforms",
      category: "IT Operations",
      price: "Free",
      rating: 4.8,
      downloads: "3.1k",
      tags: ["Backup", "Cloud Storage", "Data Management"]
    }
  ];

  const categories = ["All", "Productivity", "Marketing", "Sales", "Finance", "Support", "IT Operations"];
	
  const handlePreview = async (id) => {
    try {
      setLoading(true);
      await axios.get(`http://localhost:4000/trigger-workflow?id=${id}`);
      setCurrentWorkflowId(id);
      setShowDialog(true);
      setLoading(false);
    } catch (error) {
      console.error("Error triggering workflow:", error);
      alert("Failed to trigger workflow. Check the console for details.");
      setLoading(false);
    }
  };

   const handleContinue = async () => {
    try {
      setLoading(true);
      await axios.post(`http://localhost:3001/api/continueWorkflow?id=${currentWorkflowId}`);
      setMessage("Workflow resumed successfully!");
      setShowDialog(false);
      setLoading(false);
    } catch (error) {
      console.error("Error resuming workflow:", error);
      setMessage("Failed to resume workflow. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Workflow Marketplace
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover pre-built workflow templates to automate your business processes instantly
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className={category === "All" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Workflow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {workflow.category}
                    </Badge>
                    <span className="text-sm font-semibold text-purple-600">
                      {workflow.price}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{workflow.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {workflow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {workflow.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>⭐ {workflow.rating}</span>
                      <span>•</span>
                      <span>{workflow.downloads} downloads</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Install
                    </Button>
                    <Button
						variant="outline"
						size="sm"
						onClick={() => handlePreview(workflow.id)}
						disabled={loading}
						>
						{loading && currentWorkflowId === workflow.id ? "Loading..." : "Preview"}
					</Button>
						{showDialog && (
						<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
						<div className="bg-white p-6 rounded-lg shadow-lg">
							<h2 className="text-xl font-bold mb-4">Log in to LinkedIn</h2>
							<p>Once you're logged in, click Continue.</p>
							<div className="mt-4">
							<Button onClick={handleContinue}>Continue</Button>
							</div>
						</div>
						</div>
					)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Workflows
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
