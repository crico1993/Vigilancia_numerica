import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChartComponent, PieChartComponent } from "@/components/ui/chart";
import { getActivityTypeLabel } from "@/lib/activityTypes";

type ActivityChartProps = {
  title: string;
  description: string;
  chartType: 'bar' | 'pie' | 'line';
  isLoading: boolean;
  data?: Record<string, number>;
};

export default function ActivityChart({ 
  title, 
  description, 
  chartType, 
  isLoading, 
  data 
}: ActivityChartProps) {
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full flex items-center justify-center">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare data for charts
  const prepareChartData = () => {
    if (!data) return [];
    
    if (chartType === 'bar') {
      // Format for bar chart - months
      return Object.entries(data).map(([key, value]) => {
        // Convert month format to Brazilian Portuguese month name
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = date.toLocaleString('pt-BR', { month: 'short' });
        
        return {
          month: `${monthName}/${year}`,
          count: value
        };
      });
    } else if (chartType === 'pie') {
      // Format for pie chart - activity types
      return Object.entries(data).map(([key, value]) => {
        return {
          name: getActivityTypeLabel(key),
          value: value
        };
      });
    }
    
    return [];
  };
  
  const chartData = prepareChartData();
  
  // Custom colors for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#ec4899', '#84cc16', '#14b8a6', '#6366f1'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {chartType === 'bar' && chartData.length > 0 && (
            <BarChartComponent 
              data={chartData} 
              xDataKey="month" 
              barDataKey="count" 
              height={250}
              barColor="var(--primary)"
            />
          )}
          
          {chartType === 'pie' && chartData.length > 0 && (
            <>
              <PieChartComponent 
                data={chartData} 
                nameKey="name" 
                dataKey="value"
                colors={COLORS} 
                height={200}
              />
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                {chartData.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center">
                    <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-sm text-gray-500">{item.name} ({Math.round((item.value / chartData.reduce((acc, curr) => acc + curr.value, 0)) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {chartData.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-500">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
