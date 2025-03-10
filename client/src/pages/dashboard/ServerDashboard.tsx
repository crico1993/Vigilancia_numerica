import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ServerDashboardContent from "@/components/dashboard/ServerDashboard";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function ServerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  return (
    <MainLayout title="Dashboard do Servidor">
      <ServerDashboardContent />
    </MainLayout>
  );
}