'use client';

import {
  PieChart,
  Pie,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const data02 = [
  { name: 'Ropes', value: 2400 },
  { name: 'Boulders', value: 4567 },
];

// Define colors for each slice
const COLORS = ['#0088FE', '#00C49F'];

// Custom Tooltip component
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 rounded text-xs text-white">
        <p className="font-semibold">{payload[0].name}</p>
        <p>{`Completions: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
}

export default function RoutePieChart({ userData }) {
  return (
    <div className="w-72 h-72 bg-bg1 rounded-lg p-4 flex flex-col justify-between items-center">
      <h2 className="text-white font-bold text-xl">Total Completed Routes</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            data={data02}
            innerRadius={40}
            outerRadius={70}
            labelLine={true}
          >
            {data02.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
