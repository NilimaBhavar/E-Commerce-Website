import { Link, useLocation } from "wouter";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function CartPage() {
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useGetCart({ query: { enabled: isAuthenticated } });
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  }

  function handleQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return;
    updateItem.mutate({ itemId, data: { quantity } }, { onSuccess: invalidate });
  }

  function handleRemove(itemId: number) {
    removeItem.mutate({ itemId }, {
      onSuccess: () => { invalidate(); toast({ title: "Item removed from cart" }); },
    });
  }

  function handleClear() {
    clearCart.mutate(undefined, {
      onSuccess: () => { invalidate(); toast({ title: "Cart cleared" }); },
    });
  }

  const subtotal = cart?.subtotal ?? 0;
  const shippingFee = subtotal >= 500 ? 0 : 49;
  const total = subtotal + shippingFee;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Login to view your cart</h2>
        <Button asChild className="mt-4"><Link href="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add products to get started</p>
        <Button asChild><Link href="/products">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-1" /> Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-card border border-border rounded-xl p-4" data-testid={`cart-item-${item.id}`}>
              <Link href={`/products/${item.productId}`}>
                <img src={item.imageUrl} alt={item.productName} className="w-20 h-20 object-cover rounded-lg bg-muted shrink-0" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`}>
                  <p className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{item.productName}</p>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>
                <p className="font-bold mt-2">₹{item.price}</p>
              </div>
              <div className="flex flex-col items-end justify-between shrink-0">
                <button onClick={() => handleRemove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-remove-item-${item.id}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQuantity(item.id, item.quantity - 1)} className="bg-muted rounded-full p-1 hover:bg-muted/70 transition-colors" disabled={item.quantity <= 1}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => handleQuantity(item.id, item.quantity + 1)} className="bg-muted rounded-full p-1 hover:bg-muted/70 transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm font-bold text-primary">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className={shippingFee === 0 ? "text-secondary font-medium" : ""}>
                  {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-primary">Add ₹{(500 - subtotal).toFixed(0)} more for free delivery!</p>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>
            <Button className="w-full mt-4 gap-2" onClick={() => setLocation("/checkout")} data-testid="button-checkout">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full mt-2" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
