import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";

// Components
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";

// Pages
import { HomePage } from "@/pages/HomePage";
import { ProductListPage } from "@/pages/ProductListPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { WishlistPage } from "@/pages/WishlistPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";

// Admin Pages
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/products" component={ProductListPage} />
        <Route path="/products/:id" component={ProductDetailPage} />
        <Route path="/categories" component={CategoryPage} />
        <Route path="/cart" component={CartPage} />
        
        {/* Auth routes */}
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        
        {/* Public static pages */}
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />

        {/* Protected Customer Routes */}
        <Route path="/checkout">
          <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        </Route>
        <Route path="/wishlist">
          <ProtectedRoute><WishlistPage /></ProtectedRoute>
        </Route>
        <Route path="/orders">
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        </Route>
        <Route path="/orders/:id">
          <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <AdminRoute><AdminDashboardPage /></AdminRoute>
        </Route>
        <Route path="/admin/products">
          <AdminRoute><AdminProductsPage /></AdminRoute>
        </Route>
        <Route path="/admin/orders">
          <AdminRoute><AdminOrdersPage /></AdminRoute>
        </Route>
        <Route path="/admin/users">
          <AdminRoute><AdminUsersPage /></AdminRoute>
        </Route>
        <Route path="/admin/categories">
          <AdminRoute><AdminCategoriesPage /></AdminRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
