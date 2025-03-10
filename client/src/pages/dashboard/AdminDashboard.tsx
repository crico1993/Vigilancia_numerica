import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { ActivityWithMeta } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserX, Activity, RefreshCw } from "lucide-react";
import ServerDashboard from "@/components/dashboard/ServerDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, KeyRound } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Fetch system statistics
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: activities = [] } = useQuery<ActivityWithMeta[]>({
    queryKey: ['/api/activities'],
  });

  interface LogEntry {
    id: number;
    action: string;
    userId: number;
    details?: any;
    createdAt: string;
  }

  const { data: logs = [] } = useQuery<LogEntry[]>({
    queryKey: ['/api/logs'],
  });

  // Calculate user statistics
  const pendingApprovals = users.filter((u) => !u.approved).length || 0;
  const activeUsers = users.filter((u) => u.active).length || 0;
  const totalUsers = users.length || 0;

  // Recent logs
  const recentLogs = logs.slice(0, 10);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleEditUser = (user: User) => {
    // Placeholder: Implement user edit logic
    console.log("Edit user:", user);
  };

  const handleResetPassword = (user: User) => {
    // Placeholder: Implement reset password logic
    console.log("Reset password for user:", user);
  };

  return (
    <MainLayout title="Dashboard do Administrador">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="server-view">Visão Servidor</TabsTrigger>
            <TabsTrigger value="manager-view">Visão Gestor</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview">
          {/* Conteúdo da Visão Geral */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Gerais</CardTitle>
              <CardDescription>Visão geral das atividades e usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4">
                  <UserPlus className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-lg font-semibold">{pendingApprovals}</p>
                    <p className="text-sm text-muted-foreground">Aprovações Pendentes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <UserCheck className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-lg font-semibold">{activeUsers}</p>
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <UserX className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-lg font-semibold">{totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas atividades registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{formatDate(activity.date)}</TableCell>
                      <TableCell>{activity.type}</TableCell>
                      <TableCell>{activity.userName}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(users.find(u => u.id === activity.userId)!)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleResetPassword(users.find(u => u.id === activity.userId)!)}>
                          <KeyRound className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="server-view">
          <ServerDashboard />
        </TabsContent>
        <TabsContent value="manager-view">
          <ManagerDashboard />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
