import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="border-b border-green-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-green-700">
          KisanSathi
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link to="/centers" className="hover:text-green-700">
            Centers
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-green-600 px-3 py-1.5 font-semibold text-white hover:bg-green-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-700">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-green-600 px-3 py-1.5 font-semibold text-white hover:bg-green-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}