
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, Pencil, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Machine {
  id: number;
  name: string;
  model: string | null;
  status: "available" | "maintenance" | "unavailable";
  created_at: string | null;
  updated_at: string | null;
}

const MachinesTab = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isNewMachineDialogOpen, setIsNewMachineDialogOpen] = useState(false);
  const [isEditMachineDialogOpen, setIsEditMachineDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [newMachine, setNewMachine] = useState<Omit<Machine, 'id' | 'created_at' | 'updated_at'>>({
    name: "",
    model: "",
    status: "available"
  });
  
  const [editMachine, setEditMachine] = useState<Machine | null>(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      // Convert status string to proper type
      const typedMachines = data.map(machine => ({
        ...machine,
        status: machine.status as "available" | "maintenance" | "unavailable"
      }));
      
      setMachines(typedMachines);
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast({
        title: "Error",
        description: "Failed to load machines data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddMachine = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .insert([{
          name: newMachine.name,
          model: newMachine.model,
          status: newMachine.status
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Machine added successfully",
      });
      
      setNewMachine({
        name: "",
        model: "",
        status: "available"
      });
      
      setIsNewMachineDialogOpen(false);
      fetchMachines();
    } catch (error) {
      console.error('Error adding machine:', error);
      toast({
        title: "Error",
        description: "Failed to add machine",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMachine = async () => {
    if (!editMachine) return;
    
    try {
      const { error } = await supabase
        .from('machines')
        .update({
          name: editMachine.name,
          model: editMachine.model,
          status: editMachine.status
        })
        .eq('id', editMachine.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Machine updated successfully",
      });
      
      setEditMachine(null);
      setIsEditMachineDialogOpen(false);
      fetchMachines();
    } catch (error) {
      console.error('Error updating machine:', error);
      toast({
        title: "Error",
        description: "Failed to update machine",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMachine = async (id: number) => {
    try {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Machine deleted successfully",
      });
      
      fetchMachines();
    } catch (error) {
      console.error('Error deleting machine:', error);
      toast({
        title: "Error",
        description: "Failed to delete machine",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: "available" | "maintenance" | "unavailable") => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">In Maintenance</Badge>;
      case "unavailable":
        return <Badge className="bg-red-100 text-red-800">Unavailable</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Machines</h2>
        <Button onClick={() => setIsNewMachineDialogOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Machine
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    No machines found
                  </TableCell>
                </TableRow>
              ) : (
                machines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell className="font-medium">{machine.name}</TableCell>
                    <TableCell>{machine.model || "—"}</TableCell>
                    <TableCell>{getStatusBadge(machine.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditMachine(machine);
                            setIsEditMachineDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMachine(machine.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add New Machine Dialog */}
      <Dialog open={isNewMachineDialogOpen} onOpenChange={setIsNewMachineDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <ScrollArea className="max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>Enter machine details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Model
                </Label>
                <Input
                  id="model"
                  value={newMachine.model || ""}
                  onChange={(e) => setNewMachine({...newMachine, model: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newMachine.status}
                  onValueChange={(value: "available" | "maintenance" | "unavailable") => 
                    setNewMachine({...newMachine, status: value})
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">In Maintenance</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewMachineDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleAddMachine}>
                Add Machine
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Machine Dialog */}
      <Dialog open={isEditMachineDialogOpen} onOpenChange={setIsEditMachineDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <ScrollArea className="max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Edit Machine</DialogTitle>
              <DialogDescription>Update machine details below.</DialogDescription>
            </DialogHeader>
            {editMachine && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit_name"
                    value={editMachine.name}
                    onChange={(e) => setEditMachine({...editMachine, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_model" className="text-right">
                    Model
                  </Label>
                  <Input
                    id="edit_model"
                    value={editMachine.model || ""}
                    onChange={(e) => setEditMachine({...editMachine, model: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editMachine.status}
                    onValueChange={(value: "available" | "maintenance" | "unavailable") => 
                      setEditMachine({...editMachine, status: value})
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="maintenance">In Maintenance</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditMachineDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleUpdateMachine}>
                Save Changes
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MachinesTab;
