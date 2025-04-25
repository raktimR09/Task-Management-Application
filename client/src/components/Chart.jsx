import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Chart = ({ data }) => {
  // Log data to check if it's being passed correctly
  console.log("Chart Data:", data);

  // If data has label and value, we need to ensure it's mapped correctly for recharts
  const formattedData = data.map((item) => ({
    name: item.label, // This corresponds to 'label' in your data
    total: item.value, // This corresponds to 'value' in your data
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};
