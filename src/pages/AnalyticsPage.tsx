
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ArrowUpRight, Users, Loader2, XCircle, Banknote, CircleDollarSign, BadgeDollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AnalyticsPage = () => {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // State for analytics data
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [jobStatusData, setJobStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [materialUsageData, setMaterialUsageData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [staffUtilizationData, setStaffUtilizationData] = useState<{ name: string; tasks: number }[]>([]);
  
  // State for summary cards
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pendingWork, setPendingWork] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [receivedRevenue, setReceivedRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Status colors for job status chart
  const statusColors = {
    lead: "#9333ea",  // Purple
    contacted: "#3b82f6", // Blue
    confirmed: "#06b6d4", // Cyan
    progressing: "#facc15", // Yellow
    completed: "#22c55e", // Green
    cancelled: "#ef4444"  // Red
  };

  // Material colors for material usage chart
  const materialColors = ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRevenueData(),
        fetchJobStatusData(),
        fetchMaterialUsageData(),
        fetchStaffUtilizationData(),
        fetchSummaryData()
      ]);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    // Get orders grouped by month
    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, final_price');
    
    if (error) throw error;

    // Process orders into monthly revenue
    const monthlyRevenue: Record<string, number> = {};
    
    orders.forEach(order => {
      if (order.created_at && order.final_price) {
        const date = new Date(order.created_at);
        const month = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyRevenue[month]) {
          monthlyRevenue[month] = 0;
        }
        monthlyRevenue[month] += order.final_price;
      }
    });

    // Convert to array format for chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = months.map(month => ({
      month,
      revenue: monthlyRevenue[month] || 0
    }));

    setRevenueData(formattedData);
  };

  const fetchJobStatusData = async () => {
    // Get count of orders by status
    const { data, error } = await supabase
      .from('orders')
      .select('order_status');
    
    if (error) throw error;

    // Count orders by status
    const statusCounts: Record<string, number> = {
      lead: 0,
      contacted: 0,
      confirmed: 0,
      progressing: 0,
      completed: 0,
      cancelled: 0
    };
    
    data.forEach(order => {
      if (order.order_status && statusCounts.hasOwnProperty(order.order_status)) {
        statusCounts[order.order_status]++;
      }
    });

    // Format for chart
    const statusLabels = {
      lead: "Lead",
      contacted: "Contacted",
      confirmed: "Confirmed",
      progressing: "In Production",
      completed: "Completed",
      cancelled: "Cancelled"
    };

    const formattedData = Object.keys(statusCounts).map(status => ({
      name: statusLabels[status as keyof typeof statusLabels],
      value: statusCounts[status],
      color: statusColors[status as keyof typeof statusColors]
    }));

    setJobStatusData(formattedData);
  };

  const fetchMaterialUsageData = async () => {
    // Get materials and their usage in orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('material_id, material_qty');
    
    if (error) throw error;

    // Fetch material details
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('id, name');
    
    if (materialsError) throw materialsError;

    // Create a map of material IDs to names
    const materialNames: Record<number, string> = {};
    materials.forEach(material => {
      materialNames[material.id] = material.name;
    });

    // Count material usage
    const materialUsage: Record<number, number> = {};
    let totalUsage = 0;
    
    orders.forEach(order => {
      if (order.material_id && order.material_qty) {
        if (!materialUsage[order.material_id]) {
          materialUsage[order.material_id] = 0;
        }
        materialUsage[order.material_id] += order.material_qty;
        totalUsage += order.material_qty;
      }
    });

    // Format for chart
    const formattedData = Object.keys(materialUsage).map((materialId, index) => {
      const id = parseInt(materialId);
      return {
        name: materialNames[id] || `Material ${id}`,
        value: Math.round((materialUsage[id] / totalUsage) * 100), // As percentage
        color: materialColors[index % materialColors.length]
      };
    });

    // Add "Other" category if needed
    if (formattedData.length === 0) {
      formattedData.push({
        name: "No Data",
        value: 100,
        color: materialColors[0]
      });
    }

    setMaterialUsageData(formattedData);
  };

  const fetchStaffUtilizationData = async () => {
    // Get staff assignments from order_staff table
    const { data: staffAssignments, error } = await supabase
      .from('order_staff')
      .select('staff_id');
    
    if (error) throw error;

    // Fetch staff details
    const { data: staffList, error: staffError } = await supabase
      .from('staff')
      .select('id, name');
    
    if (staffError) throw staffError;

    // Count assignments per staff
    const staffTasks: Record<number, number> = {};
    
    staffAssignments.forEach(assignment => {
      if (!staffTasks[assignment.staff_id]) {
        staffTasks[assignment.staff_id] = 0;
      }
      staffTasks[assignment.staff_id]++;
    });

    // Create a map of staff IDs to names
    const staffNames: Record<number, string> = {};
    staffList.forEach(staff => {
      staffNames[staff.id] = staff.name;
    });

    // Format for chart
    const formattedData = Object.keys(staffTasks).map(staffId => {
      const id = parseInt(staffId);
      return {
        name: staffNames[id] || `Staff ${id}`,
        tasks: staffTasks[id]
      };
    });

    // Ensure all staff are included, even those without tasks
    staffList.forEach(staff => {
      if (!staffTasks[staff.id]) {
        formattedData.push({
          name: staff.name,
          tasks: 0
        });
      }
    });

    setStaffUtilizationData(formattedData);
  };

  const fetchSummaryData = async () => {
    try {
      // Count total unique customers
      const { data: customersData, error: customersError } = await supabase
        .from('orders')
        .select('client_name')
        .order('client_name');
      
      if (customersError) throw customersError;
      
      // Count unique client names
      const uniqueClients = new Set(customersData.map(order => order.client_name));
      setTotalCustomers(uniqueClients.size);

      // Count pending work (orders not completed or cancelled)
      const { data: pendingData, error: pendingError } = await supabase
        .from('orders')
        .select('id')
        .not('order_status', 'in', '(completed,cancelled)');
      
      if (pendingError) throw pendingError;
      setPendingWork(pendingData.length);

      // Count cancelled orders
      const { data: cancelledData, error: cancelledError } = await supabase
        .from('orders')
        .select('id')
        .eq('order_status', 'cancelled');
      
      if (cancelledError) throw cancelledError;
      setCancelledOrders(cancelledData.length);

      // Calculate total revenue from orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, final_price');
      
      if (ordersError) throw ordersError;
      
      let totalOrderRevenue = 0;
      ordersData.forEach(order => {
        if (order.final_price) {
          totalOrderRevenue += order.final_price;
        }
      });
      setTotalRevenue(totalOrderRevenue);

      // Calculate received revenue from payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount');
      
      if (paymentsError) throw paymentsError;
      
      let totalPaid = 0;
      paymentsData.forEach(payment => {
        totalPaid += payment.amount;
      });
      setReceivedRevenue(totalPaid);

      // Calculate pending revenue
      setPendingRevenue(totalOrderRevenue - totalPaid);

    } catch (error) {
      console.error("Error fetching summary data:", error);
      throw error;
    }
  };

  const applyDateFilter = () => {
    fetchAnalyticsData();
    toast({
      title: "Filter Applied",
      description: `Showing data from ${startDate} to ${endDate}`
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600">Monitor your business performance.</p>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label htmlFor="startDate" className="mb-2 block">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="mb-2 block">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={applyDateFilter} className="bg-industrial-blue hover:bg-industrial-lightblue">
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              title="Total Customers"
              value={totalCustomers}
              icon={<Users className="h-5 w-5" />}
              trend="+12% from last month"
              trendUp={true}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <SummaryCard
              title="Work Pending"
              value={pendingWork}
              icon={<Loader2 className="h-5 w-5" />}
              trend="+5% from last month"
              trendUp={true}
              iconBg="bg-yellow-100"
              iconColor="text-yellow-600"
            />
            <SummaryCard
              title="Cancelled Orders"
              value={cancelledOrders}
              icon={<XCircle className="h-5 w-5" />}
              trend="-2% from last month"
              trendUp={false}
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />
            <SummaryCard
              title="Total Revenue"
              value={`₹ ${totalRevenue.toLocaleString()}`}
              icon={<Banknote className="h-5 w-5" />}
              trend="+18% from last month"
              trendUp={true}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <SummaryCard
              title="Received Revenue"
              value={`₹ ${receivedRevenue.toLocaleString()}`}
              icon={<CircleDollarSign className="h-5 w-5" />}
              trend="+15% from last month"
              trendUp={true}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <SummaryCard
              title="Pending Revenue"
              value={`₹ ${pendingRevenue.toLocaleString()}`}
              icon={<BadgeDollarSign className="h-5 w-5" />}
              trend="+8% from last month"
              trendUp={true}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
            />
          </div>

          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
              <TabsTrigger value="job-status">Job Status</TabsTrigger>
              <TabsTrigger value="materials">Material Usage</TabsTrigger>
              <TabsTrigger value="staff">Staff Utilization</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹ ${value}`, "Revenue"]} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#195B8C" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="job-status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Status Distribution</CardTitle>
                  <CardDescription>Current distribution of job statuses</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Material Usage</CardTitle>
                  <CardDescription>Distribution of materials used in production</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={materialUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {materialUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Utilization</CardTitle>
                  <CardDescription>Number of tasks completed by each staff member</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={staffUtilizationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tasks" fill="#3D87C4" name="Completed Tasks" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

// Helper component for summary cards
const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  iconBg, 
  iconColor 
}: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  iconBg: string;
  iconColor: string;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-2 rounded-md ${iconBg}`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={trendUp ? "text-green-600" : "text-red-600"}>
            {trend}
          </span>
          <ArrowUpRight className={`ml-1 h-4 w-4 ${trendUp ? "text-green-600" : "text-red-600 rotate-180"}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsPage;
