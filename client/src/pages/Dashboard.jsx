import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-green-100 text-center">
        <h1 className="text-2xl font-bold text-green-700">Hello, {user.name}</h1>
        <p className="mt-1 text-slate-500">
          Logged in as <strong>{user.role}</strong>
        </p>
        <button
          onClick={logout}
          className="mt-6 rounded-lg border border-green-600 px-4 py-2 font-semibold text-green-700 hover:bg-green-50"
        >
          Log out
        </button>
      </div>
    </main>
  );
}