import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

function roleLower(user) {
  return String(user?.role || user?.roles?.[0] || "").toLowerCase();
}

const ALLOWED_EXT = ["pdf", "docx", "xlsx", "jpg", "jpeg", "png"];

export default function UploadDocument() {
  const { user } = useAuth();
  const nav = useNavigate();

  const role = roleLower(user);
  const canUpload = role.includes("admin") || role.includes("manager");

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [accessLevel, setAccessLevel] = useState("public");
  const [file, setFile] = useState(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [depRes, catRes] = await Promise.all([
          api.get("/departments"),
          api.get("/categories"),
        ]);
        setDepartments(depRes.data?.data ?? depRes.data ?? []);
        setCategories(catRes.data?.data ?? catRes.data ?? []);
      } catch {
        // ignore - form still usable if master data already seeded? but better to show error later if needed
      }
    })();
  }, []);

  if (!canUpload) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          You do not have permission to upload documents.
        </div>
      </div>
    );
  }

  function validate() {
    if (!title.trim()) return "Title is required.";
    if (!categoryId) return "Category is required.";
    if (!departmentId) return "Department is required.";
    if (!accessLevel) return "Access level is required.";
    if (!file) return "File is required.";

    const ext = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return `Invalid file type. Allowed: ${ALLOWED_EXT.join(", ")}`;
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File too large. Max 10MB.";
    }
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setBusy(true);

      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("category_id", categoryId);
      form.append("document_category_id", categoryId)
      form.append("department_id", departmentId);
      form.append("document_department_id", departmentId);
      form.append("access_level", accessLevel);
      form.append("file", file);

      await api.post("/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Upload successful.");
      setTimeout(() => nav("/documents"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Upload Document</h1>
        <button
          type="button"
          onClick={() => nav("/documents")}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Back
        </button>
      </div>

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-5 grid gap-3">
        <div>
          <label className="text-sm font-medium">Title *</label>
          <input
            className="mt-1 w-full rounded-lg border p-3 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Employee Handbook"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full rounded-lg border p-3 text-sm"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="optional"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Category *</label>
            <select
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(String(e.target.value))}
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Department *</label>
            <select
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              value={departmentId}
              onChange={(e) => setDepartmentId(String(e.target.value))}
            >
              <option value="">Select</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Access Level *</label>
            <select
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="department">Department</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">File *</label>
          <input
            className="mt-1 w-full rounded-lg border p-3 text-sm"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="mt-1 text-xs text-gray-500">
            Allowed: PDF, DOCX, XLSX, JPG, PNG. Max 10MB.
          </div>
        </div>

        <button
          disabled={busy}
          className="mt-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? <LoadingSpinner label="Uploading..." /> : "Upload"}
        </button>
      </form>
    </div>
  );
}
