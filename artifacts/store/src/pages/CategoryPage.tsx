import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export function CategoryPage() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Categories</h1>
        <p className="text-muted-foreground">Browse our wide selection of daily essentials</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/products?categoryId=${cat.id}`} data-testid={`card-category-${cat.id}`}>
              <div className="group relative rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="aspect-video overflow-hidden bg-muted">
                  {cat.imageUrl && (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-base mb-1">{cat.name}</h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{cat.productCount} products</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {cat.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{cat.description}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
