import { useParams, Link } from "wouter";
import { ArrowLeft, Package, MapPin, CreditCard, Clock } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrder(Number(id), {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(Number(id)) }
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-10"><Skeleton className="h-96 w-full" /></div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Button asChild className="mt-4"><Link href="/orders">Back to Orders</Link></Button>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/orders"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders</Link>
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${statusColors[order.status] ?? "bg-muted"}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Status timeline */}
      {order.status !== "cancelled" && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  <div className="text-xs mt-6 -ml-3 text-center hidden sm:block">
                    <p className={i <= currentStep ? "font-semibold text-primary" : "text-muted-foreground"}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </p>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 object-cover rounded-lg bg-muted" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2">{item.productName}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
              </div>
              <p className="font-bold text-sm">₹{(item.quantity * item.price).toFixed(0)}</p>
            </div>
          ))}
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee}`}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{order.totalAmount}</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Shipping Address</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-0.5">
            <p className="font-semibold text-foreground">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
            <p>{order.shippingAddress?.phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Payment</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p><span className="font-semibold text-foreground">Method:</span> {order.paymentMethod?.toUpperCase()}</p>
            <p className="mt-1"><span className="font-semibold text-foreground">Status:</span> {" "}
              <span className={order.paymentStatus === "paid" ? "text-secondary font-medium" : "text-yellow-600 font-medium"}>
                {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
