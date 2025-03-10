import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ManagerDashboardContent from "@/components/dashboard/ManagerDashboard";
import ServerDashboardContent from "@/components/dashboard/ServerDashboard";
import RoleSelectionModal from "@/components/modals/RoleSelectionModal";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [mode, setMode] = useState<"manager" | "server">("manager");

  // Show role selection modal when component mounts
  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    const hasSelectedMode = sessionStorage.getItem("managerUserMode");
    if (hasSelectedMode) {
      setMode(hasSelectedMode as "manager" | "server");
    } else {
      setShowRoleSelection(true);
    }
  }, [user, setLocation]);

  const handleSelectManagerMode = () => {
    setMode("manager");
    sessionStorage.setItem("managerUserMode", "manager");
    setShowRoleSelection(false);
  };

  const handleSelectServerMode = () => {
    setMode("server");
    sessionStorage.setItem("managerUserMode", "server");
    setShowRoleSelection(false);
  };

  const toggleMode = () => {
    const newMode = mode === "manager" ? "server" : "manager";
    setMode(newMode);
    sessionStorage.setItem("managerUserMode", newMode);
  };

  return (
    <>
      <MainLayout 
        title={`Dashboard do ${mode === "manager" ? "Gestor" : "Servidor"}`}
        action={
          <Button onClick={toggleMode} variant="outline">
            {mode === "manager" ? (
              <>
                <User className="mr-2 h-4 w-4" />
                Modo Servidor
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Modo Gestor
              </>
            )}
          </Button>
        }
      >
        {mode === "manager" ? <ManagerDashboardContent /> : <ServerDashboardContent />}
      </MainLayout>
      
      <RoleSelectionModal 
        isOpen={showRoleSelection}
        onSelectManagerMode={handleSelectManagerMode}
        onSelectServerMode={handleSelectServerMode}
      />
    </>
  );
}