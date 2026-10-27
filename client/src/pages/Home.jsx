import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Home() {
  const [status, setStatus] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus({ loading: false, data: res.data, error: null }))
      .catch((err) => setStatus({ loading: false, data: null, error: err.message }));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-green-100 text-center">
        <h1 className="text-3xl font-bold text-green-700">KisanSathi</h1>
        <p className="mt-1 text-slate-500">Less Waiting, More Growing.</p>

        <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm">
          {status.loading && <p>Checking server connection...</p>}
          {status.error && <p className="text-red-600">Cannot reach server: {status.error}</p>}
          {status.data && (
            <p className="text-green-800">
              API: OK · Database: <strong>{status.data.database}</strong>
            </p>
          )}
        </div>

        <Link
          to="/login"
          className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}