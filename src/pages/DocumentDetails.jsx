import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../auth/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

function getRoleName(user) {
  // support: user.role, user.roles (array of strings), user.roles (array of objects)
  if (user?.role) return String(user.role);
  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    const first = user.roles[0];
    if (typeof first === "string") return first;
    if (first?.name) return String(first.name);
  }
  return "";
}

export default function DocumentDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const role = getRoleName(user).toLowerCase();
  const canEdit = role === "admin" || role === "manager";
  const canDelete = canEdit;

  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function load() {
    setError("");
    setBusy(true);
    try {
      const res = await api.get(`/documents/${id}`);
      setDoc(res.data?.data ?? res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load document.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function download() {
    setError("");
    try {
      setDownloading(true);
      const res = await api.get(`/documents/${id}/download`, {
        responseType: "blob",
        validateStatus: () => true,
      });

      if (res.status !== 200) {
        const text = await res.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.message || `Download failed (${res.status}).`);
        } catch {
          setError(`Download failed (${res.status}).`);
        }
        return;
      }

      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || doc?.file_name || `document_${id}`;

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setError("Download failed.");
    } finally {
      setDownloading(false);
    }
  }

  async function doDelete() {
    setError("");
    try {
      setDeleting(true);
      await api.delete(`/documents/${id}`);
      setConfirmOpen(false);
      nav("/documents");
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed.");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/documents" className="text-sm underline">
          ← Back to list
        </Link>

        <div className="flex gap-2">
          {canEdit && (
            <Link
              to={`/documents/${id}/edit`}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Edit
            </Link>
          )}

          {canDelete && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
            >
              Delete
            </button>
          )}

          <button
            onClick={download}
            disabled={downloading || busy || !doc}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        {busy && <LoadingSpinner label="Loading document..." />}

        {!busy && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!busy && !error && !doc && (
          <div className="text-sm text-gray-600">Document not found.</div>
        )}

        {!busy && doc && (
          <div className="space-y-2">
            <div className="text-2xl font-bold">{doc.title}</div>
            <div className="text-sm text-gray-600">{doc.description || "—"}</div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">Category</div>
                <div className="font-semibold">
                  {doc.category?.title || doc.category_title || "—"}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">Department</div>
                <div className="font-semibold">
                  {doc.department?.name || doc.department_name || "—"}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">Access Level</div>
                <div className="font-semibold">{doc.access_level || "—"}</div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">File</div>
                <div className="font-semibold">{doc.file_name || "—"}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete document?"
        message="This action cannot be undone. Are you sure you want to delete this document?"
        confirmText="Yes, delete"
        cancelText="Cancel"
        danger
        busy={deleting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />
    </div>
  );
}
