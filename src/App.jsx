import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DocumentsList from "./pages/DocumentsList"; 
import UploadDocument from "./pages/UploadDocument";
import DocumentDetails from "./pages/DocumentDetails";
import EditDocument from "./pages/EditDocument";

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/documents" element={<DocumentsList />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/documents/upload" element={<UploadDocument />} />
      <Route path="/documents/:id" element={<DocumentDetails />} />

      <Route path="/documents/:id/edit" element={<EditDocument />} />
    </Routes>
  );
}
