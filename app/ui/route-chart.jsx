'use client';

import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getTicks } from '@/lib/routeScripts';

export default function RouteChart({ data, type }) {
  // Filter routes by type

  let barColor = '#7898ad';

  const routes = data.filter((route) => route.type === type);

  // Count grades
  const gradeCounts = routes.reduce((acc, route) => {
    const grade = route.grade;
    if (acc[grade]) {
      acc[grade]++;
    } else {
      acc[grade] = 1;
    }
    return acc;
  }, {}); // Don't forget the initial value ({})

  // Transform the gradeCounts object into an array for the chart
  const transformedData = Object.keys(gradeCounts).map((grade) => ({
    grade,
    count: gradeCounts[grade],
  }));

  if (type == 'boulder') {
    transformedData.unshift(transformedData[transformedData.length - 1]);
    transformedData.pop();
    barColor = '#ee8919';
  }

  console.log(transformedData);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >
          <p className="label" style={{ color: `${barColor}` }}>{`${label}`}</p>
          <p
            className="intro"
            style={{ color: '#8884d8' }}
          >{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-1/2 h-96 pr-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            interval={0}
            domain={[0, 'dataMax']} // Start from 0 to the maximum data value
            ticks={Array.from(
              { length: getTicks(transformedData) + 1 },
              (_, i) => i
            )}
            tick={{ fill: '#ffffff' }}
            stroke="#ffffff"
            // Increment by 1
          />
          <YAxis
            type="category"
            dataKey="grade"
            tick={{ fill: '#ffffff' }}
            stroke="#ffffff"
          />
          <Tooltip content={CustomTooltip} />
          <Bar dataKey="count" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
