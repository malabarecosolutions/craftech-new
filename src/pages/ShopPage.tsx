
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryTab from "@/components/shop/InventoryTab";
import MachinesTab from "@/components/shop/MachinesTab";
import StaffTab from "@/components/shop/StaffTab";
import ServiceTab from "@/components/shop/ServiceTab";

const ShopPage = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Shop Management</h1>
        <p className="text-gray-600">Manage your inventory, machines, staff, and services.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="w-full">
          <InventoryTab />
        </TabsContent>
        
        <TabsContent value="machines" className="w-full">
          <MachinesTab />
        </TabsContent>
        
        <TabsContent value="staff" className="w-full">
          <StaffTab />
        </TabsContent>
        
        <TabsContent value="services" className="w-full">
          <ServiceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShopPage;
