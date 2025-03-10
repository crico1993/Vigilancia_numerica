import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { BarChart, PieChart, LineChart, HeatMapChart } from "@/components/charts";
import { ActivityType } from "@shared/schema";
import { getActivityTypeLabel } from "@/lib/utils";
import { Download, Filter } from "lucide-react";
import { DateRange } from "react-day-picker";

export default function ManagerDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activityType, setActivityType] = useState<string>("");
  const [userId, setUserId] = useState<number | undefined>();
  const [municipality, setMunicipality] = useState<string>("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Fetch all activities and statistics
  const { data: activities } = useQuery({
    queryKey: ['/api/activities', dateRange, activityType, userId, municipality],
    onError: (error: any) => {
      console.error("Error fetching activities:", error);
      setFetchError("Ocorreu um erro ao carregar as atividades.");
    }
  });
  
  const { data: statistics } = useQuery({
    queryKey: ['/api/statistics'],
    onError: (error: any) => {
      console.error("Error fetching statistics:", error);
      setFetchError("Ocorreu um erro ao carregar as estatísticas.");
    }
  });
  
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    onError: (error: any) => {
      console.error("Error fetching users:", error);
      setFetchError("Ocorreu um erro ao carregar os usuários.");
    }
  });
  
  // Get unique municipalities from activities
  const municipalities = Array.from(
    new Set(
      activities?.flatMap((a: any) => a.municipalities || []) || []
    )
  );
  
  // Prepare chart data for dashboard
  const byUserChartData = users?.map((user: any) => {
    const userActivities = activities?.filter((a: any) => a.userId === user.id) || [];
    return {
      name: user.name,
      value: userActivities.length
    };
  }) || [];
  
  const byTypeChartData = statistics?.byType 
    ? Object.entries(statistics.byType).map(([key, value]) => ({
        name: getActivityTypeLabel(key),
        value: value as number,
      }))
    : [];
    
  const byMonthChartData = statistics?.byMonth 
    ? Object.entries(statistics.byMonth).map(([key, value]) => {
        const [year, month] = key.split('-');
        return {
          month: `${month}/${year}`,
          value: value as number,
        };
      }).sort((a, b) => {
        const [monthA, yearA] = a.month.split('/');
        const [monthB, yearB] = b.month.split('/');
        return Number(yearA) - Number(yearB) || Number(monthA) - Number(monthB);
      })
    : [];
    
  // Download report in PDF or Excel
  const downloadReport = (format: 'pdf' | 'excel') => {
    // Implementation for report download would go here
    // For now just show a message
    alert(`Relatório consolidado em ${format} será gerado em breve. Funcionalidade em desenvolvimento.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard Consolidado</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadReport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => downloadReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="text-sm font-medium mb-1 block">Período</label>
              <DateRangePicker 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-1 block">Tipo de Atividade</label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>Todos os tipos</SelectItem>
                  {Object.values(ActivityType).map(type => (
                    <SelectItem key={type} value={type}>
                      {getActivityTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-1 block">Profissional</label>
              <Select value={userId?.toString()} onValueChange={(val) => setUserId(val ? Number(val) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os servidores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>Todos os servidores</SelectItem>
                  {users?.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-1 block">Município</label>
              <Select value={municipality} onValueChange={setMunicipality}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os municípios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>Todos os municípios</SelectItem>
                  {municipalities.map((mun: string) => (
                    <SelectItem key={mun} value={mun}>
                      {mun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {fetchError && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {fetchError}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics?.totalActivities || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Média Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {byMonthChartData.length > 0 
                ? (byMonthChartData.reduce((sum, item) => sum + item.value, 0) / byMonthChartData.length).toFixed(1)
                : "0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tendência Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${statistics?.recentTrend > 0 ? 'text-green-500' : statistics?.recentTrend < 0 ? 'text-red-500' : ''}`}>
              {statistics?.recentTrend > 0 ? '+' : ''}{statistics?.recentTrend.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades por Servidor</CardTitle>
          </CardHeader>
          <CardContent>
            {byUserChartData.length > 0 ? (
              <BarChart data={byUserChartData} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Sem dados para exibir</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Atividades por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {byTypeChartData.length > 0 ? (
              <PieChart data={byTypeChartData} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Sem dados para exibir</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Temporal</CardTitle>
          <CardDescription>Número de atividades registradas por período</CardDescription>
        </CardHeader>
        <CardContent>
          {byMonthChartData.length > 0 ? (
            <LineChart data={byMonthChartData.map(d => ({ x: d.month, y: d.value }))} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Sem dados para exibir</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Realizadas</CardTitle>
          <CardDescription>
            Lista detalhada de atividades filtradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities?.length > 0 ? (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servidor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municípios</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity: any) => {
                    const user = users?.find((u: any) => u.id === activity.userId);
                    return (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(activity.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user?.name || 'Desconhecido'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getActivityTypeLabel(activity.type)}</td>
                        <td className="px-6 py-4">{activity.description}</td>
                        <td className="px-6 py-4">{activity.municipalities?.join(', ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma atividade encontrada com os filtros selecionados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
