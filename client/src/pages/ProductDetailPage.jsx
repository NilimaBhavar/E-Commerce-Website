"use strict";
import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Star, Heart, ShoppingCart, Package, Truck, Shield } from "lucide-react";
import {
  useGetProduct,
  useListReviews,
  useCreateReview,
  useAddToCart,
  useAddToWishlist,
  useRemoveFromWishlist,
  useGetWishlist,
  getGetProductQueryKey,
  getGetCartQueryKey,
  getGetWishlistQueryKey,
  getListReviewsQueryKey
} from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
function StarRating({ value, onChange, readonly = false }) {
  return <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => <button
    key={s}
    type="button"
    onClick={() => !readonly && onChange?.(s)}
    className={readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}
  >
          <Star className={cn("h-5 w-5", s <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
        </button>)}
    </div>;
}
export function ProductDetailPage() {
  const { id } = useParams();
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) }
  });
  const { data: reviews } = useListReviews(id, {
    query: { enabled: !!id, queryKey: getListReviewsQueryKey(id) }
  });
  const { data: wishlist } = useGetWishlist({ query: { enabled: isAuthenticated } });
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const createReview = useCreateReview();
  const isWishlisted = wishlist?.some((w) => w.productId === id) ?? false;
  function handleAddToCart() {
    if (!isAuthenticated) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      return;
    }
    addToCart.mutate({ data: { productId: id, quantity } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Added to cart!", description: `${product?.name} (x${quantity})` });
      },
      onError: () => toast({ title: "Failed to add to cart", variant: "destructive" })
    });
  }
  function handleWishlist() {
    if (!isAuthenticated) {
      toast({ title: "Please login to save items", variant: "destructive" });
      return;
    }
    if (isWishlisted) {
      removeFromWishlist.mutate({ productId: id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
          toast({ title: "Removed from wishlist" });
        }
      });
    } else {
      addToWishlist.mutate({ productId: id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
          toast({ title: "Saved to wishlist!" });
        }
      });
    }
  }
  function handleReview(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "Please login to write a review", variant: "destructive" });
      return;
    }
    createReview.mutate({ productId: id, data: { rating: reviewRating, comment: reviewComment } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(id) });
        toast({ title: "Review submitted!" });
        setReviewComment("");
        setReviewRating(5);
      },
      onError: () => toast({ title: "Failed to submit review", variant: "destructive" })
    });
  }
  if (isLoading) {
    return <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4"><Skeleton className="h-8" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-20" /><Skeleton className="h-12" /></div>
        </div>
      </div>;
  }
  if (!product) {
    return <div className="container mx-auto px-4 py-20 text-center"><p className="text-xl">Product not found</p><Button asChild className="mt-4"><Link href="/products">Browse Products</Link></Button></div>;
  }
  return <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/products"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Products</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {
    /* Image */
  }
        <div className="relative">
          {product.discount && product.discount > 0 && <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground">{product.discount}% OFF</Badge>}
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {
    /* Details */
  }
        <div>
          {product.categoryName && <Badge variant="secondary" className="mb-3">{product.categoryName}</Badge>}
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          {product.brand && <p className="text-muted-foreground text-sm mb-3">by {product.brand}</p>}

          <div className="flex items-center gap-3 mb-4">
            <StarRating value={Math.round(product.rating)} readonly />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>}
            {product.discount && product.discount > 0 && <span className="text-sm font-semibold text-primary">Save ₹{(product.originalPrice - product.price).toFixed(0)}</span>}
          </div>

          <div className="mb-4">
            {product.stock > 0 ? <p className="text-secondary font-medium text-sm flex items-center gap-1"><Package className="h-4 w-4" /> In Stock ({product.stock} available)</p> : <p className="text-destructive font-medium text-sm">Out of Stock</p>}
          </div>

          {product.description && <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{product.description}</p>}

          {
    /* Quantity */
  }
          <div className="flex items-center gap-3 mb-4">
            <Label>Quantity:</Label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted transition-colors">-</button>
              <span className="px-4 py-2 font-medium border-x border-border">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-muted transition-colors">+</button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button className="flex-1 gap-2" size="lg" onClick={handleAddToCart} disabled={product.stock === 0 || addToCart.isPending} data-testid="button-add-cart">
              <ShoppingCart className="h-5 w-5" /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Button variant="outline" size="lg" onClick={handleWishlist} className={cn(isWishlisted && "border-primary text-primary")} data-testid="button-wishlist">
              <Heart className={cn("h-5 w-5", isWishlisted && "fill-primary")} />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
    { icon: Truck, label: "Free Delivery", sub: "Above \u20B9500" },
    { icon: Shield, label: "Secure Pay", sub: "100% safe" },
    { icon: Package, label: "Easy Returns", sub: "7-day policy" }
  ].map(({ icon: Icon, label, sub }) => <div key={label} className="bg-muted/60 rounded-lg p-2">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>)}
          </div>
        </div>
      </div>

      {
    /* Reviews */
  }
      <Separator className="mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
          {!reviews?.length ? <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p> : <div className="space-y-4">
              {reviews.map((review) => <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <StarRating value={review.rating} readonly />
                  {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
                </div>)}
            </div>}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-6">Write a Review</h2>
          {!isAuthenticated ? <div className="bg-muted/50 rounded-xl p-6 text-center">
              <p className="text-muted-foreground mb-3">Login to write a review</p>
              <Button asChild><Link href="/login">Sign In</Link></Button>
            </div> : <form onSubmit={handleReview} className="space-y-4">
              <div>
                <Label className="mb-2 block">Your Rating</Label>
                <StarRating value={reviewRating} onChange={setReviewRating} />
              </div>
              <div>
                <Label htmlFor="comment" className="mb-2 block">Comment (optional)</Label>
                <Textarea id="comment" placeholder="Share your experience with this product..." rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} data-testid="textarea-review" />
              </div>
              <Button type="submit" disabled={createReview.isPending} data-testid="button-submit-review">
                {createReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </form>}
        </div>
      </div>
    </div>;
}
