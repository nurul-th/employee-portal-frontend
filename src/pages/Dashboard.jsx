import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function getRoleName(user) {
  if (user?.role) return String(user.role);
  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    const first = user.roles[0];
    if (typeof first === "string") return first;
    if (first?.name) return String(first.name);
  }
  return "";
}

export default function Dashboard() {
  const { user } = useAuth();

  const role = getRoleName(user);
  const roleLower = role.toLowerCase();

  // ✅ DEFINE canUpload supaya tak crash lagi
  const canUpload = roleLower.includes("admin") || roleLower.includes("manager");

  return (
    <div className="space-y-4">
      {/* Welcome Card */}
      <div className="rounded-2xl bg-white p-5 shadow">
        <div className="text-sm text-gray-600">Welcome</div>

        <div className="mt-1 text-2xl font-bold">{user?.name || "User"}</div>

        <div className="mt-1 text-sm text-gray-600">
          Role: <span className="font-semibold text-gray-900">{role || "—"}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/documents"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Browse Documents
          </Link>

          {canUpload && (
            <Link
              to="/documents/upload"
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Upload Document
            </Link>
          )}
        </div>
      </div>

      {/* Next Card (safe UL version) */}
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">Next</h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>Browse and search documents using filters.</li>
          <li>View document details and download files.</li>
          <li>Admin / Manager can upload, edit and delete documents.</li>
          <li>Employees can view and download based on access level.</li>
        </ul>
      </div>
    </div>
  );
}
