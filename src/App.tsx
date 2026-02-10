import { HomePage } from "./pages/HomePage";
import { NewArrivalsPage } from "./pages/NewArrivalsPage";
import { MenPage } from "./pages/MenPage";
import { WomenPage } from "./pages/WomenPage";
import { KidsPage } from "./pages/KidsPage";
import { UnisexPage } from "./pages/UnisexPage";
import AccountPage from "./pages/AccountPage";
import { CustomDesignPage } from "./pages/CustomDesignPage";
import { CustomProductsPage } from "./pages/CustomProductsPage";
import { CustomProductDetailsPage } from "./pages/CustomProductDetailsPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { TrackOrderPage } from "./pages/TrackOrderPage";
import { PaymentVerificationPage } from "./pages/admin/PaymentVerificationPage";
import { OrdersPage } from "./pages/admin/OrdersPage";
import { CustomizableProductsPage } from "./pages/admin/CustomizableProductsPage";
import { CatalogProductsPage } from "./pages/admin/CatalogProductsPage";
import { CanvasResourcesPage } from "./pages/admin/CanvasResourcesPage";
import { EmployeesPage } from "./pages/admin/EmployeesPage";
import { InventoryPage } from "./pages/admin/InventoryPage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { CashFlowPage } from "./pages/admin/CashFlowPage";
import { ShippingDetailsPage } from "./pages/ShippingDetailsPage";
import { useAuth } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import { useCart } from "./hooks/useCart";
import { useFavorites } from "./hooks/useFavorites";
import { getProductById } from "./utils/productData";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CartDrawer, CartItem } from "./components/CartDrawer";
import {
  FavoritesDrawer,
  FavoriteItem,
} from "./components/FavoritesDrawer";
import { AuthDialog } from "./components/AuthDialog";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

function ProtectedRoute({
  children,
  onRequireAuth,
}: {
  children: React.ReactElement;
  onRequireAuth: () => void;
}) {
  const { isLoggedIn, isHydrating } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only trigger auth modal if hydration is complete and user is not logged in
    if (!isHydrating && !isLoggedIn) {
      onRequireAuth();
    }
  }, [isLoggedIn, isHydrating, onRequireAuth]);

  if (isHydrating) {
    return null; // Or a loading spinner
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

function AdminRoute({
  children,
  onRequireAuth,
}: {
  children: React.ReactElement;
  onRequireAuth: () => void;
}) {
  const { isLoggedIn, user, isHydrating } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only trigger auth modal if hydration is complete and user is not logged in
    if (!isHydrating && !isLoggedIn) {
      onRequireAuth();
    }
  }, [isLoggedIn, isHydrating, onRequireAuth]);

  if (isHydrating) {
    return null; // Or a loading spinner
  }

  if (!isLoggedIn || user?.role !== "admin") {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

function AppContentInner({ isAuthOpen, setIsAuthOpen }: { isAuthOpen: boolean; setIsAuthOpen: (open: boolean) => void }) {
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  
  // Use hooks for cart and favorites (server-side) - these now work because AuthProvider wraps this component
  const { cartItems, addToCart: addToCartHook, updateQuantity, removeItem, clearCart } = useCart();
  const { favorites, toggleFavorite, removeFavorite, isFavorited } = useFavorites();

  // Hide header on Custom Design page
  const showHeader =
    location.pathname !== "/custom-design" &&
    !location.pathname.startsWith("/admin");

  const handleAddToCart = async (productId: string, quantity: number = 1, size?: string, color?: string) => {
    // Try to get product from catalog API first
    try {
      const response = await fetch(`http://localhost:4000/api/catalog-products/${productId}`);
      if (response.ok) {
        const catalogProduct = await response.json();
        addToCartHook(
          catalogProduct.product_id.toString(), 
          catalogProduct.product_name, 
          catalogProduct.base_price, 
          catalogProduct.product_images[0]?.image_url || '', 
          catalogProduct.category, 
          quantity,
          size,
          color
        );
        return;
      }
    } catch (error) {
      console.log('Not a catalog product, checking mock data');
    }
    
    // Fallback to mock product data
    const product = getProductById(productId);
    if (!product) return;
    addToCartHook(productId, product.name, product.price, product.image, product.category, quantity, size, color);
  };

  const handleToggleFavorite = async (productId: string) => {
    // Try to get product from catalog API first
    try {
      const response = await fetch(`http://localhost:4000/api/catalog-products/${productId}`);
      if (response.ok) {
        const catalogProduct = await response.json();
        toggleFavorite(
          catalogProduct.product_id.toString(), 
          catalogProduct.product_name, 
          catalogProduct.base_price, 
          catalogProduct.product_images[0]?.image_url || '', 
          catalogProduct.category
        );
        return;
      }
    } catch (error) {
      console.log('Not a catalog product, checking mock data');
    }
    
    // Fallback to mock product data
    const product = getProductById(productId);
    if (!product) return;
    toggleFavorite(productId, product.name, product.price, product.image, product.category);
  };

  // Legacy handlers for backward compatibility - these are now handled by hooks
  const handleUpdateQuantity = (
    id: string,
    quantity: number,
  ) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        {showHeader && (
          <Header
            onCartClick={() => setIsCartOpen(true)}
            onFavoritesClick={() => setIsFavoritesOpen(true)}
            onLoginClick={() => setIsAuthOpen(true)}
            cartItemsCount={totalItems}
            favoritesCount={favorites.length}
          />
        )}

        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <HomePage
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                favorites={favorites}
              />
            } />
            <Route
              path="/new-arrivals"
              element={
                <NewArrivalsPage
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route
              path="/men"
              element={
                <MenPage
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route
              path="/women"
              element={
                <WomenPage
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route
              path="/kids"
              element={
                <KidsPage
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route
              path="/unisex"
              element={
                <UnisexPage
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProductDetailsPage
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route 
              path="/custom-design" 
              element={
                <ErrorBoundary 
                  fallbackMessage="The design editor encountered an error. Your work may have been auto-saved."
                  onReset={() => {
                    localStorage.removeItem('fabricCanvas');
                  }}
                >
                  <CustomDesignPage />
                </ErrorBoundary>
              }
            />
            <Route path="/custom-products" element={<CustomProductsPage />} />
            <Route path="/custom-product/:id" element={<CustomProductDetailsPage />} />
            <Route 
              path="/checkout" 
              element={
                <CheckoutPage 
                  cartItems={cartItems} 
                  onClearCart={handleClearCart} 
                />
              } 
            />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
            <Route path="/order-tracking" element={<OrderTrackingPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <OrdersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payment-verification"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <PaymentVerificationPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customizable-products"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <CustomizableProductsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <CatalogProductsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/canvas-resources"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <CanvasResourcesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <EmployeesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <InventoryPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <ReportsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/cash-flow"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <CashFlowPage />
                </AdminRoute>
              }
            />
            <Route
              path="/shipping-details/:orderId"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <ShippingDetailsPage />
                </AdminRoute>
              }
            />
          </Routes>
        </main>

        {showHeader && <Footer />}

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
        />

        <FavoritesDrawer
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favorites={favorites}
          onRemoveFavorite={handleRemoveFavorite}
          onAddToCart={handleAddToCart}
        />

        <AuthDialog
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />

        <Toaster />
      </div>
  );
}

function AppContent() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  return (
    <AuthProvider onOpenLoginModal={() => setIsAuthOpen(true)}>
      <AppContentInner isAuthOpen={isAuthOpen} setIsAuthOpen={setIsAuthOpen} />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
