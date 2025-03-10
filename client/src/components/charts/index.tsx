
import React from 'react';

// Este é um arquivo simulando componentes de gráfico
// Em um ambiente real, você usaria bibliotecas como recharts, visx, ou chart.js

interface ChartData {
  label?: string;
  name?: string;
  value?: number;
  x?: string;
  y?: number;
}

// BarChart component
export function BarChart({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-64 flex items-end justify-around">
      {data.map((item, index) => {
        const value = item.value || 0;
        const maxValue = Math.max(...data.map(d => d.value || 0));
        const height = maxValue ? (value / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-12 bg-blue-500 rounded-t-md transition-all duration-500" 
              style={{ height: `${height}%` }}
            ></div>
            <div className="text-xs mt-2 text-center max-w-[60px] truncate" title={item.name || item.label}>
              {item.name || item.label}
            </div>
            <div className="text-xs font-bold">{value}</div>
          </div>
        );
      })}
    </div>
  );
}

// PieChart component
export function PieChart({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  let startAngle = 0;
  
  // Generate colors based on index
  const getColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'
    ];
    return colors[index % colors.length];
  };
  
  return (
    <div className="relative w-full h-64 flex justify-center items-center">
      <div className="w-32 h-32 rounded-full relative">
        {data.map((item, index) => {
          const value = item.value || 0;
          if (value === 0) return null;
          
          const percentage = (value / total) * 100;
          const endAngle = startAngle + (percentage * 3.6); // 3.6 degrees per percentage point
          const largeArcFlag = percentage > 50 ? 1 : 0;
          
          // Calculate coordinates
          const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
          const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
          const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
          const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);
          
          // SVG path
          const path = `
            M 50 50
            L ${x1} ${y1}
            A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;
          
          const currentAngle = startAngle;
          startAngle = endAngle;
          
          return (
            <div key={index} className="absolute inset-0">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <path 
                  d={path} 
                  fill={getColor(index).replace('bg-', 'fill-').replace('-500', '')} 
                  stroke="white"
                />
              </svg>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 absolute bottom-0 w-full flex flex-wrap justify-center gap-x-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 mr-1 ${getColor(index)}`}></div>
            <span className="text-xs">{item.label || item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// LineChart component
export function LineChart({ data }: { data: { x: string, y: number }[] }) {
  const maxValue = Math.max(...data.map(d => d.y));
  const normalizedData = data.map((item, index) => ({
    x: item.x,
    y: maxValue ? (item.y / maxValue) * 100 : 0,
    value: item.y
  }));
  
  return (
    <div className="w-full h-64 relative flex items-end pt-8">
      {/* Y-axis */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between items-end pr-2">
        {[0, 1, 2, 3, 4].map(i => {
          const value = Math.round(maxValue * (4 - i) / 4);
          return (
            <div key={i} className="text-xs text-gray-500">
              {value}
            </div>
          );
        })}
      </div>
      
      {/* Chart area */}
      <div className="flex-1 h-full ml-8 relative">
        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <div 
            key={y} 
            className="absolute w-full border-t border-gray-200" 
            style={{ bottom: `${y}%` }}
          ></div>
        ))}
        
        {/* Line and points */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${(data.length - 1) * 100} 100`} preserveAspectRatio="none">
          <polyline
            points={normalizedData.map((d, i) => `${i * 100},${100 - d.y}`).join(' ')}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
          />
          {normalizedData.map((d, i) => (
            <circle
              key={i}
              cx={i * 100}
              cy={100 - d.y}
              r="4"
              fill="white"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
            />
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 w-full flex justify-between translate-y-6">
          {normalizedData.map((d, i) => (
            <div key={i} className="text-xs text-center" style={{ width: `${100 / (data.length - 1)}%`, marginLeft: i === 0 ? '0' : `-${50 / (data.length - 1)}%` }}>
              {d.x}
            </div>
          ))}
        </div>
        
        {/* Data points tooltips */}
        {normalizedData.map((d, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 group"
            style={{ 
              left: `${i * (100 / (data.length - 1))}%`, 
              bottom: `${d.y}%` 
            }}
          >
            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-xs p-1 rounded pointer-events-none whitespace-nowrap">
              {d.x}: {d.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// HeatMapChart component
export function HeatMapChart({ data }: { data: { x: string, y: string, value: number }[] }) {
  // Placeholder implementation
  return (
    <div className="w-full h-64 flex justify-center items-center">
      <div className="text-center text-gray-500">
        Mapa de calor - Implementação em desenvolvimento
      </div>
    </div>
  );
}
