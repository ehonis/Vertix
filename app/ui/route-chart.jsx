"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  YAxis,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import { getTicks } from "@/lib/routeScripts";
import useScrollAnimation from "../hooks/useScrollAnimation";
import clsx from "clsx";

export default function RouteChart({ data, type }) {
  const [elementRef, isVisible] = useScrollAnimation(0.1);

  let barColor = "#7898ad";
  const routes = data.filter((route) => route.type === type);

  // Count grades
  const gradeCounts = routes.reduce((acc, route) => {
    const grade = route.grade;
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  // Transform the gradeCounts object into an array for the chart
  const transformedData = Object.keys(gradeCounts).map((grade) => ({
    grade,
    count: gradeCounts[grade],
  }));

  if (type === "boulder") {
    transformedData.unshift(transformedData[transformedData.length - 1]);
    transformedData.pop();
    barColor = "#ee8919";
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <p className="label" style={{ color: barColor }}>
            {label}
          </p>
          <p
            className="intro"
            style={{ color: "#8884d8" }}
          >{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      ref={elementRef}
      className={clsx(
        "w-1/2 h-96 pr-8 transition-all duration-500 transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            interval={0}
            domain={[0, "dataMax"]}
            ticks={Array.from(
              { length: getTicks(transformedData) + 1 },
              (_, i) => i
            )}
            tick={{ fill: "#ffffff" }}
            stroke="#ffffff"
          />
          <YAxis
            type="category"
            dataKey="grade"
            tick={{ fill: "#ffffff" }}
            stroke="#ffffff"
          />
          <Tooltip content={CustomTooltip} />
          <Bar dataKey="count" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
