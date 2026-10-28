import { useAuth } from "../context/AuthContext";

export default function DashboardShell({ title, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-xl font-bold text-green-700">KisanSathi</span>
          <div className="flex items-center gap-3 text-sm">
            <span>{user.name}</span>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-green-800">
              {user.role}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-green-600 px-3 py-1.5 font-semibold text-green-700 hover:bg-green-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </main>
    </div>
  );
}