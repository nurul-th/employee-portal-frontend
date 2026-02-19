import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

function roleLower(user) {
  return String(user?.role || user?.roles?.[0] || "").toLowerCase();
}

export default function EditDocument() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const role = roleLower(user);
  const canEdit = role.includes("admin") || role.includes("manager");

  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  // form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [accessLevel, setAccessLevel] = useState("public");

  useEffect(() => {
    if (!canEdit) return;

    (async () => {
      setError("");
      setBusy(true);
      try {
        const [docRes, depRes, catRes] = await Promise.all([
          api.get(`/documents/${id}`),
          api.get("/departments"),
          api.get("/categories"),
        ]);

        const doc = docRes.data?.data ?? docRes.data;

        setDepartments(depRes.data?.data ?? depRes.data ?? []);
        setCategories(catRes.data?.data ?? catRes.data ?? []);

        setTitle(doc?.title || "");
        setDescription(doc?.description || "");
        setAccessLevel(doc?.access_level || "public");

        // tolerate different shapes
        const cat = doc?.category_id ?? doc?.category?.id ?? "";
        const dep = doc?.department_id ?? doc?.department?.id ?? "";
        setCategoryId(cat ? String(cat) : "");
        setDepartmentId(dep ? String(dep) : "");
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load document.");
      } finally {
        setBusy(false);
      }
    })();
  }, [id, canEdit]);

  if (!canEdit) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          You do not have permission to edit documents.
        </div>
        <div className="mt-3">
          <Link className="underline text-sm" to={`/documents/${id}`}>
            Back to document
          </Link>
        </div>
      </div>
    );
  }

  function validate() {
    if (!title.trim()) return "Title is required.";
    if (!categoryId) return "Category is required.";
    if (!departmentId) return "Department is required.";
    if (!accessLevel) return "Access level is required.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setSaving(true);

      // send both keys
      const payload = {
        title,
        description,
        access_level: accessLevel,
        category_id: categoryId,
        document_category_id: categoryId,
        department_id: departmentId,
        document_department_id: departmentId,
      };

      await api.patch(`/documents/${id}`, payload);

      nav(`/documents/${id}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit Document</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => nav(`/documents/${id}`)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Back
          </button>
        </div>
      </div>

      {busy && (
        <div className="mt-4">
          <LoadingSpinner label="Loading..." />
        </div>
      )}

      {!busy && error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!busy && (
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-lg border p-3 text-sm"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <button
            disabled={saving}
            className="mt-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? <LoadingSpinner label="Saving..." /> : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}
