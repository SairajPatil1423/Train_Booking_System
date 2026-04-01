import AdminGuard from "@/components/admin-guard";
import AppHeader from "@/components/app-header";

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="flex flex-col min-h-screen bg-[var(--color-surface-soft)]">
        <AppHeader />
        <div className="flex flex-1">
          <main className="flex-1 p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
