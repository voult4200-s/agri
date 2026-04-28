import { Navigate } from "react-router-dom";
import { useAdminAuth, AdminRole } from "@/contexts/AdminAuthContext";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requiredRole?: AdminRole;
}

export default function ProtectedAdminRoute({ children, requiredRole }: ProtectedAdminRouteProps) {
  const { isAdminAuthenticated, role, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}
