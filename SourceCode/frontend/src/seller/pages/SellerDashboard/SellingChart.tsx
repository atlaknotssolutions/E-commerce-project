import React, { useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchRevenueChart } from "../../../Redux Toolkit/Seller/revenueChartSlice";

interface SellingChartProps {
  chartType: string;
}

const formatRevenue = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const SellingChart = ({ chartType }: SellingChartProps) => {
  const dispatch = useAppDispatch();
  const { revenueChart } = useAppSelector((store) => store);
  const lastFetchedTypeRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!chartType) return;
    if (lastFetchedTypeRef.current === chartType) return;
    lastFetchedTypeRef.current = chartType;

    dispatch(
      fetchRevenueChart({
        type: chartType,
      })
    );
  }, [dispatch, chartType]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={revenueChart.chart ?? []}
        margin={{
          top: 20,
          right: 20,
          left: 10,
          bottom: 10,
        }}
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E5E7EB"
        />

        <XAxis
          dataKey="label"
          tick={{ fill: "#64748B", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tickFormatter={(value) => `₹${value}`}
          tick={{ fill: "#64748B", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            border: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
          formatter={(value: number) => [
            formatRevenue(value),
            "Revenue",
          ]}
          labelFormatter={(label) => `Period: ${label}`}
        />

        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#4F46E5"
          strokeWidth={3}
          fill="url(#revenueGradient)"
          activeDot={{
            r: 6,
            stroke: "#4F46E5",
            strokeWidth: 2,
            fill: "#ffffff",
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SellingChart;