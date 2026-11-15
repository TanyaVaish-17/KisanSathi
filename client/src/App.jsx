import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load pages for fast bundle loading
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Centers = lazy(() => import("./pages/Centers"));
const CenterDetails = lazy(() => import("./pages/CenterDetails"));
const QueueBoard = lazy(() => import("./pages/QueueBoard"));
const Profile = lazy(() => import("./pages/Profile"));
const FarmerDashboard = lazy(() => import("./pages/FarmerDashboard"));
const OperatorDashboard = lazy(() => import("./pages/OperatorDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCenters = lazy(() => import("./pages/admin/AdminCenters"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminCounters = lazy(() => import("./pages/admin/AdminCounters"));
const AdminOperators = lazy(() => import("./pages/admin/AdminOperators"));
const BookToken = lazy(() => import("./pages/BookToken"));
const TokensList = lazy(() => import("./pages/TokensList"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Forbidden = lazy(() => import("./pages/Forbidden"));

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import DashboardRedirect from "./components/DashboardRedirect";

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest-950 border-t-transparent" />
        <span className="font-mono text-xs uppercase tracking-wider text-slate-muted">
          Loading page...
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/centers" element={<Centers />} />
        <Route path="/centers/:id" element={<CenterDetails />} />
        <Route path="/centers/:id/queue" element={<QueueBoard />} />

        {/* Guest Only Auth Pages */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* Authenticated Dashboard Router */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* User Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Farmer Pages */}
        <Route
          path="/farmer"
          element={
            <ProtectedRoute roles={["farmer", "admin"]}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book"
          element={
            <ProtectedRoute roles={["farmer", "admin"]}>
              <BookToken />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tokens"
          element={
            <ProtectedRoute roles={["farmer", "admin"]}>
              <TokensList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tokens/:id"
          element={
            <ProtectedRoute roles={["farmer", "admin"]}>
              <TokensList />
            </ProtectedRoute>
          }
        />

        {/* Operator Console */}
        <Route
          path="/operator"
          element={
            <ProtectedRoute roles={["operator", "admin"]}>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Pages */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/centers"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminCenters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/counters"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminCounters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/operators"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminOperators />
            </ProtectedRoute>
          }
        />

        {/* Error Pages */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
