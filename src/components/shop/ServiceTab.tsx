
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Service {
  id: number;
  name: string;
  price: number;
  description: string;
}

const ServiceTab = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [currentService, setCurrentService] = useState<Service>({
    id: 0,
    name: "",
    price: 0,
    description: ""
  });

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{ 
          name: currentService.name,
          price: currentService.price,
          description: currentService.description
        }])
        .select();
      
      if (error) throw error;
      
      setServices([...services, data[0]]);
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Service added successfully",
      });
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
      });
    }
  };

  const handleEditService = async () => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          name: currentService.name,
          price: currentService.price,
          description: currentService.description
        })
        .eq('id', currentService.id);
      
      if (error) throw error;
      
      setServices(services.map(s => s.id === currentService.id ? currentService : s));
      resetForm();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async () => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', currentService.id);
      
      if (error) throw error;
      
      setServices(services.filter(s => s.id !== currentService.id));
      resetForm();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCurrentService({
      id: 0,
      name: "",
      price: 0,
      description: ""
    });
  };

  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">Services Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh]">
              <ScrollArea className="max-h-[80vh] pr-4">
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Service Name</Label>
                    <Input
                      id="name"
                      name="name"
                      className="col-span-3"
                      value={currentService.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">Price (₹)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      className="col-span-3"
                      value={currentService.price || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      className="col-span-3"
                      value={currentService.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddService}>Save Service</Button>
                </DialogFooter>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading services data...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-4 flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p>No services found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>₹ {service.price}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog(service)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh]">
          <ScrollArea className="max-h-[80vh] pr-4">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Service Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  className="col-span-3"
                  value={currentService.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Price (₹)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  className="col-span-3"
                  value={currentService.price || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  className="col-span-3"
                  value={currentService.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditService}>Update Service</Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{currentService.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteService}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceTab;
