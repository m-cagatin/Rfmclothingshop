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
import { CustomDesignPreviewPage } from "./pages/CustomDesignPreviewPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { PaymentVerificationPage } from "./pages/admin/PaymentVerificationPage";
import { OrdersPage } from "./pages/admin/OrdersPage";
import { CustomizableProductsPage } from "./pages/admin/CustomizableProductsPage";
import { EmployeesPage } from "./pages/admin/EmployeesPage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { CashFlowPage } from "./pages/admin/CashFlowPage";
import { useAuth } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
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
  children: JSX.Element;
  onRequireAuth: () => void;
}) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      onRequireAuth();
    }
  }, [isLoggedIn, onRequireAuth]);

  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

function AdminRoute({
  children,
  onRequireAuth,
}: {
  children: JSX.Element;
  onRequireAuth: () => void;
}) {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      onRequireAuth();
    }
  }, [isLoggedIn, onRequireAuth]);

  if (!isLoggedIn || user?.role !== "admin") {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(
    [],
  );

  // Hide header on Custom Design page
  const showHeader =
    location.pathname !== "/custom-design" &&
    location.pathname !== "/custom-design-preview" &&
    !location.pathname.startsWith("/admin");

  const handleAddToCart = (productId: string) => {
    // Mock product lookup - in a real app, this would come from a central data store
    const allProducts = [
      {
        id: "1",
        name: "Classic White T-Shirt - Round Neck",
        price: 200,
        image:
          "https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "T-Shirts",
      },
      {
        id: "2",
        name: "Varsity Jacket - Blue & White",
        price: 600,
        image:
          "https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jackets",
      },
      {
        id: "3",
        name: "Oversized Hoodie - Premium Cotton",
        price: 450,
        image:
          "https://images.unsplash.com/photo-1688111421205-a0a85415b224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwaG9vZGllfGVufDF8fHx8MTc2Mjk1MjY5MHww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Hoodies",
      },
      {
        id: "4",
        name: "Denim Jacket - Classic Blue",
        price: 550,
        image:
          "https://images.unsplash.com/photo-1657349038547-b18a07fb4329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHN0eWxlfGVufDF8fHx8MTc2MjkzMjg2MXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jackets",
      },
      {
        id: "5",
        name: "Premium Black Hoodie",
        price: 480,
        image:
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvb2RpZXxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Hoodies",
      },
      {
        id: "6",
        name: "Graphic Print Tee",
        price: 250,
        image:
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwdGVlfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "T-Shirts",
      },
      // Men's products
      {
        id: "7",
        name: "Classic Polo Shirt",
        price: 280,
        image:
          "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBwb2xvJTIwc2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Polo",
      },
      {
        id: "8",
        name: "Casual Button-Up Shirt",
        price: 320,
        image:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBzaGlydHxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Shirts",
      },
      {
        id: "9",
        name: "Slim Fit Chinos",
        price: 420,
        image:
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBjaGlub3N8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Pants",
      },
      {
        id: "10",
        name: "Bomber Jacket",
        price: 680,
        image:
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBib21iZXIlMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jackets",
      },
      // Women's products
      {
        id: "11",
        name: "Floral Summer Dress",
        price: 580,
        image:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGRyZXNzfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Dresses",
      },
      {
        id: "12",
        name: "Oversized Blazer - Black",
        price: 720,
        image:
          "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJsYXplcnxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Blazers",
      },
      {
        id: "13",
        name: "Casual Crop Top",
        price: 180,
        image:
          "https://images.unsplash.com/photo-1564859228273-274232fdb516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGNyb3AlMjB0b3B8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Tops",
      },
      {
        id: "14",
        name: "High-Waisted Jeans",
        price: 480,
        image:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGplYW5zfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jeans",
      },
      {
        id: "15",
        name: "Knit Sweater - Cream",
        price: 420,
        image:
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHN3ZWF0ZXJ8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Sweaters",
      },
      {
        id: "16",
        name: "Leather Jacket - Brown",
        price: 890,
        image:
          "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGxlYXRoZXIlMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jackets",
      },
      // Kids' products
      {
        id: "k1",
        name: "Kids Classic T-Shirt",
        price: 150,
        image:
          "https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "T-Shirts",
      },
      {
        id: "k2",
        name: "Kids Polo Shirt - Classic",
        price: 180,
        image:
          "https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwcG9sbyUyMHNoaXJ0fGVufDF8fHx8MTc2MjkzMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Shirts",
      },
      {
        id: "k3",
        name: "Kids Casual Outfit",
        price: 280,
        image:
          "https://images.unsplash.com/photo-1759313560190-d160c3567170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwZmFzaGlvbiUyMGNhc3VhbHxlbnwxfHx8fDE3NjI5OTA5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Casual",
      },
      {
        id: "k4",
        name: "Kids Stylish Wear",
        price: 320,
        image:
          "https://images.unsplash.com/photo-1695262620869-fedab63bcc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGNsb3RoaW5nJTIwc3R5bGV8ZW58MXx8fHwxNzYyOTkwOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Clothing",
      },
    ];

    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === productId,
      );
      if (existing) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        { ...product, quantity: 1, isNew: false },
      ];
    });
  };

  const handleUpdateQuantity = (
    id: string,
    quantity: number,
  ) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== id),
    );
  };

  const handleToggleFavorite = (productId: string) => {
    // Mock product lookup
    const allProducts = [
      {
        id: "1",
        name: "Classic White T-Shirt - Round Neck",
        price: 200,
        image:
          "https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "T-Shirts",
      },
      {
        id: "2",
        name: "Varsity Jacket - Blue & White",
        price: 600,
        image:
          "https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jackets",
      },
      {
        id: "3",
        name: "Oversized Hoodie - Premium Cotton",
        price: 450,
        image:
          "https://images.unsplash.com/photo-1688111421205-a0a85415b224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwaG9vZGllfGVufDF8fHx8MTc2Mjk1MjY5MHww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Hoodies",
      },
      {
        id: "4",
        name: "Denim Jacket - Classic Blue",
        price: 550,
        image:
          "https://images.unsplash.com/photo-1657349038547-b18a07fb4329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHN0eWxlfGVufDF8fHx8MTc2MjkzMjg2MXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jackets",
      },
      {
        id: "5",
        name: "Premium Black Hoodie",
        price: 480,
        image:
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvb2RpZXxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Hoodies",
      },
      {
        id: "6",
        name: "Graphic Print Tee",
        price: 250,
        image:
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwdGVlfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "T-Shirts",
      },
      // Men's products
      {
        id: "7",
        name: "Classic Polo Shirt",
        price: 280,
        image:
          "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBwb2xvJTIwc2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Polo",
      },
      {
        id: "8",
        name: "Casual Button-Up Shirt",
        price: 320,
        image:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBzaGlydHxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Shirts",
      },
      {
        id: "9",
        name: "Slim Fit Chinos",
        price: 420,
        image:
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBjaGlub3N8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Pants",
      },
      {
        id: "10",
        name: "Bomber Jacket",
        price: 680,
        image:
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBib21iZXIlMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jackets",
      },
      // Women's products
      {
        id: "11",
        name: "Floral Summer Dress",
        price: 580,
        image:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGRyZXNzfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Dresses",
      },
      {
        id: "12",
        name: "Oversized Blazer - Black",
        price: 720,
        image:
          "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJsYXplcnxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Blazers",
      },
      {
        id: "13",
        name: "Casual Crop Top",
        price: 180,
        image:
          "https://images.unsplash.com/photo-1564859228273-274232fdb516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGNyb3AlMjB0b3B8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Tops",
      },
      {
        id: "14",
        name: "High-Waisted Jeans",
        price: 480,
        image:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGplYW5zfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jeans",
      },
      {
        id: "15",
        name: "Knit Sweater - Cream",
        price: 420,
        image:
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHN3ZWF0ZXJ8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Sweaters",
      },
      {
        id: "16",
        name: "Leather Jacket - Brown",
        price: 890,
        image:
          "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGxlYXRoZXIlMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Jackets",
      },
      // Kids' products
      {
        id: "k1",
        name: "Kids Classic T-Shirt",
        price: 150,
        image:
          "https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "T-Shirts",
      },
      {
        id: "k2",
        name: "Kids Polo Shirt - Classic",
        price: 180,
        image:
          "https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwcG9sbyUyMHNoaXJ0fGVufDF8fHx8MTc2MjkzMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Shirts",
      },
      {
        id: "k3",
        name: "Kids Casual Outfit",
        price: 280,
        image:
          "https://images.unsplash.com/photo-1759313560190-d160c3567170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwZmFzaGlvbiUyMGNhc3VhbHxlbnwxfHx8fDE3NjI5OTA5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Casual",
      },
      {
        id: "k4",
        name: "Kids Stylish Wear",
        price: 320,
        image:
          "https://images.unsplash.com/photo-1695262620869-fedab63bcc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGNsb3RoaW5nJTIwc3R5bGV8ZW58MXx8fHwxNzYyOTkwOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        category: "Clothing",
      },
    ];

    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    setFavorites((prev) => {
      const existing = prev.find(
        (item) => item.id === productId,
      );
      if (existing) {
        // Remove from favorites
        return prev.filter((item) => item.id !== productId);
      }
      // Add to favorites
      return [...prev, product];
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.filter((item) => item.id !== id),
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <AuthProvider onOpenLoginModal={() => setIsAuthOpen(true)}>
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
            <Route
              path="/"
              element={
                <HomePage
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route
              path="/preview_page.html"
              element={
                <HomePage
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              }
            />
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
              path="/custom-design"
              element={<CustomDesignPage />}
            />
            <Route
              path="/custom-design-preview"
              element={<CustomDesignPreviewPage />}
            />
            <Route
              path="/custom-products"
              element={<CustomProductsPage />}
            />
            <Route
              path="/custom-product/:id"
              element={<CustomProductDetailsPage />}
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
              path="/checkout"
              element={
                <CheckoutPage
                  cartItems={cartItems}
                  onClearCart={handleClearCart}
                />
              }
            />
            <Route
              path="/order-confirmation/:orderId"
              element={<OrderConfirmationPage />}
            />
            <Route
              path="/order-tracking"
              element={<OrderTrackingPage />}
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <AccountPage />
                </ProtectedRoute>
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
              path="/admin/orders"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <OrdersPage />
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
              path="/admin/employees"
              element={
                <AdminRoute onRequireAuth={() => setIsAuthOpen(true)}>
                  <EmployeesPage />
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
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>

        {/* Footer - hidden on custom-design page */}
        {showHeader && <Footer />}

        {/* Global Drawers and Dialogs */}
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
