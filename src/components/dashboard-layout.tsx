// components/dashboard-layout.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Activity,
  Share2,
  User,
  Heart,
  Menu,
  X,
  LogOut,
  Settings,
  Home,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Vitals", href: "/vitals", icon: Activity },
  { name: "Shared Access", href: "/shared", icon: Share2 },
  { name: "Profile", href: "/profile", icon: User },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  // Check if profile is complete on mount
  useEffect(() => {
    if (user) {
      checkProfileComplete();
    }
  }, [user]);

  const checkProfileComplete = async () => {
    try {
      const token = localStorage.getItem("healthwallet-token");
      const response = await fetch("/api/profile/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileComplete(data.profileComplete);

        // Only redirect if profile is incomplete AND we're not already on profile page
        if (
          !data.profileComplete &&
          pathname !== "/profile" &&
          !pathname.includes("/profile") &&
          pathname !== "/dashboard" &&
          pathname !== "/"
        ) {
          router.push("/profile?setup=true");
        }
      }
    } catch (error) {
      console.error("Failed to check profile status:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Handle redirection in useEffect, not during render
  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      pathname !== "/login" &&
      pathname !== "/register" &&
      pathname !== "/"
    ) {
      router.push("/login");
    }
  }, [isLoading, user, router, pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Don't render if not authenticated (will redirect in useEffect)
  if (
    !user &&
    pathname !== "/login" &&
    pathname !== "/register" &&
    pathname !== "/"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
            <Link href="/" className="flex items-center gap-2 group">
              <Heart className="h-8 w-8 text-blue-600" fill="currentColor" />
              <span className="text-xl font-bold text-gray-900">
                HealthWallet
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-blue-50",
                    isActive
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {item.name === "Profile" && profileComplete === false && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-blue-100">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user ? getInitials(user.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || "Loading..."}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "email@example.com"}
                </p>
                {profileComplete === false && (
                  <p className="text-xs text-red-600 mt-1">
                    Profile incomplete
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 lg:hidden">
            <Heart className="h-6 w-6 text-blue-600" fill="currentColor" />
            <span className="text-lg font-bold text-gray-900">
              HealthWallet
            </span>
          </div>

          <div className="flex-1" />

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user ? getInitials(user.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "email@example.com"}
                  </p>
                </div>

                <Link
                  href="/"
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                  {profileComplete === false && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors border-t border-gray-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navigation.slice(0, 5).map((item) => {
            // Show only first 5 items on mobile
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-0 flex-1",
                  isActive ? "text-blue-600" : "text-gray-600"
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name === "Profile" && profileComplete === false && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </div>
                <span className="text-[10px] font-medium truncate max-w-full">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="lg:hidden h-16" />
    </div>
  );
}
