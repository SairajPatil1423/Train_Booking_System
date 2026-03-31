"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearCredentials } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authService";

const publicLinks = [{ href: "/", label: "Home" }];

const privateLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Search trains" },
  { href: "/bookings", label: "My bookings" },
  { href: "/account", label: "Profile" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      dispatch(clearCredentials());
      router.push("/login");
    }
  }

  const links = isAuthenticated ? privateLinks : publicLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[rgba(255,255,255,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
        <Link href="/" className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--color-accent)]">
            RailYatra
          </div>
          <div className="mt-1 truncate text-sm font-medium text-[var(--color-muted)]">
            Online train reservation
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-[var(--color-line)] bg-[#fdfefe] p-1 shadow-[0_10px_28px_rgba(16,33,49,0.05)] md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--color-panel-dark)] text-white shadow-[0_10px_24px_rgba(12,79,129,0.18)]"
                    : "text-[var(--color-muted-strong)] hover:bg-[#f2f8fe] hover:text-[var(--color-ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-[var(--color-line)] bg-[#fdfefe] px-4 py-2 text-sm text-[var(--color-ink)] shadow-[0_10px_26px_rgba(16,33,49,0.04)] md:block">
                {user?.email || "Signed in"}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="danger-button px-5 py-2.5 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="secondary-button px-5 py-2.5 text-sm">
                Register
              </Link>
              <Link href="/login" className="primary-button px-5 py-2.5 text-sm">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
