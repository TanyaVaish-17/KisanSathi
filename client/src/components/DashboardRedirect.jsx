import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const homePaths = {
  farmer: "/farmer",
  operator: "/operator",
  admin: "/admin",
};

export default function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePaths[user.role]} replace />;
}