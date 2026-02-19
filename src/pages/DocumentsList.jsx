import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

function roleLower(user) {
  return String(user?.role || user?.roles?.[0] || "").toLowerCase();
}

export default function DocumentsList() {
  const { user } = useAuth();
  const role = roleLower(user);
  const canUpload = role.includes("admin") || role.includes("manager");

  const [docs, setDocs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  async function loadMasterData() {
    const [depRes, catRes] = await Promise.all([
      api.get("/departments"),
      api.get("/categories"),
    ]);
    setDepartments(depRes.data?.data ?? depRes.data ?? []);
    setCategories(catRes.data?.data ?? catRes.data ?? []);
  }

  async function loadDocs() {
    setError("");
    setBusy(true);

    try {
      const params = {};
      if (search) params.search = search;
      if (departmentId) params.department_id = departmentId;
      if (categoryId) params.category_id = categoryId;

      const res = await api.get("/documents", { params });

      // tolerate pagination / direct array
      const data = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load documents.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await loadMasterData();
      } catch {
        // ignore master data errors
      } finally {
        loadDocs();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    loadDocs();
  }

  function clearFilters() {
    setSearch("");
    setDepartmentId("");
    setCategoryId("");
    setTimeout(loadDocs, 0);
  }

  const count = useMemo(() => docs.length, [docs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Documents</h1>
          <div className="text-sm text-gray-600">Showing {count} documents</div>
        </div>

        {canUpload && (
          <Link
            to="/documents/upload"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Upload
          </Link>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4">
          <input
            className="rounded-lg border p-3 text-sm md:col-span-2"
            placeholder="Search by title/description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="rounded-lg border p-3 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || c.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border p-3 text-sm"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2 md:col-span-4">
            <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        {busy && <LoadingSpinner label="Loading documents..." />}

        {!busy && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!busy && !error && docs.length === 0 && (
          <div className="text-sm text-gray-600">
            No documents found. Try different keywords or clear filters.
          </div>
        )}

        {!busy && !error && docs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Title</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Department</th>
                  <th className="py-2">Access</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="py-2 font-medium">
                      <Link className="underline" to={`/documents/${d.id}`}>
                        {d.title}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {d.description || ""}
                      </div>
                    </td>
                    <td className="py-2">{d.category?.title || d.category_title || "—"}</td>
                    <td className="py-2">{d.department?.name || d.department_name || "—"}</td>
                    <td className="py-2">{d.access_level || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
