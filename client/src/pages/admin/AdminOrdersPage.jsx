"use strict";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useListAllOrders, useUpdateOrderStatus, getListAllOrdersQueryKey } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};
export function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: orders, isLoading } = useListAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const filtered = filterStatus === "all" ? orders : orders?.filter((o) => o.status === filterStatus);
  function handleStatusChange(orderId, status) {
    updateStatus.mutate({ orderId, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAllOrdersQueryKey() });
        toast({ title: `Order #${orderId} status updated to ${status}` });
      },
      onError: () => toast({ title: "Failed to update status", variant: "destructive" })
    });
  }
  return <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary" /> All Orders</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6"><Skeleton className="h-64" /></div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((order) => <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.userName}</p>
                          <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm">{order.itemCount}</TableCell>
                      <TableCell className="font-bold">₹{order.totalAmount}</TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">{order.paymentMethod?.toUpperCase()}</span>
                        <p className={`text-xs ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>{order.paymentStatus}</p>
                      </TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                          <SelectTrigger className={`h-7 text-xs w-32 ${statusColors[order.status] ?? ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
              {!filtered?.length && <div className="text-center py-12 text-muted-foreground">No orders found</div>}
            </div>}
        </CardContent>
      </Card>
    </div>;
}
