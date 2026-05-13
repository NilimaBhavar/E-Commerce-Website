import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Heart, User, Store, Menu, X, Search, ChevronDown, LayoutDashboard, LogOut, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGetCart } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: cart } = useGetCart({
    query: { enabled: isAuthenticated }
  });

  const cartCount = cart?.itemCount ?? 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Store className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Dukaan<span className="text-primary">Bazar</span>
            </span>
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pr-10 rounded-full border-border"
                data-testid="input-search"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            <Link href="/products" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/categories" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Categories
            </Link>

            {isAuthenticated && (
              <Link href="/wishlist" className="p-2 text-foreground hover:text-primary transition-colors" data-testid="link-wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            )}

            <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors" data-testid="link-cart">
              <ShoppingCart className="h-5 w-5" />
              {isAuthenticated && cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
                </Badge>
              )}
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2" data-testid="button-user-menu">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-secondary font-medium">
                          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile icons */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Link href="/cart" className="relative p-2">
              <ShoppingCart className="h-5 w-5" />
              {isAuthenticated && cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-primary">
                  {cartCount}
                </Badge>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pr-10"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
            <nav className="space-y-1">
              {[
                { href: "/products", label: "Products" },
                { href: "/categories", label: "Categories" },
                { href: "/cart", label: "Cart" },
                ...(isAuthenticated ? [
                  { href: "/wishlist", label: "Wishlist" },
                  { href: "/orders", label: "My Orders" },
                  { href: "/profile", label: "Profile" },
                ] : [
                  { href: "/login", label: "Login" },
                  { href: "/register", label: "Sign Up" },
                ]),
                ...(isAdmin ? [{ href: "/admin", label: "Admin Dashboard" }] : []),
              ].map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors">
                  {label}
                </Link>
              ))}
              {isAuthenticated && (
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
