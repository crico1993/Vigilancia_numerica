import { ArrowUp, ArrowDown, FileText, PresentationIcon, HeadphonesIcon, FileType } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CardData {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
}

export default function SummaryCards({ 
  isLoading, 
  data 
}: { 
  isLoading: boolean; 
  data?: any;
}) {
  // Prepare card data
  const prepareCards = (): CardData[] => {
    if (!data) {
      return [
        {
          title: 'Total de Atividades',
          value: 0,
          change: 0,
          icon: <FileText className="h-6 w-6 text-primary-600" />,
          iconBg: 'bg-primary-100'
        },
        {
          title: 'Capacitações',
          value: 0,
          change: 0,
          icon: <PresentationIcon className="h-6 w-6 text-blue-600" />,
          iconBg: 'bg-blue-100'
        },
        {
          title: 'Suportes aos Municípios',
          value: 0,
          change: 0,
          icon: <HeadphonesIcon className="h-6 w-6 text-green-600" />,
          iconBg: 'bg-green-100'
        },
        {
          title: 'Publicações',
          value: 0,
          change: 0,
          icon: <FileType className="h-6 w-6 text-amber-600" />,
          iconBg: 'bg-amber-100'
        }
      ];
    }
    
    return [
      {
        title: 'Total de Atividades',
        value: data.totalActivities || 0,
        change: data.recentTrend || 0,
        icon: <FileText className="h-6 w-6 text-primary-600" />,
        iconBg: 'bg-primary-100'
      },
      {
        title: 'Capacitações',
        value: data.byType?.training || 0,
        change: 8, // Simulated change value
        icon: <PresentationIcon className="h-6 w-6 text-blue-600" />,
        iconBg: 'bg-blue-100'
      },
      {
        title: 'Suportes aos Municípios',
        value: data.byType?.support || 0,
        change: 18, // Simulated change value
        icon: <HeadphonesIcon className="h-6 w-6 text-green-600" />,
        iconBg: 'bg-green-100'
      },
      {
        title: 'Publicações',
        value: data.byType?.publication || 0,
        change: -5, // Simulated change value
        icon: <FileType className="h-6 w-6 text-amber-600" />,
        iconBg: 'bg-amber-100'
      }
    ];
  };

  const cards = prepareCards();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${card.iconBg} rounded-md p-3`}>
                {card.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="flex items-baseline">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <div className="text-2xl font-semibold text-gray-900">
                          {card.value}
                        </div>
                        {card.change !== 0 && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            card.change > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {card.change > 0 ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {card.change > 0 ? 'Aumento de' : 'Redução de'}
                            </span>
                            {Math.abs(card.change)}%
                          </div>
                        )}
                      </>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
