"use client";

import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";

// Define colors for each slice
const COLORS = ["#0088FE", "#00C49F"];

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

export default function RoutePieChart({ userData }) {
  const data = Object.values(userData);
  if (Object.keys(data[0]).length > 0 || Object.keys(data[1]).length > 0) {
    if (Object.keys(data[0]).length === 0) {
      data[0] = { boulder: 0 };
    }
    if (Object.keys(data[1]).length === 0) {
      data[1] = { rope: 0 };
    }

    const dataTransformed = data.map(type => {
      // Get the key and value from each object
      const [name, value] = Object.entries(type)[0];

      return { name, value };
    });

    dataTransformed.forEach(item => {
      //charAt to change individual letter at index
      // item.name.charAt(0).toUpperCase() seperates the first letter than capitalizes it.
      // item.name.slice(1) + s takes the rest of the string starting at the second letter and adds a s on it
      item.name = item.name.charAt(0).toUpperCase() + item.name.slice(1) + "s";
    });

    return (
      <div className="w-72 h-72 bg-bg1 rounded-lg p-4 flex flex-col justify-between items-center">
        <h2 className="text-white font-bold text-xl">Total Completed Routes</h2>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={dataTransformed}
              innerRadius={40}
              outerRadius={70}
              labelLine={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  } else {
    return (
      <div className="w-72 h-72 bg-bg1 rounded-lg p-4 flex flex-col justify-between items-center">
        <h2 className="text-white font-bold text-xl">Total Completed Routes</h2>
        <p className="text-red-500 font-bold text-center">No Data to Display</p>
        <p className="text-white font-bold text-center">
          Go the the{" "}
          <Link className="text-blue-500 underline font-bold" href={"/routes"}>
            Routes Page
          </Link>{" "}
          to record some routes you completed
        </p>
      </div>
    );
  }
}
