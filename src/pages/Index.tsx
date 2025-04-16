
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ShoppingCart, Wallet } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  const applications = [
    {
      title: "Shop Management",
      description: "Manage inventory, machines, staff, and services.",
      icon: Package,
      path: "/shop",
      color: "bg-blue-100"
    },
    {
      title: "Orders & CRM",
      description: "Track customer orders through the pipeline.",
      icon: ShoppingCart,
      path: "/orders",
      color: "bg-green-100"
    },
    {
      title: "Expenses",
      description: "Track expenses, bills, and supplier payments.",
      icon: Wallet,
      path: "/expenses",
      color: "bg-yellow-100"
    },
    {
      title: "Analytics",
      description: "View business insights and performance metrics.",
      icon: BarChart3,
      path: "/analytics",
      color: "bg-purple-100"
    }
  ];

  return (
    <div className="min-h-full p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-industrial-blue mb-2">Welcome to CNC Manager</h1>
          <p className="text-gray-600">
            Manage your CNC cutting business operations efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => (
            <Card key={app.title} className="border-t-4 border-industrial-blue animate-fade-in">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${app.color} flex items-center justify-center`}>
                  <app.icon className="h-6 w-6 text-industrial-blue" />
                </div>
                <CardTitle className="mt-3">{app.title}</CardTitle>
                <CardDescription>{app.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate(app.path)} className="w-full bg-industrial-blue hover:bg-industrial-lightblue">
                  Open {app.title}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
