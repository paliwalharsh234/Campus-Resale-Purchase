import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/RouteGuards';

// Layouts
import MainLayout    from './layouts/MainLayout';
import AuthLayout    from './layouts/AuthLayout';
import AdminLayout   from './layouts/AdminLayout';

// ── Public Pages ──────────────────────────────────────────────────────────────
import LandingPage        from './pages/public/LandingPage';
import LoginPage          from './pages/public/LoginPage';
import RegisterPage       from './pages/public/RegisterPage';
import VerifyEmailPage    from './pages/public/VerifyEmailPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage  from './pages/public/ResetPasswordPage';

// ── Student Pages ─────────────────────────────────────────────────────────────
import MarketplacePage    from './pages/student/MarketplacePage';
import ListingDetailPage  from './pages/student/ListingDetailPage';
import SellItemPage       from './pages/student/SellItemPage';
import EditListingPage    from './pages/student/EditListingPage';
import MyListingsPage     from './pages/student/MyListingsPage';
import SavedItemsPage     from './pages/student/SavedItemsPage';
import MessagesPage       from './pages/student/MessagesPage';
import ProfilePage        from './pages/student/ProfilePage';

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage     from './pages/admin/AdminUsersPage';
import AdminListingsPage  from './pages/admin/AdminListingsPage';
import AdminReportsPage   from './pages/admin/AdminReportsPage';
import AdminCampusesPage  from './pages/admin/AdminCampusesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* ── Root ── */}
          <Route path="/" element={<LandingPage />} />

          {/* ── Guest-only Auth Pages ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          </Route>

          {/* ── Public Auth Pages (no auth required) ── */}
          <Route path="/verify-email/:token"     element={<VerifyEmailPage />} />
          <Route path="/reset-password/:token"   element={<ResetPasswordPage />} />

          {/* ── Protected Student Pages ── */}
          <Route element={<MainLayout />}>
            <Route path="/marketplace"        element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
            <Route path="/listings/:id"       element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
            <Route path="/sell"               element={<ProtectedRoute><SellItemPage /></ProtectedRoute>} />
            <Route path="/listings/:id/edit"  element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
            <Route path="/dashboard"          element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/saved"    element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/:id"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Route>

          {/* ── Admin Pages ── */}
          <Route element={<AdminLayout />}>
            <Route path="/admin"           element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/users"     element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="/admin/listings"  element={<AdminRoute><AdminListingsPage /></AdminRoute>} />
            <Route path="/admin/reports"   element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
            <Route path="/admin/campuses"  element={<AdminRoute><AdminCampusesPage /></AdminRoute>} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
