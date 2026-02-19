import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";

function getRoleName(user) {
  if (user?.role) return String(user.role);
  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    const first = user.roles[0];
    if (typeof first === "string") return first;
    if (first?.name) return String(first.name);
  }
  return "";
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const role = useMemo(() => getRoleName(user), [user]);

  function isActive(path) {
    // active for exact or subroutes
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  function linkClass(path) {
    return isActive(path)
      ? "rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
      : "rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100";
  }

  function handleLogout() {
    logout();
    nav("/login");
  }

  // close dropdown when click outside
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-lg font-bold text-gray-900">
            Employee Document Portal
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link to="/documents" className={linkClass("/documents")}>
              Documents
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-xl border px-3 py-2 text-left hover:bg-gray-50"
          >
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-500">Role: {role || "—"}</div>
            </div>

            <span className="text-gray-400">{open ? "▲" : "▼"}</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border bg-white shadow">
              <div className="px-4 py-3 text-xs text-gray-500">
                Signed in as
                <div className="mt-1 font-semibold text-gray-900">
                  {user?.email || "—"}
                </div>
              </div>

              <div className="border-t" />

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav (simple, clean) */}
      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
        <div className="flex gap-2">
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/documents" className={linkClass("/documents")}>
            Documents
          </Link>
        </div>
      </div>
    </nav>
  );
}
