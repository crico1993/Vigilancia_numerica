import { ActivityType } from '@shared/schema';

// Activity type options for select inputs
export function getActivityTypeOptions() {
  return [
    { value: ActivityType.TRAINING, label: 'Capacitação' },
    { value: ActivityType.SUPPORT, label: 'Suporte' },
    { value: ActivityType.PUBLICATION, label: 'Publicação' },
    { value: ActivityType.EVENT, label: 'Evento' },
    { value: ActivityType.TRAVEL, label: 'Viagem' },
    { value: ActivityType.COURSE, label: 'Curso' },
    { value: ActivityType.INTERVIEW, label: 'Entrevista' },
    { value: ActivityType.OMBUDSMAN, label: 'Ouvidoria' },
    { value: ActivityType.COMMUNICATION, label: 'Comunicação' },
    { value: ActivityType.OTHER, label: 'Outra' }
  ];
}

// Get Portuguese label for activity type
export function getActivityTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    [ActivityType.TRAINING]: 'Capacitação',
    [ActivityType.SUPPORT]: 'Suporte',
    [ActivityType.PUBLICATION]: 'Publicação',
    [ActivityType.EVENT]: 'Evento',
    [ActivityType.TRAVEL]: 'Viagem',
    [ActivityType.COURSE]: 'Curso',
    [ActivityType.INTERVIEW]: 'Entrevista',
    [ActivityType.OMBUDSMAN]: 'Ouvidoria',
    [ActivityType.COMMUNICATION]: 'Comunicação',
    [ActivityType.OTHER]: 'Outra'
  };
  
  return labelMap[type] || 'Desconhecido';
}

// Get appropriate color for activity type badge
export function getActivityTypeColor(type: string): string {
  const colorMap: Record<string, { bg: string, text: string }> = {
    [ActivityType.TRAINING]: { bg: 'bg-blue-100', text: 'text-blue-800' },
    [ActivityType.SUPPORT]: { bg: 'bg-green-100', text: 'text-green-800' },
    [ActivityType.PUBLICATION]: { bg: 'bg-amber-100', text: 'text-amber-800' },
    [ActivityType.EVENT]: { bg: 'bg-purple-100', text: 'text-purple-800' },
    [ActivityType.TRAVEL]: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    [ActivityType.COURSE]: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    [ActivityType.INTERVIEW]: { bg: 'bg-pink-100', text: 'text-pink-800' },
    [ActivityType.OMBUDSMAN]: { bg: 'bg-rose-100', text: 'text-rose-800' },
    [ActivityType.COMMUNICATION]: { bg: 'bg-orange-100', text: 'text-orange-800' },
    [ActivityType.OTHER]: { bg: 'bg-gray-100', text: 'text-gray-800' }
  };
  
  return `${colorMap[type]?.bg || 'bg-gray-100'} ${colorMap[type]?.text || 'text-gray-800'}`;
}

// Get chart color for activity type (for visualizations)
export function getActivityTypeChartColor(type: string, index: number = 0): string {
  const colorMap: Record<string, string> = {
    [ActivityType.TRAINING]: '#3b82f6', // blue
    [ActivityType.SUPPORT]: '#10b981', // green
    [ActivityType.PUBLICATION]: '#f59e0b', // amber
    [ActivityType.EVENT]: '#8b5cf6', // purple
    [ActivityType.TRAVEL]: '#6366f1', // indigo
    [ActivityType.COURSE]: '#06b6d4', // cyan
    [ActivityType.INTERVIEW]: '#ec4899', // pink
    [ActivityType.OMBUDSMAN]: '#f43f5e', // rose
    [ActivityType.COMMUNICATION]: '#f97316', // orange
    [ActivityType.OTHER]: '#6b7280' // gray
  };
  
  // Fallback colors if type is not found
  const fallbackColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
    '#6366f1', '#06b6d4', '#ec4899', '#f43f5e',
    '#f97316', '#6b7280'
  ];
  
  return colorMap[type] || fallbackColors[index % fallbackColors.length];
}

// Filter options for date ranges
export const dateRangeOptions = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: 'year', label: 'Este ano' },
  { value: 'lastyear', label: 'Ano anterior' },
  { value: 'custom', label: 'Período personalizado' }
];

// Calculate date range based on period selection
export function getDateRangeFromPeriod(period: string): { startDate: Date, endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'year':
      startDate.setMonth(0);
      startDate.setDate(1);
      break;
    case 'lastyear':
      startDate.setFullYear(endDate.getFullYear() - 1);
      startDate.setMonth(0);
      startDate.setDate(1);
      endDate.setFullYear(endDate.getFullYear() - 1);
      endDate.setMonth(11);
      endDate.setDate(31);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
  }
  
  return { startDate, endDate };
}
