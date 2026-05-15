"use strict";
import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return <div className="flex h-[50vh] w-full items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Redirect to="/" />;
  }
  return <>{children}</>;
}
