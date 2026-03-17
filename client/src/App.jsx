import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import ContactPage from "./pages/ContactPage/ContactPage";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage";
import AdminLayout from "./components/AdminLayout/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage/AdminDashboardPage";
import AdminProductsPage from "./pages/AdminProductsPage/AdminProductsPage";
import AdminInquiriesPage from "./pages/AdminInquiriesPage/AdminInquiriesPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage/AdminCategoriesPage";
import AdminLoginPage from "./pages/AdminLoginPage/AdminLoginPage";
import RequireAdmin from "./components/RequireAdmin/RequireAdmin";
import PublicLayout from "./layouts/PublicLayout";
import AdminAuthLayout from "./layouts/AdminAuthLayout";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
      </Route>

      <Route element={<AdminAuthLayout />}>
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      <Route path="/admin" element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
