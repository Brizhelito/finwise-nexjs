"use client";

import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";

export interface TransactionMetrics {
  date: string;
  income: string;
  expense: string;
}

const ResponsiveChart = ({ data }: { data: TransactionMetrics[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const incomeSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const expenseSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight
        );
      }
    };

    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          background: { color: "#ffffff" },
          textColor: "#000",
        },
        grid: {
          vertLines: { color: "rgba(197, 203, 206, 0.5)" },
          horzLines: { color: "rgba(197, 203, 206, 0.5)" },
        },
      });

      incomeSeriesRef.current = chartRef.current.addLineSeries({
        color: "#4CAF50",
        lineWidth: 2,
      });

      expenseSeriesRef.current = chartRef.current.addLineSeries({
        color: "#F44336",
        lineWidth: 2,
      });

      chartRef.current.timeScale().fitContent();
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      !incomeSeriesRef.current ||
      !expenseSeriesRef.current ||
      data.length === 0
    )
      return;

    const incomeData = data.map((item) => ({
      time: item.date,
      value: parseFloat(item.income),
    }));

    const expenseData = data.map((item) => ({
      time: item.date,
      value: parseFloat(item.expense),
    }));

    incomeSeriesRef.current.setData(incomeData);
    expenseSeriesRef.current.setData(expenseData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="aspect-ratio-box">
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  );
};

export default ResponsiveChart;
