import { useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingCart, Star } from "lucide-react";
import {
  useAddToCart,
  useAddToWishlist,
  useRemoveFromWishlist,
  useGetWishlist,
  getGetCartQueryKey,
  getGetWishlistQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  stock: number;
  categoryName?: string;
  brand?: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addingCart, setAddingCart] = useState(false);

  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const { data: wishlist } = useGetWishlist({
    query: { enabled: isAuthenticated }
  });

  const isWishlisted = wishlist?.some((w) => w.productId === product.id) ?? false;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      return;
    }
    setAddingCart(true);
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Added to cart!", description: product.name });
        setAddingCart(false);
      },
      onError: () => {
        toast({ title: "Failed to add to cart", variant: "destructive" });
        setAddingCart(false);
      },
    });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "Please login to save items", variant: "destructive" });
      return;
    }
    if (isWishlisted) {
      removeFromWishlist.mutate({ productId: product.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
          toast({ title: "Removed from wishlist" });
        },
      });
    } else {
      addToWishlist.mutate({ productId: product.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
          toast({ title: "Saved to wishlist!", description: product.name });
        },
      });
    }
  }

  return (
    <Link href={`/products/${product.id}`} data-testid={`card-product-${product.id}`}>
      <div className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col">
        {/* Discount badge */}
        {product.discount && product.discount > 0 && (
          <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs">
            {product.discount}% off
          </Badge>
        )}
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform"
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className={cn("h-4 w-4", isWishlisted ? "fill-primary text-primary" : "text-muted-foreground")} />
        </button>

        {/* Image */}
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          {product.categoryName && (
            <p className="text-xs text-muted-foreground mb-1 truncate">{product.categoryName}</p>
          )}
          <p className="text-sm font-semibold line-clamp-2 mb-1 flex-1">{product.name}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>

          {/* Stock */}
          {product.stock === 0 && (
            <p className="text-xs text-destructive mb-2">Out of stock</p>
          )}

          <Button
            size="sm"
            className="w-full mt-auto gap-1"
            onClick={handleAddToCart}
            disabled={addingCart || addToCart.isPending || product.stock === 0}
            data-testid={`button-add-cart-${product.id}`}
          >
            <ShoppingCart className="h-3 w-3" />
            {addingCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Link>
  );
}
