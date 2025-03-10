import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ServerDashboard from "@/pages/dashboard/ServerDashboard";
import ManagerDashboard from "@/pages/dashboard/ManagerDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import Activities from "@/pages/activities/Activities";
import Reports from "@/pages/reports/Reports";
import Users from "@/pages/users/Users";
import Settings from "@/pages/settings/Settings";
import ActivityForm from "@/components/forms/ActivityForm";
import UserForm from "@/components/forms/UserForm";
import Logs from "@/pages/logs/Logs";
import PendingUsers from "@/pages/users/PendingUsers";
import { AuthProvider } from "./lib/auth.tsx";
import { useEffect } from "react";
import { useAuth } from "./lib/auth.tsx";

function ProtectedRoute({ 
  component: Component, 
  requiredRoles = [] 
}: { 
  component: React.ComponentType<any>, 
  requiredRoles?: string[] 
}) {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        setLocation("/");
      }
    }
  }, [user, isLoading, setLocation, requiredRoles]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Dashboard routes based on role */}
      <Route path="/">
        {() => {
          const { user } = useAuth();
          if (!user) return <Login />;
          
          try {
            switch (user.role) {
              case "admin":
                return <AdminDashboard />;
              case "manager":
                return <ManagerDashboard />;
              default:
                return <ServerDashboard />;
            }
          } catch (error) {
            console.error("Error rendering dashboard:", error);
            return <div>Ocorreu um erro ao carregar o dashboard.</div>;
          }
        }}
      </Route>
      
      {/* Activities routes */}
      <Route path="/activities">
        <ProtectedRoute component={Activities} />
      </Route>
      
      <Route path="/activities/new">
        <ProtectedRoute component={ActivityForm} />
      </Route>
      
      <Route path="/activities/:id/edit">
        {({ id }) => (
          <ProtectedRoute component={() => <ActivityForm id={parseInt(id)} />} />
        )}
      </Route>
      
      {/* Reports routes */}
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      
      {/* Users management - admin only */}
      <Route path="/users">
        <ProtectedRoute component={Users} requiredRoles={["admin"]} />
      </Route>
      
      <Route path="/users/pending">
        <ProtectedRoute component={PendingUsers} requiredRoles={["admin"]} />
      </Route>
      
      <Route path="/users/new">
        <ProtectedRoute component={UserForm} requiredRoles={["admin"]} />
      </Route>
      
      <Route path="/users/:id/edit">
        {({ id }) => (
          <ProtectedRoute component={() => <UserForm id={parseInt(id)} />} requiredRoles={["admin"]} />
        )}
      </Route>
      
      {/* Logs - admin only */}
      <Route path="/logs">
        <ProtectedRoute component={Logs} requiredRoles={["admin"]} />
      </Route>
      
      {/* Settings route */}
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
