import AuthGuard from "@/components/auth-guard";
import AppHeader from "@/components/app-header";

export default function UserLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
