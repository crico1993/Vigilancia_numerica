import { useState } from "react";
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
import { BarChart, PieChart, LineChart } from "@/components/charts";
import { ActivityType } from "@shared/schema";
import { getActivityTypeLabel } from "@/lib/utils";
import { Download, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { DateRange } from "react-day-picker";

export default function ServerDashboardContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activityType, setActivityType] = useState<string>("");
  const [, setLocation] = useLocation();
  
  interface ActivityData {
    id: number;
    type: string;
    description: string;
    date: string;
    userId: number;
    municipalities?: string[];
    userName?: string;
  }
  
  interface StatisticsData {
    totalActivities: number;
    byType: Record<string, number>;
    byMonth: Record<string, number>;
    recentTrend: number;
  }
  
  // Fetch user's activities and statistics
  const { data: activities = [] } = useQuery<ActivityData[]>({
    queryKey: ['/api/activities', dateRange, activityType],
    queryFn: async () => {
      const response = await fetch(`/api/activities?dateRange=${dateRange}&activityType=${activityType}`);
      if (!response.ok) throw new Error('Erro ao carregar atividades');
      return response.json();
    }
  });
  
  const { data: statistics = { totalActivities: 0, byType: {}, byMonth: {}, recentTrend: 0 } } = useQuery<StatisticsData>({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/statistics');
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');
      return response.json();
    }
  });
  
  // Prepare chart data
  const byTypeChartData = statistics?.byType 
    ? Object.entries(statistics.byType).map(([key, value]) => ({
        label: getActivityTypeLabel(key),
        value: value as number,
      }))
    : [];
    
  const byMonthChartData = statistics?.byMonth 
    ? Object.entries(statistics.byMonth).map(([key, value]) => {
        const [year, month] = key.split('-');
        return {
          x: `${month}/${year}`,
          y: value as number,
        };
      })
    : [];
    
  // Download report in PDF or Excel
  const downloadReport = (format: 'pdf' | 'excel') => {
    // Implementation for report download would go here
    // For now just show a message
    alert(`Relatório em ${format} será gerado em breve. Funcionalidade em desenvolvimento.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Meu Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadReport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => downloadReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={() => setLocation('/activities/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        </div>
      </div>

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
            <CardTitle>Tipo Mais Frequente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {byTypeChartData.length > 0 
                ? getActivityTypeLabel(Object.keys(statistics?.byType || {}).reduce((a, b) => statistics?.byType[a] > statistics?.byType[b] ? a : b, ''))
                : "N/A"}
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
        <Card>
          <CardHeader>
            <CardTitle>Atividades por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {byMonthChartData.length > 0 ? (
              <LineChart data={byMonthChartData} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Sem dados para exibir</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Atividades</CardTitle>
          <CardDescription>
            Lista de todas as atividades registradas.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangePicker 
              value={dateRange}
              onChange={(range) => setDateRange(range)}
              className="w-full sm:w-auto"
            />
            <Select value={activityType || ""} onValueChange={setActivityType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {Object.values(ActivityType).map(type => (
                  <SelectItem key={type} value={type}>
                    {getActivityTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {activities?.length > 0 ? (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municípios</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity: any) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(activity.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getActivityTypeLabel(activity.type)}</td>
                      <td className="px-6 py-4">{activity.description}</td>
                      <td className="px-6 py-4">{activity.municipalities?.join(', ')}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/activities/${activity.id}/edit`)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => {/* Delete functionality */}}>Excluir</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
              <Button onClick={() => setLocation('/activities/new')} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Nova Atividade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}