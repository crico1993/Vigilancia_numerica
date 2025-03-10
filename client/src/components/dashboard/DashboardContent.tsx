import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import SummaryCards from './SummaryCards';
import ActivityChart from './ActivityChart';
import ActivityTable from './ActivityTable';
import { useAuth } from '@/lib/auth';

export default function DashboardContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Filter states
  const [period, setPeriod] = useState('30');
  const [activityType, setActivityType] = useState('all');
  
  // Get statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/statistics'],
  });
  
  // Get activities for table
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Calculate date range based on period
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === '30') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === '90') {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === 'year') {
      startDate.setMonth(0);
      startDate.setDate(1);
    } else if (period === 'lastyear') {
      startDate.setFullYear(endDate.getFullYear() - 1);
      startDate.setMonth(0);
      startDate.setDate(1);
      endDate.setFullYear(endDate.getFullYear() - 1);
      endDate.setMonth(11);
      endDate.setDate(31);
    }
    
    return { startDate, endDate };
  };

  // Handle export
  const handleExport = () => {
    // In a real implementation, this would generate and download a report
    toast({
      title: "Exportação iniciada",
      description: "O relatório será baixado em alguns instantes.",
    });
  };

  return (
    <>
      {/* Filter controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Visão Geral</h2>
        
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
                <SelectItem value="lastyear">Ano anterior</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo de atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas atividades</SelectItem>
                <SelectItem value="training">Capacitações</SelectItem>
                <SelectItem value="support">Suportes</SelectItem>
                <SelectItem value="publication">Publicações</SelectItem>
                <SelectItem value="event">Eventos</SelectItem>
                <SelectItem value="travel">Viagens</SelectItem>
                <SelectItem value="course">Cursos</SelectItem>
                <SelectItem value="interview">Entrevistas</SelectItem>
                <SelectItem value="ombudsman">Ouvidoria</SelectItem>
                <SelectItem value="communication">Comunicação</SelectItem>
                <SelectItem value="other">Outras</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="whitespace-nowrap" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        isLoading={statsLoading}
        data={statsData}
      />

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityChart 
          title="Distribuição de Atividades"
          description="Total de atividades por mês"
          chartType="bar"
          isLoading={statsLoading}
          data={statsData?.byMonth}
        />
        
        <ActivityChart 
          title="Tipos de Atividades"
          description="Distribuição percentual por tipo"
          chartType="pie"
          isLoading={statsLoading}
          data={statsData?.byType}
        />
      </div>

      {/* Activities Table */}
      <div className="mt-8">
        <ActivityTable 
          isLoading={activitiesLoading}
          data={activitiesData}
          isManager={user?.role === 'manager' || user?.role === 'admin'}
        />
      </div>
    </>
  );
}
