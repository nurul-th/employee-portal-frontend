export default function Alert({ type = "info", children }) {
  const map = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-gray-200 bg-gray-50 text-gray-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  };

  return (
    <div className={`rounded-lg border p-3 text-sm ${map[type] || map.info}`}>
      {children}
    </div>
  );
}