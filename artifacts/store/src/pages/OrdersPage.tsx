import { Link } from "wouter";
import { Package } from "lucide-react";
import { useListOrders } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export function OrdersPage() {
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {!orders?.length ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Button asChild><Link href="/products">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} data-testid={`card-order-${order.id}`}>
              <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">Order #{order.id}</p>
                    <p className="font-bold mt-0.5">{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[order.status] ?? "bg-muted"}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="font-bold text-lg">₹{order.totalAmount}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
