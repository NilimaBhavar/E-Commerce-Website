import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useListProducts, useListCategories } from "@/hooks/useApi";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function ProductListPage() {
  const searchStr = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(searchStr);

  const [search, setSearch] = useState(params.get("search") || "");
  const [categoryId, setCategoryId] = useState(params.get("categoryId") || "");
  const [sortBy, setSortBy] = useState(params.get("sortBy") || "newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [page, setPage] = useState(1);

  const { data: categories } = useListCategories();
  const { data: result, isLoading } = useListProducts({
    page,
    limit: 12,
    search: search || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    sortBy: sortBy as never,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 2000 ? priceRange[1] : undefined,
    inStock: inStockOnly ? true : undefined,
  });

  useEffect(() => {
    setSearch(params.get("search") || "");
    setCategoryId(params.get("categoryId") || "");
  }, [searchStr]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input type="radio" id="cat-all" name="category" value="" checked={categoryId === ""} onChange={() => { setCategoryId(""); setPage(1); }} className="accent-primary" />
            <label htmlFor="cat-all" className="text-sm cursor-pointer">All Categories</label>
          </div>
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <input type="radio" id={`cat-${cat.id}`} name="category" value={String(cat.id)} checked={categoryId === String(cat.id)} onChange={() => { setCategoryId(String(cat.id)); setPage(1); }} className="accent-primary" />
              <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer flex-1">{cat.name}</label>
              <span className="text-xs text-muted-foreground">{cat.productCount}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider min={0} max={2000} step={50} value={priceRange} onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1); }} className="mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="instock" checked={inStockOnly} onCheckedChange={(v) => { setInStockOnly(!!v); setPage(1); }} />
        <Label htmlFor="instock" className="cursor-pointer">In Stock Only</Label>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 min-w-48 max-w-sm">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </form>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
          <SelectTrigger className="w-44" data-testid="select-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
          </SelectContent>
        </Select>
        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-4"><FiltersPanel /></div>
          </SheetContent>
        </Sheet>
        {result?.total && (
          <span className="text-sm text-muted-foreground ml-auto">{result.total} products</span>
        )}
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-20 bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</h2>
            <FiltersPanel />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : result?.products?.length ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {result.products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: result.totalPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - page) <= 2)
                    .map(p => (
                      <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    ))}
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(result.totalPages, p + 1))} disabled={page === result.totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg font-semibold mb-2">No products found</p>
              <p className="text-muted-foreground">Try adjusting your filters or search</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setCategoryId(""); setInStockOnly(false); setPriceRange([0, 2000]); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
