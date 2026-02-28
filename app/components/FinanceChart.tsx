"use client";

import { Ellipsis } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Jan",
    income: 4000,
    expense: 2400,
  },
  {
    name: "Feb",
    income: 3000,
    expense: 1398,
  },
  {
    name: "Mar",
    income: 9800,
    expense: 2000,
  },
  {
    name: "Apr",
    income: 3908,
    expense: 2100,
  },
  {
    name: "May",
    income: 4800,
    expense: 1890,
  },
  {
    name: "Jun",
    income: 3800,
    expense: 2390,
  },
  {
    name: "Jul",
    income: 4200,
    expense: 3490,
  },
  {
    name: "Aug",
    income: 4200,
    expense: 3490,
  },
  {
    name: "Sep",
    income: 4200,
    expense: 3490,
  },
  {
    name: "Oct",
    income: 4200,
    expense: 3490,
  },
  {
    name: "Nov",
    income: 4200,
    expense: 3490,
  },
  {
    name: "Dec",
    income: 4200,
    expense: 3490,
  },
];

const FinanceChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Finance</h1>
        <Ellipsis className="cursor-pointer" />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#000" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#000" }}
            tickLine={false}
            tickMargin={20}
          />
          <Tooltip />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#007200"
            strokeWidth={5}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#e01e37"
            strokeWidth={5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
