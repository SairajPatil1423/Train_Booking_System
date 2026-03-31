"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearCredentials } from "@/features/auth/authSlice";
import { logoutUser } from "@/features/auth/authService";

const publicLinks = [
  { href: "/", label: "Home" },
];

const privateLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Search" },
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
    <header className="sticky top-0 z-30 border-b border-black/8 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              RailYatra
            </span>
            <span className="text-sm text-[var(--color-muted)]">
              Train booking platform
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-ink)]"
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
              <div className="hidden rounded-full border border-black/8 bg-[var(--color-panel)] px-4 py-2 text-sm md:block">
                <span className="font-medium text-[var(--color-ink)]">
                  {user?.email || "Signed in"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-black/5"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
