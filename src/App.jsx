// src/App.jsx
import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./hooks/useAuthStore";

// Layouts & Pages
import AppLayout from "./Layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import ChooseLocation from "./pages/ChooseLocation";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminPage from "./pages/AdminPage";
import MyOrders from "./pages/MyOrders";

import { useCartStore } from "./hooks/useCartStore";
// Components
import ProtectedRoute from "./components/ProtectedRoute";
import { useProductStore } from "./hooks/useProductStore";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import ProfileForm from "./pages/ProfileForm";
import MyPrescriptions from "./pages/MyPrescriptions";
import AdminPrescriptions from "./pages/AdminPrescriptions";
import SaleReview from "./pages/SaleReview";
import SaleComplete from "./pages/SaleComplete";
import Checkout from "./pages/Checkout";
import { APP_MODE, isLocalMode, isCustomerMode } from "./config/appMode";

function App() {
  const { isAuthenticated, user, checkingAuth, checkAuth } = useAuthStore();
  const { getCartItems } = useCartStore();
  const authChecked = useRef(false);
  const fetchAllProducts = useProductStore((state) => state.fetchAllProducts);
  const fetchCategories = useProductStore((state) => state.fetchCategories);

  const getAdminRedirect = () => (user?.role === "admin" ? "/dashboard" : "/");

  useEffect(() => {
    if (!authChecked.current) {
      checkAuth();
      authChecked.current = true;
    }
  }, [checkAuth]);

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
  }, []);

  // Remove dependency to prevent infinite re-renders

  useEffect(() => {
    if (!user) return;

    getCartItems();
  }, [getCartItems, user]);
  useEffect(() => {
    const handler = () => {
      // call your zustand action to clear
      useCartStore.getState().clearCart();
    };
    window.addEventListener("hm:cartClearRequested", handler);
    return () => window.removeEventListener("hm:cartClearRequested", handler);
  }, []);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={isCustomerMode ? <SignUpPage /> : <Navigate to="/" replace />} />

        {/* ✅ Protected Routes (requires login) */}
        <Route path="/" element={<ProtectedRoute element={<AppLayout />} />}>
          <Route index element={<Home />} />
          <Route path="contact" element={<Contact />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="location" element={<ChooseLocation />} />
          <Route path="dashboard" element={<AdminPage />} />
          <Route path="cart" element={<CartPage />} />
          {isCustomerMode && <Route path="/checkout" element={<Checkout />} />}

          {/* Customer-only online order history */}
          {isCustomerMode && <Route path="/orders" element={<MyOrders />} />}
          {isCustomerMode && <Route path="/prescriptions" element={<MyPrescriptions />} />}
          {isCustomerMode && <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />}

          {/* Local POS mode routes */}
          {isLocalMode && <Route path="/sale-review" element={<SaleReview />} />}
          {isLocalMode && <Route path="/sale-complete" element={<SaleComplete />} />}

          <Route path="/update-profile" element={<ProfileForm />} />
          {isCustomerMode && <Route path="/purchase-success" element={<PurchaseSuccessPage />} />}
          {isCustomerMode && <Route path="/purchase-cancel" element={<PurchaseCancelPage />} />}
        </Route>

        {/* ✅ Redirect logged-in users away from login/signup */}
        {isAuthenticated && (
          <>
            <Route path="/login" element={<Navigate to={getAdminRedirect()} replace />} />
            {isCustomerMode && (
              <Route path="/signup" element={<Navigate to={getAdminRedirect()} replace />} />
            )}
          </>
        )}

        {/* ✅ Catch-all redirect */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={getAdminRedirect()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
