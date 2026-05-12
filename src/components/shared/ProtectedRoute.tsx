"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/domain.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  redirectTo?: string;
  isAuthenticated: boolean;
  userRole?: Role;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/log-in",
  isAuthenticated,
  userRole,
}: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      router.replace("/hub");
    }
  }, [isAuthenticated, userRole, allowedRoles, redirectTo, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
