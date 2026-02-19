import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    await logout();
    nav("/login");
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/dashboard" className="font-bold text-lg">
          Employee Document Portal
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold">{user?.name || "User"}</div>
            <div className="text-xs text-gray-600">
              Role: {user?.role || user?.roles?.[0] || "—"}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
