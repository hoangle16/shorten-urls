import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";

const CustomLineChart = ({
  data,
  xKey = "name",
  xName = null,
  dataKey = "value",
  dataName = null,
  lines = null,
  tickFormatter = null,
  allowDecimals = true,
  height = "500px",
}) => {
  // const downSampledData = downSampleData(data, Math.ceil(data.length / 7));

  const defaultColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#0088fe",
    "#00c49f",
  ];

  const renderLines = () => {
    if (lines) {
      return lines.map((line, index) => (
        <Line
          key={line.dataKey}
          type="monotone"
          dataKey={line.dataKey}
          name={line.name || line.dataKey}
          stroke={line.color || defaultColors[index % defaultColors.length]}
          strokeWidth={2}
          dot={
            line.dot !== false
              ? {
                  fill:
                    line.color || defaultColors[index % defaultColors.length],
                }
              : false
          }
          activeDot={line.activeDot !== false ? { r: 6 } : false}
        />
      ));
    }

    return (
      <Line
        type="monotone"
        dataKey={dataKey}
        name={dataName || dataKey}
        stroke="#8884d8"
        strokeWidth={2}
        dot={{ fill: "#8884d8" }}
        activeDot={{ r: 6 }}
      />
    );
  };

  return (
    <div className="px-2 py-4" style={{ height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey={xKey}
            name={xName || xKey}
            stroke="#666"
            tick={{ fill: "#666" }}
            tickFormatter={tickFormatter}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: "#666" }}
            allowDecimals={allowDecimals}
          />
          <ChartTooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <Legend />
          {renderLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const downSampleData = (data, step) =>
  data.filter((_, index) => index % step === 0);

export default CustomLineChart;
