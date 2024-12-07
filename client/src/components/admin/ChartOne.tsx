import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useI18nContext } from '../../hooks/useI18nContext';

interface ChartOneProps {
  data: {
    daily: { total: number; successful: number };
    weekly: { total: number; successful: number };
    monthly: { total: number; successful: number };
  };
}

const ChartOne: React.FC<ChartOneProps> = ({ data }) => {
  const language = useI18nContext();
  const lang = language.of("AdminSection");
  const chartData = {
    series: [
      {
        name: lang("total-orders"),
        data: [data.daily.total, data.weekly.total, data.monthly.total],
      },
      {
        name: lang("successful-orders"),
        data: [data.daily.successful, data.weekly.successful, data.monthly.successful],
      },
    ],
    options: {
      chart: {
        type: 'bar' as 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: [lang("daily"), lang("weekly"), lang("monthly")],
      },
      yaxis: {
        title: {
          text: lang("orders"),
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} ${lang("orders")}`,
        },
      },
    },
  };

  return (
    <div className="chart-container p-6 bg-white rounded-lg shadow-md">
      <h4 className="text-xl font-semibold mb-4">{lang("order-statistics")}</h4>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default ChartOne;
