import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

function roleLower(user) {
  return String(user?.role || user?.roles?.[0] || "").toLowerCase();
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const v = n / Math.pow(1024, i);
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = roleLower(user);

  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  const [recentUploads, setRecentUploads] = useState([]);
  const [topDownloads, setTopDownloads] = useState([]);

  const displayRole = useMemo(() => {
    const r = user?.roles?.[0] || user?.role || "";
    return r ? String(r) : "—";
  }, [user]);

  async function loadActivity() {
    setError("");
    setBusy(true);

    try {
      const res = await api.get("/dashboard/activity");

      const ru = res.data?.recent_uploads ?? [];
      const td = res.data?.top_downloads ?? [];

      setRecentUploads(Array.isArray(ru) ? ru : []);
      setTopDownloads(Array.isArray(td) ? td : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load dashboard activity.");
      setRecentUploads([]);
      setTopDownloads([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="text-sm text-gray-600">Welcome</div>
        <div className="mt-1 text-2xl font-bold">{user?.name || "—"}</div>
        <div className="mt-1 text-sm text-gray-600">Role: {displayRole}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/documents"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Browse Documents
          </Link>

          <button
            type="button"
            onClick={loadActivity}
            className="rounded-lg border px-4 py-2 text-sm"
            title="Refresh"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Activity section */}
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <div className="text-sm text-gray-600">
              Latest uploads and most downloaded documents
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Signed in as{" "}
            <span className="font-medium text-gray-700">
              {user?.name || "—"}
            </span>{" "}
            ({role || "—"})
          </div>
        </div>

        <div className="mt-4">
          {busy && <LoadingSpinner label="Loading activity..." />}

          {!busy && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {!busy && !error && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent uploads */}
              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-semibold">Recent uploads</div>
                  <div className="text-xs text-gray-500">(latest 5)</div>
                </div>

                {recentUploads.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    No recent uploads available.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {recentUploads.map((d) => (
                      <li key={d.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/documents/${d.id}`}
                            className="block truncate font-medium hover:underline"
                            title={d.title}
                          >
                            {d.title}
                          </Link>

                          <div className="mt-1 text-xs text-gray-500">
                            Uploaded: {formatDateTime(d.created_at)}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            Size: {formatBytes(d.file_size)} • Downloads:{" "}
                            {Number(d.download_count ?? 0)}
                          </div>
                        </div>

                        <Link
                          to={`/documents/${d.id}`}
                          className="shrink-0 rounded-lg border px-3 py-1 text-xs"
                        >
                          View
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Top downloads */}
              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-semibold">Top downloads</div>
                  <div className="text-xs text-gray-500">(top 5)</div>
                </div>

                {topDownloads.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    No download stats available yet.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {topDownloads.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/documents/${d.id}`}
                            className="block truncate font-medium hover:underline"
                            title={d.title}
                          >
                            {d.title}
                          </Link>
                          <div className="mt-1 text-xs text-gray-500">
                            Downloads: {Number(d.download_count ?? 0)}
                          </div>
                        </div>

                        <Link
                          to={`/documents/${d.id}`}
                          className="shrink-0 rounded-lg border px-3 py-1 text-xs"
                        >
                          View
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next section */}
      <div className="rounded-2xl bg-white p-6 shadow">
        <h3 className="text-base font-bold">Employee Portal</h3>
        <p className="mt-1 text-sm text-gray-600">
          Display, Upload and Download documents here.
        </p>
      </div>
    </div>
  );
}