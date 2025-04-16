
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Material {
  id: number;
  name: string;
  thickness: number;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  min_quantity: number;
}

const InventoryTab = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const [currentMaterial, setCurrentMaterial] = useState<Material>({
    id: 0,
    name: "",
    thickness: 0,
    purchase_price: 0,
    selling_price: 0,
    current_stock: 0,
    min_quantity: 0
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentMaterial(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value) || 0
    }));
  };

  const handleAddMaterial = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([
          { 
            name: currentMaterial.name,
            thickness: currentMaterial.thickness,
            purchase_price: currentMaterial.purchase_price,
            selling_price: currentMaterial.selling_price,
            current_stock: currentMaterial.current_stock,
            min_quantity: currentMaterial.min_quantity
          }
        ])
        .select();
      
      if (error) throw error;
      
      setMaterials([...materials, data[0]]);
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Material added successfully",
      });
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive",
      });
    }
  };

  const handleEditMaterial = async () => {
    try {
      const { error } = await supabase
        .from('materials')
        .update({ 
          name: currentMaterial.name,
          thickness: currentMaterial.thickness,
          purchase_price: currentMaterial.purchase_price,
          selling_price: currentMaterial.selling_price,
          current_stock: currentMaterial.current_stock,
          min_quantity: currentMaterial.min_quantity
        })
        .eq('id', currentMaterial.id);
      
      if (error) throw error;
      
      setMaterials(materials.map(m => m.id === currentMaterial.id ? currentMaterial : m));
      resetForm();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Material updated successfully",
      });
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        title: "Error",
        description: "Failed to update material",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = async () => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', currentMaterial.id);
      
      if (error) throw error;
      
      setMaterials(materials.filter(m => m.id !== currentMaterial.id));
      resetForm();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCurrentMaterial({
      id: 0,
      name: "",
      thickness: 0,
      purchase_price: 0,
      selling_price: 0,
      current_stock: 0,
      min_quantity: 0
    });
  };

  const openEditDialog = (material: Material) => {
    setCurrentMaterial(material);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (material: Material) => {
    setCurrentMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStockFilter = !showLowStock || material.current_stock < material.min_quantity;
    return matchesSearch && matchesStockFilter;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">Inventory Management</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Input 
                type="text" 
                placeholder="Search materials..."
                className="w-[200px]" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" onClick={() => setShowLowStock(!showLowStock)}>
                {showLowStock ? "Show All" : "Show Low Stock"}
              </Button>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh]">
                <ScrollArea className="max-h-[80vh] pr-4">
                  <DialogHeader>
                    <DialogTitle>Add New Material</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        className="col-span-3"
                        value={currentMaterial.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="thickness" className="text-right">Thickness (mm)</Label>
                      <Input
                        id="thickness"
                        name="thickness"
                        type="number"
                        className="col-span-3"
                        value={currentMaterial.thickness || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="purchase_price" className="text-right">Purchase Price</Label>
                      <Input
                        id="purchase_price"
                        name="purchase_price"
                        type="number"
                        className="col-span-3"
                        value={currentMaterial.purchase_price || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="selling_price" className="text-right">Selling Price</Label>
                      <Input
                        id="selling_price"
                        name="selling_price"
                        type="number"
                        className="col-span-3"
                        value={currentMaterial.selling_price || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="current_stock" className="text-right">Current Stock</Label>
                      <Input
                        id="current_stock"
                        name="current_stock"
                        type="number"
                        className="col-span-3"
                        value={currentMaterial.current_stock || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="min_quantity" className="text-right">Min. Quantity</Label>
                      <Input
                        id="min_quantity"
                        name="min_quantity"
                        type="number"
                        className="col-span-3"
                        value={currentMaterial.min_quantity || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMaterial}>Save Material</Button>
                  </DialogFooter>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading inventory data...</div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-4 flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p>No materials found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Thickness (mm)</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min. Quantity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.thickness}</TableCell>
                    <TableCell>₹ {material.purchase_price}</TableCell>
                    <TableCell>₹ {material.selling_price}</TableCell>
                    <TableCell className={material.current_stock < material.min_quantity ? "text-red-500 font-bold" : ""}>
                      {material.current_stock}
                    </TableCell>
                    <TableCell>{material.min_quantity}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(material)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog(material)}>
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
              <DialogTitle>Edit Material</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  className="col-span-3"
                  value={currentMaterial.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-thickness" className="text-right">Thickness (mm)</Label>
                <Input
                  id="edit-thickness"
                  name="thickness"
                  type="number"
                  className="col-span-3"
                  value={currentMaterial.thickness || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-purchase_price" className="text-right">Purchase Price</Label>
                <Input
                  id="edit-purchase_price"
                  name="purchase_price"
                  type="number"
                  className="col-span-3"
                  value={currentMaterial.purchase_price || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-selling_price" className="text-right">Selling Price</Label>
                <Input
                  id="edit-selling_price"
                  name="selling_price"
                  type="number"
                  className="col-span-3"
                  value={currentMaterial.selling_price || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-current_stock" className="text-right">Current Stock</Label>
                <Input
                  id="edit-current_stock"
                  name="current_stock"
                  type="number"
                  className="col-span-3"
                  value={currentMaterial.current_stock || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-min_quantity" className="text-right">Min. Quantity</Label>
                <Input
                  id="edit-min_quantity"
                  name="min_quantity"
                  type="number"
                  className="col-span-3"
                  value={currentMaterial.min_quantity || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditMaterial}>Update Material</Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{currentMaterial.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteMaterial}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryTab;
