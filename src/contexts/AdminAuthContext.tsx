import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type AdminRole = "admin" | "shop" | "coldStorage" | null;

interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  name: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  role: AdminRole;
  loading: boolean;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  getAccessLevel: () => string;
}

const AdminAuthContext = createContext<AdminContextType>({
  admin: null,
  role: null,
  loading: false,
  isAdminAuthenticated: false,
  adminLogin: async () => ({ success: false }),
  adminLogout: () => {},
  getAccessLevel: () => "none",
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  // Credentials database (stored locally)
  const ADMIN_CREDENTIALS = {
    admin: { id: "20262026", password: "20262026", name: "System Admin" },
    shop: { id: "shop@shop.com", password: "shop1234", name: "Shop Manager" },
    coldStorage: { id: "cold@cold.com", password: "cold1234", name: "Cold Storage Manager" },
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminSession");
    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin);
        setAdmin(parsed);
        setRole(parsed.role);
      } catch {
        localStorage.removeItem("adminSession");
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    // Check admin
    if (email === ADMIN_CREDENTIALS.admin.id && password === ADMIN_CREDENTIALS.admin.password) {
      const adminUser: AdminUser = {
        id: ADMIN_CREDENTIALS.admin.id,
        email: ADMIN_CREDENTIALS.admin.id,
        role: "admin",
        name: ADMIN_CREDENTIALS.admin.name,
      };
      setAdmin(adminUser);
      setRole("admin");
      localStorage.setItem("adminSession", JSON.stringify(adminUser));
      setLoading(false);
      return { success: true };
    }

    // Check shop
    if (email === ADMIN_CREDENTIALS.shop.id && password === ADMIN_CREDENTIALS.shop.password) {
      const shopUser: AdminUser = {
        id: ADMIN_CREDENTIALS.shop.id,
        email: ADMIN_CREDENTIALS.shop.id,
        role: "shop",
        name: ADMIN_CREDENTIALS.shop.name,
      };
      setAdmin(shopUser);
      setRole("shop");
      localStorage.setItem("adminSession", JSON.stringify(shopUser));
      setLoading(false);
      return { success: true };
    }

    // Check cold storage
    if (email === ADMIN_CREDENTIALS.coldStorage.id && password === ADMIN_CREDENTIALS.coldStorage.password) {
      const coldStorageUser: AdminUser = {
        id: ADMIN_CREDENTIALS.coldStorage.id,
        email: ADMIN_CREDENTIALS.coldStorage.id,
        role: "coldStorage",
        name: ADMIN_CREDENTIALS.coldStorage.name,
      };
      setAdmin(coldStorageUser);
      setRole("coldStorage");
      localStorage.setItem("adminSession", JSON.stringify(coldStorageUser));
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: false, error: "Invalid credentials" };
  };

  const adminLogout = () => {
    setAdmin(null);
    setRole(null);
    localStorage.removeItem("adminSession");
  };

  const getAccessLevel = (): string => {
    switch (role) {
      case "admin":
        return "Super Admin - Full System Access";
      case "shop":
        return "Shop Manager - Order & Product Management";
      case "coldStorage":
        return "Cold Storage Manager - Storage & Booking Management";
      default:
        return "No Access";
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        role,
        loading,
        isAdminAuthenticated: !!admin,
        adminLogin,
        adminLogout,
        getAccessLevel,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
