
import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Package, ShoppingCart, Wallet } from "lucide-react";

const NavItem = ({ 
  to, 
  icon: Icon, 
  label,
  active
}: { 
  to: string; 
  icon: React.ElementType; 
  label: string;
  active: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
      active ? "bg-industrial-blue text-white" : "hover:bg-industrial-lightgray"
    )}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-industrial-blue text-white p-1 rounded">
              <Package className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-industrial-blue">CNC Manager</span>
          </Link>
        </div>
        
        <nav className="space-y-1 flex-1">
          <NavItem 
            to="/shop" 
            icon={Package} 
            label="Shop" 
            active={location.pathname === "/shop"} 
          />
          <NavItem 
            to="/orders" 
            icon={ShoppingCart} 
            label="Orders" 
            active={location.pathname === "/orders"} 
          />
          <NavItem 
            to="/expenses" 
            icon={Wallet} 
            label="Expenses" 
            active={location.pathname === "/expenses"} 
          />
          <NavItem 
            to="/analytics" 
            icon={BarChart3} 
            label="Analytics" 
            active={location.pathname === "/analytics"} 
          />
        </nav>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-industrial-blue text-white flex items-center justify-center font-medium">
              U
            </div>
            <div>
              <p className="font-medium text-sm">CNC Admin</p>
              <p className="text-xs text-gray-500">admin@cnccompany.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
