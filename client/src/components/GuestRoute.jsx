import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "operator") return <Navigate to="/operator" replace />;
    return <Navigate to="/farmer" replace />;
  }

  return children;
}
