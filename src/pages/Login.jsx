import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib isi.");
      return;
    }

    try {
      setBusy(true);
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-gray-600">
          Use seeded users (password: <span className="font-semibold">password</span>)
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@abc.test"
              type="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              type="password"
            />
          </div>

          <button
            disabled={busy}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? <LoadingSpinner label="Signing in..." /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
