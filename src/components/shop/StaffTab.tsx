
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Staff {
  id: number;
  name: string;
  role: string;
  contact_info: string;
  is_available: boolean;
}

const StaffTab = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [currentStaff, setCurrentStaff] = useState<Staff>({
    id: 0,
    name: "",
    role: "",
    contact_info: "",
    is_available: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to load staff data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentStaff(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (value: string) => {
    setCurrentStaff(prev => ({
      ...prev,
      is_available: value === "available"
    }));
  };

  const handleAddStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert([{ 
          name: currentStaff.name,
          role: currentStaff.role,
          contact_info: currentStaff.contact_info,
          is_available: currentStaff.is_available
        }])
        .select();
      
      if (error) throw error;
      
      setStaff([...staff, data[0]]);
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({
        title: "Error",
        description: "Failed to add staff member",
        variant: "destructive",
      });
    }
  };

  const handleEditStaff = async () => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({ 
          name: currentStaff.name,
          role: currentStaff.role,
          contact_info: currentStaff.contact_info,
          is_available: currentStaff.is_available
        })
        .eq('id', currentStaff.id);
      
      if (error) throw error;
      
      setStaff(staff.map(s => s.id === currentStaff.id ? currentStaff : s));
      resetForm();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
    } catch (error) {
      console.error('Error updating staff:', error);
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStaff = async () => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', currentStaff.id);
      
      if (error) throw error;
      
      setStaff(staff.filter(s => s.id !== currentStaff.id));
      resetForm();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (id: number) => {
    const staffMember = staff.find(s => s.id === id);
    if (!staffMember) return;
    
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_available: !staffMember.is_available })
        .eq('id', id);
      
      if (error) throw error;
      
      setStaff(staff.map(s => 
        s.id === id ? { ...s, is_available: !s.is_available } : s
      ));

      toast({
        title: "Success",
        description: `Staff member marked as ${!staffMember.is_available ? 'available' : 'unavailable'}`,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCurrentStaff({
      id: 0,
      name: "",
      role: "",
      contact_info: "",
      is_available: true
    });
  };

  const openEditDialog = (staffMember: Staff) => {
    setCurrentStaff(staffMember);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (staffMember: Staff) => {
    setCurrentStaff(staffMember);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">Staff Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh]">
              <ScrollArea className="max-h-[80vh] pr-4">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      className="col-span-3"
                      value={currentStaff.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      className="col-span-3"
                      value={currentStaff.role}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact_info" className="text-right">Contact Info</Label>
                    <Input
                      id="contact_info"
                      name="contact_info"
                      className="col-span-3"
                      value={currentStaff.contact_info}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_available" className="text-right">Availability</Label>
                    <Select 
                      value={currentStaff.is_available ? "available" : "unavailable"} 
                      onValueChange={handleAvailabilityChange}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddStaff}>Save Staff</Button>
                </DialogFooter>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading staff data...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-4 flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p>No staff found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell>{s.contact_info}</TableCell>
                    <TableCell>
                      {s.is_available ? 
                        <Badge className="bg-green-500">Available</Badge> : 
                        <Badge className="bg-red-500">Unavailable</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleAvailability(s.id)}
                        >
                          {s.is_available ? "Mark Unavailable" : "Mark Available"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog(s)}>
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
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  className="col-span-3"
                  value={currentStaff.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">Role</Label>
                <Input
                  id="edit-role"
                  name="role"
                  className="col-span-3"
                  value={currentStaff.role}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contact_info" className="text-right">Contact Info</Label>
                <Input
                  id="edit-contact_info"
                  name="contact_info"
                  className="col-span-3"
                  value={currentStaff.contact_info}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is_available" className="text-right">Availability</Label>
                <Select 
                  value={currentStaff.is_available ? "available" : "unavailable"} 
                  onValueChange={handleAvailabilityChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditStaff}>Update Staff</Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{currentStaff.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteStaff}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffTab;
