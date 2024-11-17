import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

interface Ela {
  pm10: number;
  pm25: number;
  humid: number;
  temp: number;
  co2: number;
  tvoc: number;
  timestamp: string;
  isInside: number;
}

interface Config {
  label: string;
  data: number[];
  labels: string[];
  color: string;
  bgColor: string;
}

interface Graph2Props {
  data: Ela[];
  reason: string;
}

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    x: {
      ticks: {
        display: false,
      },
    },
  },
};

export const Graph2: React.FC<Graph2Props> = ({ data, reason }) => {
  const [inDataSet, setInDataSet] = useState<Config>();
  const [outDataSet, setOutDataSet] = useState<Config>();

  useEffect(() => {
    if (data && reason) {
      const maxDataPoints = 100;

      // useEffect 내부에서 필터링 후 데이터 제한
      const filteredInData = data
        .filter((entry) => entry.isInside === 1)
        .slice(-maxDataPoints);
      const filteredOutData = data
        .filter((entry) => entry.isInside === 0)
        .slice(-maxDataPoints);

      const inDatasetConfig = {
        eco2: {
          label: "CO2 Levels (Inside)",
          data: filteredInData.map((entry) => entry.co2),
          labels: filteredInData.map((entry) => entry.timestamp),
          color: "rgb(255, 99, 132)",
          bgColor: "rgba(255, 99, 132, 0.5)",
        },
        pm10: {
          label: "PM10 Levels (Inside)",
          data: filteredInData.map((entry) => entry.pm10),
          labels: filteredInData.map((entry) => entry.timestamp),
          color: "rgb(53, 162, 235)",
          bgColor: "rgba(53, 162, 235, 0.5)",
        },
        pm25: {
          label: "PM2.5 Levels (Inside)",
          data: filteredInData.map((entry) => entry.pm25),
          labels: filteredInData.map((entry) => entry.timestamp),
          color: "rgb(75, 192, 192)",
          bgColor: "rgba(75, 192, 192, 0.5)",
        },
        humidity: {
          label: "Humidity Levels (Inside)",
          data: filteredInData.map((entry) => entry.humid),
          labels: filteredInData.map((entry) => entry.timestamp),
          color: "rgb(255, 206, 86)",
          bgColor: "rgba(255, 206, 86, 0.5)",
        },
        temperature: {
          label: "Temperature Levels (Inside)",
          data: filteredInData.map((entry) => entry.temp),
          labels: filteredInData.map((entry) => entry.timestamp),
          color: "rgb(255, 159, 64)",
          bgColor: "rgba(255, 159, 64, 0.5)",
        },
      }[reason];

      const outDatasetConfig = {
        eco2: {
          label: "CO2 Levels (Outside)",
          data: filteredOutData.map((entry) => entry.co2),
          labels: filteredOutData.map((entry) => entry.timestamp),
          color: "rgb(255, 99, 132)",
          bgColor: "rgba(255, 99, 132, 0.5)",
        },
        pm10: {
          label: "PM10 Levels (Outside)",
          data: filteredOutData.map((entry) => entry.pm10),
          labels: filteredOutData.map((entry) => entry.timestamp),
          color: "rgb(53, 162, 235)",
          bgColor: "rgba(53, 162, 235, 0.5)",
        },
        pm25: {
          label: "PM2.5 Levels (Outside)",
          data: filteredOutData.map((entry) => entry.pm25),
          labels: filteredOutData.map((entry) => entry.timestamp),
          color: "rgb(75, 192, 192)",
          bgColor: "rgba(75, 192, 192, 0.5)",
        },
        humidity: {
          label: "Humidity Levels (Outside)",
          data: filteredOutData.map((entry) => entry.humid),
          labels: filteredOutData.map((entry) => entry.timestamp),
          color: "rgb(255, 206, 86)",
          bgColor: "rgba(255, 206, 86, 0.5)",
        },
        temperature: {
          label: "Temperature Levels (Outside)",
          data: filteredOutData.map((entry) => entry.temp),
          labels: filteredOutData.map((entry) => entry.timestamp),
          color: "rgb(255, 159, 64)",
          bgColor: "rgba(255, 159, 64, 0.5)",
        },
      }[reason];

      setInDataSet(inDatasetConfig);
      setOutDataSet(outDatasetConfig);
    }
  }, [data, reason]);

  return (
    <div>
      <div className="contentInner">
        <div style={{ marginBottom: "20px" }}>
          {inDataSet && inDataSet.labels && inDataSet.labels.length > 0 && (
            <Bar
              options={options}
              data={{
                labels: inDataSet.labels,
                datasets: [
                  {
                    label: inDataSet.label,
                    data: inDataSet.data,
                    borderColor: inDataSet.color,
                    backgroundColor: inDataSet.bgColor,
                  },
                ],
              }}
              width={500}
              height={200}
            />
          )}
        </div>
        <div>
          {outDataSet && outDataSet.labels && outDataSet.labels.length > 0 && (
            <Bar
              options={options}
              data={{
                labels: outDataSet.labels,
                datasets: [
                  {
                    label: outDataSet.label,
                    data: outDataSet.data,
                    borderColor: outDataSet.color,
                    backgroundColor: outDataSet.bgColor,
                  },
                ],
              }}
              width={500}
              height={200}
            />
          )}
        </div>
      </div>
    </div>
  );
};
