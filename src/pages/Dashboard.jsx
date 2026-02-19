import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow">
        <div className="text-sm text-gray-600">Welcome</div>
        <div className="text-2xl font-bold">{user?.name}</div>
        <div className="mt-1 text-sm text-gray-600">
          Role: {user?.role || user?.roles?.[0] || "—"}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
            to="/documents"
          >
            Browse Documents
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <div className="font-semibold">Next</div>
        <p className="mt-2 text-sm text-gray-600">
          Lepas ni kita akan buat Documents List + search/filter + upload/edit/detail.
        </p>
      </div>
    </div>
  );
}
