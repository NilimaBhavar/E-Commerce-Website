"use strict";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import {
  useGetWishlist,
  useRemoveFromWishlist,
  useAddToCart,
  getGetWishlistQueryKey,
  getGetCartQueryKey
} from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
export function WishlistPage() {
  const { data: wishlist, isLoading } = useGetWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  function handleRemove(productId) {
    removeFromWishlist.mutate({ productId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: "Removed from wishlist" });
      }
    });
  }
  function handleMoveToCart(productId, name) {
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        removeFromWishlist.mutate({ productId }, {
          onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() })
        });
        toast({ title: "Moved to cart!", description: name });
      }
    });
  }
  if (isLoading) {
    return <div className="container mx-auto px-4 py-10"><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div></div>;
  }
  return <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Heart className="h-7 w-7 text-primary" /> My Wishlist
      </h1>
      <p className="text-muted-foreground mb-8">{wishlist?.length ?? 0} saved items</p>

      {!wishlist?.length ? <div className="text-center py-20">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save items you love to your wishlist</p>
          <Button asChild><Link href="/products">Browse Products</Link></Button>
        </div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden" data-testid={`card-wishlist-${item.id}`}>
              <Link href={`/products/${item.productId}`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              </Link>
              <div className="p-3">
                {item.discount && <Badge className="bg-primary text-primary-foreground text-xs mb-1">{item.discount}% off</Badge>}
                <Link href={`/products/${item.productId}`}>
                  <p className="text-sm font-semibold line-clamp-2 hover:text-primary transition-colors mb-1">{item.productName}</p>
                </Link>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs">{item.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold">₹{item.price}</span>
                  {item.originalPrice && item.originalPrice > item.price && <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice}</span>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1" onClick={() => handleMoveToCart(item.productId, item.productName)} disabled={item.stock === 0}>
                    <ShoppingCart className="h-3 w-3" /> {item.stock === 0 ? "Out of stock" : "Add to Cart"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRemove(item.productId)} data-testid={`button-remove-wishlist-${item.id}`}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
}
