
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Download, Search, Filter } from "lucide-react";
import { getUserRoleLabel } from "@/lib/utils";

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  
  // Fetch logs and users
  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/logs']
  });
  
  const { data: users } = useQuery({
    queryKey: ['/api/users']
  });
  
  // Get unique action types
  const actionTypes = logs 
    ? Array.from(new Set(logs.map((log: any) => log.action)))
    : [];
  
  // Filter logs
  const filteredLogs = logs?.filter((log: any) => {
    let matches = true;
    
    // Apply search term filter
    if (searchTerm) {
      const user = users?.find((u: any) => u.id === log.userId);
      const searchableText = `${user?.name || ''} ${log.action} ${JSON.stringify(log.details)}`.toLowerCase();
      matches = matches && searchableText.includes(searchTerm.toLowerCase());
    }
    
    // Apply action filter
    if (actionFilter) {
      matches = matches && log.action === actionFilter;
    }
    
    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      const logDate = new Date(log.createdAt);
      matches = matches && logDate >= dateRange.from && logDate <= dateRange.to;
    }
    
    return matches;
  });
  
  // Download logs as CSV
  const downloadLogs = () => {
    if (!filteredLogs?.length) return;
    
    const header = "ID,Data,Usuário,Ação,Detalhes\n";
    const csvContent = filteredLogs.map((log: any) => {
      const user = users?.find((u: any) => u.id === log.userId);
      return [
        log.id,
        new Date(log.createdAt).toLocaleString(),
        user?.name || 'Desconhecido',
        log.action,
        JSON.stringify(log.details).replace(/"/g, '""') // Escape quotes for CSV
      ].join(",");
    }).join("\n");
    
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <MainLayout title="Logs do Sistema">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Logs de Auditoria do Sistema</CardTitle>
            <CardDescription>
              Visualize e filtre todas as operações realizadas no sistema.
            </CardDescription>
          </div>
          <Button onClick={downloadLogs} disabled={!filteredLogs?.length}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, ação ou detalhes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Todos os tipos de ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>Todos os tipos de ação</SelectItem>
                  {actionTypes.map((action: string) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <DateRangePicker 
                value={dateRange}
                onChange={setDateRange}
                className="w-full sm:w-auto"
              />
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Carregando logs...</div>
            ) : filteredLogs?.length ? (
              <div className="rounded-md border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data e Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log: any) => {
                      const user = users?.find((u: any) => u.id === log.userId);
                      return (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user?.name || 'Desconhecido'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user ? getUserRoleLabel(user.role) : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{log.action}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum log encontrado com os filtros selecionados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
