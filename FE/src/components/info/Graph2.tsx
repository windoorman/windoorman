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
      const inDatasetConfig = {
        eco2: {
          label: "CO2 Levels",
          data: data
            .filter((entry) => entry.isInside === 1)
            .map((entry) => entry.co2),
          color: "rgb(255, 99, 132)",
          bgColor: "rgba(255, 99, 132, 0.5)",
        },
        pm10: {
          label: "PM10 Levels",
          data: data
            .filter((entry) => entry.isInside === 1)
            .map((entry) => entry.pm10),
          color: "rgb(53, 162, 235)",
          bgColor: "rgba(53, 162, 235, 0.5)",
        },
        pm25: {
          label: "PM2.5 Levels",
          data: data
            .filter((entry) => entry.isInside === 1)
            .map((entry) => entry.pm25),
          color: "rgb(75, 192, 192)",
          bgColor: "rgba(75, 192, 192, 0.5)",
        },
        humidity: {
          label: "Humidity Levels",
          data: data
            .filter((entry) => entry.isInside === 1)
            .map((entry) => entry.humid),
          color: "rgb(255, 206, 86)",
          bgColor: "rgba(255, 206, 86, 0.5)",
        },
        temperature: {
          label: "Temperature Levels",
          data: data
            .filter((entry) => entry.isInside === 1)
            .map((entry) => entry.temp),
          color: "rgb(255, 206, 86)",
          bgColor: "rgba(255, 206, 86, 0.5)",
        },
      }[reason];

      const outDatasetConfig = {
        eco2: {
          label: "CO2 Levels",
          data: data
            .filter((entry) => entry.isInside === 0)
            .map((entry) => entry.co2),
          color: "rgb(255, 99, 132)",
          bgColor: "rgba(255, 99, 132, 0.5)",
        },
        pm10: {
          label: "PM10 Levels",
          data: data
            .filter((entry) => entry.isInside === 0)
            .map((entry) => entry.pm10),
          color: "rgb(53, 162, 235)",
          bgColor: "rgba(53, 162, 235, 0.5)",
        },
        pm25: {
          label: "PM2.5 Levels",
          data: data
            .filter((entry) => entry.isInside === 0)
            .map((entry) => entry.pm25),
          color: "rgb(75, 192, 192)",
          bgColor: "rgba(75, 192, 192, 0.5)",
        },
        humidity: {
          label: "Humidity Levels",
          data: data
            .filter((entry) => entry.isInside === 0)
            .map((entry) => entry.humid),
          color: "rgb(255, 206, 86)",
          bgColor: "rgba(255, 206, 86, 0.5)",
        },
        temperature: {
          label: "Temperature Levels",
          data: data
            .filter((entry) => entry.isInside === 0)
            .map((entry) => entry.temp),
          color: "rgb(255, 206, 86)",
          bgColor: "rgba(255, 206, 86, 0.5)",
        },
      }[reason];

      setInDataSet(inDatasetConfig);
      setOutDataSet(outDatasetConfig);
    }
  }, [data, reason]);

  const labels = data.map((entry) => entry.timestamp);
  const inData = {
    labels,
    datasets: [
      {
        label: inDataSet?.label,
        data: inDataSet?.data,
        borderColor: inDataSet?.color,
        backgroundColor: inDataSet?.bgColor,
      },
    ],
  };
  const outData = {
    labels,
    datasets: [
      {
        label: outDataSet?.label,
        data: outDataSet?.data,
        borderColor: outDataSet?.color,
        backgroundColor: outDataSet?.bgColor,
      },
    ],
  };

  return (
    <div>
      <div className="contentInner">
        <div style={{ marginBottom: "20px" }}>
          {inData && (
            <Bar options={options} data={inData} width={500} height={200} />
          )}
        </div>
        <div>
          {outData && (
            <Bar options={options} data={outData} width={500} height={200} />
          )}
        </div>
      </div>
    </div>
  );
};
