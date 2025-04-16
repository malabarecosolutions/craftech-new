
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Expense {
  id: number;
  type: string;
  description: string | null;
  amount: number;
  expense_date: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Supplier {
  id: number;
  name: string;
  contact_info: string | null;
  outstanding_payment: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);
  const [isNewSupplierDialogOpen, setIsNewSupplierDialogOpen] = useState(false);
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false);
  const [isEditSupplierDialogOpen, setIsEditSupplierDialogOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses");
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState<"all" | "week" | "month" | "3months" | "custom">("month");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>({
    type: "bill",
    description: "",
    amount: 0,
    expense_date: format(new Date(), 'yyyy-MM-dd')
  });

  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>({
    name: "",
    contact_info: "",
    outstanding_payment: 0
  });

  useEffect(() => {
    fetchExpenses();
    fetchSuppliers();
  }, [dateFilter, startDate, endDate]);

  useEffect(() => {
    // Update date range when filter changes
    switch(dateFilter) {
      case "week":
        setStartDate(startOfWeek(new Date()));
        setEndDate(endOfWeek(new Date()));
        break;
      case "month":
        setStartDate(startOfMonth(new Date()));
        setEndDate(endOfMonth(new Date()));
        break;
      case "3months":
        setStartDate(startOfMonth(subMonths(new Date(), 2)));
        setEndDate(endOfMonth(new Date()));
        break;
      case "custom":
        setStartDate(dateRange.from);
        setEndDate(dateRange.to || new Date());
        break;
      case "all":
      default:
        // No date filtering
        break;
    }
  }, [dateFilter, dateRange]);

  async function fetchExpenses() {
    try {
      setLoading(true);
      
      let query = supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      
      // Apply date filtering if not "all"
      if (dateFilter !== "all") {
        query = query
          .gte('expense_date', format(startDate, 'yyyy-MM-dd'))
          .lte('expense_date', format(endDate, 'yyyy-MM-dd'));
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchSuppliers() {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to load suppliers data",
        variant: "destructive",
      });
    }
  }

  const handleAddExpense = async () => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([newExpense]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      
      setNewExpense({
        type: "bill",
        description: "",
        amount: 0,
        expense_date: format(new Date(), 'yyyy-MM-dd')
      });
      
      setIsNewExpenseDialogOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const handleUpdateExpense = async () => {
    if (!editExpense) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          type: editExpense.type,
          description: editExpense.description,
          amount: editExpense.amount,
          expense_date: editExpense.expense_date
        })
        .eq('id', editExpense.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      
      setEditExpense(null);
      setIsEditExpenseDialogOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleAddSupplier = async () => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([newSupplier]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
      
      setNewSupplier({
        name: "",
        contact_info: "",
        outstanding_payment: 0
      });
      
      setIsNewSupplierDialogOpen(false);
      fetchSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSupplier = async () => {
    if (!editSupplier) return;
    
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: editSupplier.name,
          contact_info: editSupplier.contact_info,
          outstanding_payment: editSupplier.outstanding_payment
        })
        .eq('id', editSupplier.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
      
      setEditSupplier(null);
      setIsEditSupplierDialogOpen(false);
      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy');
  };
  
  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalOutstandingPayments = () => {
    return suppliers.reduce((sum, supplier) => sum + (supplier.outstanding_payment || 0), 0);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Management</h1>
        <p className="text-gray-600">Track expenses and manage supplier accounts.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{getTotalExpenses().toLocaleString()}</div>
            <p className="text-muted-foreground">
              {dateFilter !== "all" ? 
                `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}` :
                "All time"
              }
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Outstanding Supplier Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{getTotalOutstandingPayments().toLocaleString()}</div>
            <p className="text-muted-foreground">Total pending amount</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>
          
          {activeTab === "expenses" && (
            <div className="flex gap-2 items-center">
              <Select value={dateFilter} onValueChange={(value: "all" | "week" | "month" | "3months" | "custom") => setDateFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              
              {dateFilter === "custom" && (
                <DateRangePicker
                  className="ml-auto"
                  value={dateRange}
                  onChange={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange(range);
                      setDateFilter("custom");
                    }
                  }}
                />
              )}
              
              <Button onClick={() => setIsNewExpenseDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Expense
              </Button>
            </div>
          )}
          
          {activeTab === "suppliers" && (
            <Button onClick={() => setIsNewSupplierDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Supplier
            </Button>
          )}
        </div>

        <TabsContent value="expenses">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Loading expenses...</p>
            </div>
          ) : (
            <div className="bg-white rounded-md shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.expense_date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {expense.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right font-medium">₹{expense.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditExpense(expense);
                                setIsEditExpenseDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              Delete
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
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="bg-white rounded-md shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead className="text-right">Outstanding Payment (₹)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contact_info || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={supplier.outstanding_payment && supplier.outstanding_payment > 0 ? "destructive" : "outline"}>
                          ₹{(supplier.outstanding_payment || 0).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditSupplier(supplier);
                              setIsEditSupplierDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Expense Dialog */}
      <Dialog open={isNewExpenseDialogOpen} onOpenChange={setIsNewExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newExpense.type}
                onValueChange={(value) => setNewExpense({...newExpense, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bill">Bill</SelectItem>
                  <SelectItem value="material_purchase">Material Purchase</SelectItem>
                  <SelectItem value="supplier_payment">Supplier Payment</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expense_date" className="text-right">
                Date
              </Label>
              <Input
                id="expense_date"
                type="date"
                value={newExpense.expense_date}
                onChange={(e) => setNewExpense({...newExpense, expense_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newExpense.description || ''}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddExpense}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditExpenseDialogOpen} onOpenChange={setIsEditExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editExpense && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_type" className="text-right">
                  Type
                </Label>
                <Select
                  value={editExpense.type}
                  onValueChange={(value) => setEditExpense({...editExpense, type: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bill">Bill</SelectItem>
                    <SelectItem value="material_purchase">Material Purchase</SelectItem>
                    <SelectItem value="supplier_payment">Supplier Payment</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_expense_date" className="text-right">
                  Date
                </Label>
                <Input
                  id="edit_expense_date"
                  type="date"
                  value={editExpense.expense_date}
                  onChange={(e) => setEditExpense({...editExpense, expense_date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="edit_amount"
                  type="number"
                  value={editExpense.amount}
                  onChange={(e) => setEditExpense({...editExpense, amount: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit_description"
                  value={editExpense.description || ''}
                  onChange={(e) => setEditExpense({...editExpense, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateExpense}>Update Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Supplier Dialog */}
      <Dialog open={isNewSupplierDialogOpen} onOpenChange={setIsNewSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_info" className="text-right">
                Contact
              </Label>
              <Input
                id="contact_info"
                value={newSupplier.contact_info || ''}
                onChange={(e) => setNewSupplier({...newSupplier, contact_info: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="outstanding_payment" className="text-right">
                Outstanding
              </Label>
              <Input
                id="outstanding_payment"
                type="number"
                value={newSupplier.outstanding_payment || 0}
                onChange={(e) => setNewSupplier({...newSupplier, outstanding_payment: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditSupplierDialogOpen} onOpenChange={setIsEditSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {editSupplier && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit_name"
                  value={editSupplier.name}
                  onChange={(e) => setEditSupplier({...editSupplier, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_contact_info" className="text-right">
                  Contact
                </Label>
                <Input
                  id="edit_contact_info"
                  value={editSupplier.contact_info || ''}
                  onChange={(e) => setEditSupplier({...editSupplier, contact_info: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_outstanding_payment" className="text-right">
                  Outstanding
                </Label>
                <Input
                  id="edit_outstanding_payment"
                  type="number"
                  value={editSupplier.outstanding_payment || 0}
                  onChange={(e) => setEditSupplier({...editSupplier, outstanding_payment: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateSupplier}>Update Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
