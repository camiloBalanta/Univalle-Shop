import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { MarketplaceLayout } from '../layouts/MarketplaceLayout';
import { AuthPage } from '../pages/AuthPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/HomePage';
import { InventoryPage } from '../pages/InventoryPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductPage } from '../pages/ProductPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RecommendationsPage } from '../pages/RecommendationsPage';
import { SearchPage } from '../pages/SearchPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MarketplaceLayout />}>
        <Route index element={<HomePage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="catalog" element={<CategoriesPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['administrativo']} />}>
          <Route path="admin/inventory" element={<InventoryPage />} />
          <Route path="admin/settings" element={<DashboardPage />} />
        </Route>
        <Route path="wishlist" element={<RecommendationsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
