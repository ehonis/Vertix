'use client';
import { getLineChartCompletionsData } from '@/lib/routeCompletionsClientScripts';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { useEffect, useState } from 'react';
// Define colors for each slice
const COLORS = ['#0088FE', '#00C49F'];

// Custom Tooltip component
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 rounded-sm text-xs text-white">
        <p className="font-semibold">{payload[0].name}</p>
        <p>{`Completions: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
}

export default function RouteLineChart({ completedRoutes }) {
  const [lineCompletion, setLineCompletion] = useState([]);
  const [timePeriod, setTimePeriod] = useState('Day');

  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };

  const getData = () => {
    const lineChartCompletionsData = getLineChartCompletionsData(
      completedRoutes,
      timePeriod
    );
    setLineCompletion(lineChartCompletionsData);
  };

  useEffect(() => {
    getData();
  }, [timePeriod]);

  useEffect;
  if (lineCompletion.length > 0) {
    return (
      <div className="grow bg-bg1 rounded-lg py-4 flex flex-col gap-3 justify-between items-center md:h-auto h-72">
        <div className="flex justify-between items-center w-full px-7">
          <h2 className="text-white font-bold text-xl">
            Total Completed Routes By{' '}
            {timePeriod.charAt(0).toLocaleUpperCase() + timePeriod.slice(1)}
          </h2>
          <select
            name=""
            id=""
            onChange={handleTimePeriodChange}
            className="bg-bg2 rounded-lg p-1 text-white"
          >
            <option value="Day">Day</option>
            <option value="Week">Week</option>
            <option value="Month">Month</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={lineCompletion}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={timePeriod} />
            <YAxis
              tickCount={
                Math.max(
                  ...lineCompletion.map((d) => Math.max(d.Boulders, d.Ropes))
                ) + 5
              } // Limit Y-axis based on max value in the data
              interval={0} // Display every tick
              allowDecimals={false} // Ensure only integers
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Boulders"
              stroke={COLORS[0]}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Ropes"
              stroke={COLORS[1]}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } else {
    return (
      <div className="grow bg-bg1 rounded-lg p-4 flex flex-col justify-between items-center">
        <h2 className="text-white font-bold text-xl">
          Total Completed Routes Over Time
        </h2>
        <p className="text-red-500 font-bold ">No Data to Display</p>
        <p className="text-white font-bold text-center">
          Go the the{' '}
          <Link className="text-blue-500 underline font-bold" href={'/routes'}>
            Routes Page
          </Link>{' '}
          to record some routes you completed
        </p>
      </div>
    );
  }
}
