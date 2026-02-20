import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import ConfirmDialog from "../components/ConfirmDialog";
import { extractErrorMessage } from "../utils/errors";

function roleLower(user) {
  return String(user?.role || user?.roles?.[0] || "").toLowerCase();
}

export default function DocumentsList() {
  const { user } = useAuth();
  const role = roleLower(user);

  const canUpload = role.includes("admin") || role.includes("manager");
  const canEdit = role.includes("admin") || role.includes("manager");
  const canDelete = role.includes("admin") || role.includes("manager");

  const [docs, setDocs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI inputs (user types here)
  const [searchInput, setSearchInput] = useState("");
  const [departmentIdInput, setDepartmentIdInput] = useState("");
  const [categoryIdInput, setCategoryIdInput] = useState("");
  const [sortInput, setSortInput] = useState("newest");

  // Applied filters (only change on-submit)
  const [applied, setApplied] = useState({
    search: "",
    departmentId: "",
    categoryId: "",
    sort: "newest",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    count: 0,
    current_page: 1,
    last_page: 1,
    per_page: 20,
  });

  // UI messages
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Confirm delete dialog
  const [confirm, setConfirm] = useState({
    open: false,
    docId: null,
    title: "",
  });

  async function loadMasterData() {
    const [depRes, catRes] = await Promise.all([
      api.get("/departments"),
      api.get("/categories"),
    ]);

    setDepartments(depRes.data?.data ?? depRes.data ?? []);
    setCategories(catRes.data?.data ?? catRes.data ?? []);
  }

  async function loadDocs(targetPage = page, nextApplied = applied) {
    setError("");
    setBusy(true);

    try {
      const params = {};

      // Pagination
      params.page = targetPage;
      params.per_page = 20;

      // Sort
      params.sort = nextApplied.sort;

      // Search (title + description only, case-insensitive is handled by backend)
      if (nextApplied.search) {
        params.search = nextApplied.search;
        params.q = nextApplied.search;
        params.keyword = nextApplied.search;
      }

      // Filters (AND logic)
      if (nextApplied.categoryId) {
        params.category_id = nextApplied.categoryId;
        params.category = nextApplied.categoryId; // alias
      }

      if (nextApplied.departmentId) {
        params.department_id = nextApplied.departmentId;
        params.department = nextApplied.departmentId; // alias
      }

      const res = await api.get("/documents", { params });

      const data = res.data?.data ?? [];
      setDocs(Array.isArray(data) ? data : []);

      setMeta({
        count: res.data?.count ?? 0,
        current_page: res.data?.current_page ?? targetPage,
        last_page: res.data?.last_page ?? 1,
        per_page: res.data?.per_page ?? 20,
      });
    } catch (e) {
      setDocs([]);
      setMeta({ count: 0, current_page: 1, last_page: 1, per_page: 20 });
      setError(extractErrorMessage(e, "Failed to load documents."));
    } finally {
      setBusy(false);
    }
  }

  // initial load
  useEffect(() => {
    (async () => {
      try {
        await loadMasterData();
      } catch {
        // ignore master data errors
      } finally {
        loadDocs(1, applied);
        setPage(1);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when page changes, fetch using applied filters
  useEffect(() => {
    loadDocs(page, applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function onSubmit(e) {
    e.preventDefault();
    setSuccess("");
    setError("");

    const nextApplied = {
      search: searchInput.trim(),
      departmentId: departmentIdInput,
      categoryId: categoryIdInput,
      sort: sortInput,
    };

    setApplied(nextApplied);
    setPage(1);
    loadDocs(1, nextApplied);
  }

  function clearFilters() {
    setSuccess("");
    setError("");

    setSearchInput("");
    setDepartmentIdInput("");
    setCategoryIdInput("");
    setSortInput("newest");

    const reset = {
      search: "",
      departmentId: "",
      categoryId: "",
      sort: "newest",
    };

    setApplied(reset);
    setPage(1);
    loadDocs(1, reset);
  }

  async function doDelete(docId) {
    setSuccess("");
    setError("");

    try {
      await api.delete(`/documents/${docId}`);
      setSuccess("Document deleted successfully.");
      setConfirm({ open: false, docId: null, title: "" });

      // If deleting last item on a page, go back one page (if possible)
      const newPage = page > 1 && docs.length === 1 ? page - 1 : page;

      setPage(newPage);
      loadDocs(newPage, applied);
    } catch (e) {
      setError(extractErrorMessage(e, "Failed to delete document."));
      setConfirm({ open: false, docId: null, title: "" });
    }
  }

  const showingText = useMemo(() => {
    if (meta.count === 0) return "Showing 0 documents";
    const start = (meta.current_page - 1) * meta.per_page + 1;
    const end = Math.min(meta.current_page * meta.per_page, meta.count);
    return `Showing ${start}-${end} of ${meta.count} documents`;
  }, [meta]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Documents</h1>
          <div className="text-sm text-gray-600">{showingText}</div>
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

      {/* Search + Filter + Sort */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-5">
          {/* Search */}
          <input
            className="rounded-lg border p-3 text-sm md:col-span-2"
            placeholder="Search by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          {/* Filter: category */}
          <select
            className="rounded-lg border p-3 text-sm"
            value={categoryIdInput}
            onChange={(e) => setCategoryIdInput(String(e.target.value))}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || c.name}
              </option>
            ))}
          </select>

          {/* Filter: department */}
          <select
            className="rounded-lg border p-3 text-sm"
            value={departmentIdInput}
            onChange={(e) => setDepartmentIdInput(String(e.target.value))}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="rounded-lg border p-3 text-sm"
            value={sortInput}
            onChange={(e) => setSortInput(String(e.target.value))}
            title="Sort"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>

            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>

            <option value="most_downloaded">Most Downloaded</option>

            <option value="size_desc">File Size (Largest)</option>
            <option value="size_asc">File Size (Smallest)</option>
          </select>

          <div className="flex gap-2 md:col-span-5">
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

      {/* Messages */}
      {!busy && success && <Alert type="success">{success}</Alert>}
      {!busy && error && <Alert type="error">{error}</Alert>}

      {/* Table */}
      <div className="rounded-2xl bg-white p-4 shadow">
        {busy && <LoadingSpinner label="Loading documents..." />}

        {!busy && !error && docs.length === 0 && (
          <Alert type="info">
            No documents found. Try:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use a shorter keyword (partial matching)</li>
              <li>Clear Category / Department filters</li>
              <li>Change sorting to Newest</li>
            </ul>
          </Alert>
        )}

        {!busy && !error && docs.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2">Title</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Department</th>
                    <th className="py-2">Access</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="py-2 font-medium">
                        {d.title}
                        <div className="text-xs text-gray-500">
                          {d.description || ""}
                        </div>
                      </td>

                      <td className="py-2">
                        {d.category?.title || d.category_title || "—"}
                      </td>

                      <td className="py-2">
                        {d.department?.name || d.department_name || "—"}
                      </td>

                      <td className="py-2">{d.access_level || "—"}</td>

                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            className="rounded-lg border px-3 py-1 text-xs"
                            to={`/documents/${d.id}`}
                          >
                            Details
                          </Link>

                          {canEdit && (
                            <Link
                              className="rounded-lg bg-gray-900 px-3 py-1 text-xs text-white"
                              to={`/documents/${d.id}/edit`}
                            >
                              Edit
                            </Link>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-800"
                              onClick={() =>
                                setConfirm({
                                  open: true,
                                  docId: d.id,
                                  title: d.title,
                                })
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-gray-600">
                  Page {meta.current_page} of {meta.last_page} • Total{" "}
                  {meta.count}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border px-3 py-1 text-xs disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border px-3 py-1 text-xs disabled:opacity-50"
                    disabled={page >= meta.last_page}
                    onClick={() =>
                      setPage((p) => Math.min(meta.last_page, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirm.open}
        title="Delete document?"
        message={`This action cannot be undone. Delete "${confirm.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirm({ open: false, docId: null, title: "" })}
        onConfirm={() => doDelete(confirm.docId)}
      />
    </div>
  );
}