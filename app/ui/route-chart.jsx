"use client";

import { BarChart, Bar, CartesianGrid, Tooltip, YAxis, XAxis, ResponsiveContainer } from "recharts";
import { getTicks } from "@/lib/routeScripts";
import useScrollAnimation from "../hooks/useScrollAnimation";
import clsx from "clsx";

export default function RouteChart({ data, type }) {
  const [elementRef, isVisible] = useScrollAnimation(0.1);

  let barColor = "#7898ad";
  const routes = data.filter(route => route.type === type);

  // Count grades

  const ropeGradeOrder = ["5.B", "5.7", "5.8", "5.9", "5.10", "5.11", "5.12", "5.13"];

  const boulderGradeOrder = [
    "vB",
    "v0",
    "v1",
    "v2",
    "v3",
    "v4",
    "v5",
    "v6",
    "v7",
    "v8",
    "v9",
    "v10",
  ];

  // Helper function to normalize grades (removes + or -)
  const normalizeGrade = grade => grade.replace(/[+-]/g, "");

  // Transform data and normalize grades
  const gradeCounts = routes.reduce((acc, route) => {
    const normalizedGrade = normalizeGrade(route.grade);
    acc[normalizedGrade] = (acc[normalizedGrade] || 0) + 1;
    return acc;
  }, {});

  // Sort transformedData based on the defined grade order
  const transformedData = Object.keys(gradeCounts)
    .map(grade => ({
      grade,
      count: gradeCounts[grade],
    }))
    .sort((a, b) => {
      const order = type === "boulder" ? boulderGradeOrder : ropeGradeOrder;
      return order.indexOf(a.grade) - order.indexOf(b.grade);
    });

  if (type === "boulder") {
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
          <p className="intro" style={{ color: "#8884d8" }}>{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      ref={elementRef}
      className={clsx(
        "md:w-1/2 w-full h-96 pr-8 transition-all duration-500 transform",
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
            ticks={Array.from({ length: getTicks(transformedData) + 1 }, (_, i) => i)}
            tick={{ fill: "#ffffff" }}
            stroke="#ffffff"
          />
          <YAxis type="category" dataKey="grade" tick={{ fill: "#ffffff" }} stroke="#ffffff" />
          <Tooltip content={CustomTooltip} />
          <Bar dataKey="count" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
