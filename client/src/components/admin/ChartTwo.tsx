import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useI18nContext } from '../../hooks/useI18nContext';

interface ChartTwoProps {
  orderStats: {
    total: number;
    successful: number;
    percentage: number;
  };
}

const ChartTwo: React.FC<ChartTwoProps> = ({ orderStats }) => {
  const totalOrders = orderStats.total || 0;
  const successfulOrders = orderStats.successful || 0;
  const failedOrders = totalOrders - successfulOrders;

  const seriesData = [successfulOrders, failedOrders];
  const language = useI18nContext();
  const lang = language.of("AdminSection");

  const chartOptions: ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels: [lang("successful-orders"), lang("failed-orders")],
    colors: ['#22c55e', '#ef4444'],
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Orders`,
      },
    },
    legend: {
      position: 'bottom',
    },
  };

  return (
    <div className="chart-container p-6 bg-white rounded-lg shadow-md">
      <h4 className="text-xl font-semibold mb-4">{lang("order-success-rate")}</h4>
      <ReactApexChart
        options={chartOptions}
        series={seriesData}
        type="pie"
        height={350}
      />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">{lang("success-rate")}</p>
        <p className="text-2xl font-bold">{orderStats.percentage}%</p>
      </div>
    </div>
  );
};

export default ChartTwo;
