import React, { useEffect, useState, useRef } from "react";
import ResponsiveChart, { TransactionMetrics } from "../ResponsiveChart";
export default function TransactionsChart() {
  const [data, setData] = useState<TransactionMetrics[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/transactions/metrics");
      const result: TransactionMetrics[] = await response.json();
      setData(result);
    };
    fetchData();
  }, []);
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gráfico de Transacciones</h2>
      <ResponsiveChart data={data} />
    </div>
  );
}
