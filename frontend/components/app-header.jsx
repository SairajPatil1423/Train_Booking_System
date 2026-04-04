"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import ThemeToggle from "@/components/ui/theme-toggle";
import { clearCredentials } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authService";
import { getUserDisplayName } from "@/utils/user-formatters";
import { cn } from "@/utils/cn";

const publicLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/search", label: "Search trains" },
];

const privateLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/search", label: "Search trains" },
  { href: "/bookings", label: "My bookings" },
  { href: "/account", label: "Profile" },
];

const adminLinks = [
  { href: "/admin", label: "Admin Panel" },
  { href: "/admin/bookings", label: "All bookings" },
  { href: "/admin/users", label: "Create admin" },
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
  const homeHref = user?.role === "admin" ? "/admin" : "/dashboard";

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
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface)_76%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <Link href={homeHref} className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-[var(--gradient-brand)] text-sm font-black tracking-[0.18em] text-white shadow-[var(--shadow-button)]">
                RY
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--color-accent)]">
                  RailYatra
                </div>
                <div className="mt-1 truncate text-sm font-medium text-[var(--color-muted)]">
                  Reservation workspace
                </div>
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface-strong)_88%,transparent)] p-1 shadow-[var(--shadow-soft)] md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-button)]"
                      : "text-[var(--color-muted-strong)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-ink)]"
                  }`)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <div className="hidden items-center gap-3 rounded-full border border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface-strong)_88%,transparent)] px-3 py-2 text-sm shadow-[var(--shadow-soft)] md:flex">
                  <span className="max-w-[12rem] truncate font-medium text-[var(--color-ink)]">{displayName}</span>
                </div>
                <Button type="button" onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
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

        <div className="md:hidden">
          <ThemeToggle className="w-full" />
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
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-button)]"
                    : "border border-[var(--color-line)] bg-[var(--color-panel-strong)] text-[var(--color-muted-strong)]"
                }`)}
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
