"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { clearCredentials } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authService";
import { getUserDisplayName } from "@/utils/user-formatters";

const publicLinks = [{ href: "/", label: "Home" }];

const privateLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/search", label: "Search trains" },
  { href: "/bookings", label: "My bookings" },
  { href: "/account", label: "Profile" },
];

const adminLinks = [
  { href: "/admin", label: "Admin Panel" },
  { href: "/admin/trains", label: "Trains" },
  { href: "/admin/schedules", label: "Schedules" },
  { href: "/admin/coaches", label: "Coaches" },
  { href: "/admin/fares", label: "Fares" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const displayName = getUserDisplayName(user);

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

  const isAdminRoute = pathname.startsWith("/admin");
  const links = isAuthenticated
    ? (user?.role === "admin" ? [...adminLinks] : [...privateLinks])
    : [...publicLinks];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[rgba(255,255,255,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between gap-4">
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

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <div className="hidden rounded-full border border-[var(--color-line)] bg-[#fdfefe] px-4 py-2 text-sm text-[var(--color-ink)] shadow-[0_10px_26px_rgba(16,33,49,0.04)] md:block">
                  {displayName}
                </div>
                <Button
                  type="button"
                  onClick={handleLogout}
                  variant="danger"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} href="/register" variant="secondary" size="sm">
                  Register
                </Button>
                <Button as={Link} href="/login" size="sm">
                  Login
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 md:hidden">
          <div className="min-w-0">
            {isAuthenticated ? (
              <Badge variant="neutral" className="max-w-full truncate px-3 py-2 normal-case tracking-normal">
                {displayName}
              </Badge>
            ) : (
              <Badge variant="neutral" className="px-3 py-2 normal-case tracking-normal">
                Guest view
              </Badge>
            )}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="grid grid-cols-2 gap-3 md:hidden">
            <Button as={Link} href="/register" variant="secondary" className="w-full">
              Register
            </Button>
            <Button as={Link} href="/login" className="w-full">
              Login
            </Button>
          </div>
        ) : null}

        {isAuthenticated ? (
          <div className="md:hidden">
            <Button
              type="button"
              onClick={handleLogout}
              variant="danger"
              className="w-full"
            >
              Logout
            </Button>
          </div>
        ) : null}

        <nav className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--color-panel-dark)] text-white shadow-[0_10px_24px_rgba(12,79,129,0.18)]"
                    : "border border-[var(--color-line)] bg-white text-[var(--color-muted-strong)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
