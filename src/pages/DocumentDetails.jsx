import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DocumentDetails() {
  const { id } = useParams();

  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      setBusy(true);
      try {
        const res = await api.get(`/documents/${id}`);
        setDoc(res.data?.data ?? res.data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load document.");
      } finally {
        setBusy(false);
      }
    })();
  }, [id]);

  async function download() {
  setError("");
  try {
    setDownloading(true);

    const res = await api.get(`/documents/${id}/download`, {
      responseType: "blob",
      validateStatus: () => true, // handle status ourselves
    });

    if (res.status !== 200) {
      // try read JSON error message from blob
      const text = await res.data.text();
      try {
        const json = JSON.parse(text);
        setError(json.message || `Download failed (${res.status}).`);
      } catch {
        setError(`Download failed (${res.status}).`);
      }
      return;
    }

    // filename from header if available
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


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/documents" className="text-sm underline">
          ← Back to list
        </Link>

        <button
          onClick={download}
          disabled={downloading || busy || !doc}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {downloading ? "Downloading..." : "Download"}
        </button>
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

            <div className="mt-3 text-xs text-gray-500">
              Tip: kalau download tak jalan, check backend `download` response header.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
