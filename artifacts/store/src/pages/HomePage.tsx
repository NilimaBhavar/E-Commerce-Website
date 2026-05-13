import { Link, useLocation } from "wouter";
import { ArrowRight, Truck, ShieldCheck, Tag, Star } from "lucide-react";
import { useGetFeaturedProducts, useGetOfferProducts, useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";

export function HomePage() {
  const { data: categories, isLoading: catsLoading } = useListCategories();
  const { data: featured, isLoading: featLoading } = useGetFeaturedProducts();
  const { data: offers, isLoading: offersLoading } = useGetOfferProducts();
  const [, setLocation] = useLocation();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-orange-500 to-amber-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-0 right-20 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm">
              India's Favourite Online Store
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              Your Daily<br />Essentials,<br />
              <span className="text-yellow-200">Delivered Fast</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              From Parle-G to Parachute — everything your home needs, from the store that feels like home.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold" onClick={() => setLocation("/products")} data-testid="button-shop-now">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => setLocation("/categories")}>
                Browse Categories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-secondary text-secondary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Truck, text: "Free Delivery over ₹500" },
              { icon: ShieldCheck, text: "100% Secure Payments" },
              { icon: Tag, text: "Best Prices Guaranteed" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2 py-1">
                <Icon className="h-5 w-5 text-secondary-foreground/80" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link href="/categories" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {catsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`} data-testid={`card-category-${cat.id}`}>
                <div className="group relative rounded-xl overflow-hidden bg-accent hover:shadow-md transition-all duration-200 cursor-pointer border border-border">
                  <div className="aspect-square overflow-hidden">
                    {cat.imageUrl && (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-semibold leading-tight line-clamp-2">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.productCount} items</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-muted/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground text-sm">Hand-picked favourites from our store</p>
            </div>
            <Link href="/products" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {featLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featured?.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Offers */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Today's Deals</h2>
            <p className="text-muted-foreground text-sm">Limited time offers — grab them fast</p>
          </div>
          <Link href="/products?sortBy=newest" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {offersLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {offers?.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner CTA */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">New to Tara Shop?</h2>
            <p className="text-secondary-foreground/80">Create an account and enjoy free delivery on your first order!</p>
          </div>
          <Button size="lg" className="bg-white text-secondary hover:bg-white/90 font-bold shrink-0" onClick={() => setLocation("/register")}>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
