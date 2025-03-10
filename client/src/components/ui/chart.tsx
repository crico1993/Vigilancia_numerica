import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Bar Chart Component
export function BarChartComponent({
  data,
  xDataKey,
  barDataKey,
  barColor = 'var(--chart-1)',
  height = 300,
}: {
  data: any[];
  xDataKey: string;
  barDataKey: string;
  barColor?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={barDataKey} fill={barColor} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Pie Chart Component
export function PieChartComponent({
  data,
  nameKey,
  dataKey,
  colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'],
  height = 300,
  innerRadius = 60,
  outerRadius = 80,
}: {
  data: any[];
  nameKey: string;
  dataKey: string;
  colors?: string[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Line Chart Component
export function LineChartComponent({
  data,
  xDataKey,
  lineDataKey,
  lineColor = 'var(--chart-1)',
  height = 300,
}: {
  data: any[];
  xDataKey: string;
  lineDataKey: string;
  lineColor?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={lineDataKey} stroke={lineColor} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Multiple Bar Chart Component
export function MultiBarChartComponent({
  data,
  xDataKey,
  bars,
  height = 300,
}: {
  data: any[];
  xDataKey: string;
  bars: { dataKey: string; color: string; name?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map((bar, index) => (
          <Bar 
            key={index} 
            dataKey={bar.dataKey} 
            fill={bar.color} 
            name={bar.name || bar.dataKey} 
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
