import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const CustomBarChart = ({
  data,
  xAxisKey = "name",
  bars = [{ dataKey: "value", name: "Value" }],
  layout = "vertical",
  stackBars = false,
  gridLines = true,
  maxBarSize = 60,
  barGap = 0.2,
  barCategoryGap = "35%",
  allowDecimalsXAxis = true,
  allowDecimalsYAxis = true,
  showLegend = false,
  height = "500px",
}) => {
  // Process bars configuration
  const processedBars = bars.map((bar, index) => ({
    ...bar,
    color: bar.color || COLORS[index % COLORS.length],
  }));

  const calculateBarSize = () => {
    if (data.length <= 3) return maxBarSize * 0.8; // Giảm kích thước nếu ít dữ liệu
    if (data.length <= 5) return maxBarSize * 0.6;
    return undefined;
  };

  const barSize = calculateBarSize();

  return (
    <div className="px-2 py-4" style={{ height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={barSize}
          barGap={barGap}
          barCategoryGap={barCategoryGap}
        >
          {gridLines && <CartesianGrid strokeDasharray="3 3" opacity={0.5} />}
          {layout === "vertical" ? (
            <>
              <XAxis
                type="number"
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                allowDecimals={allowDecimalsXAxis}
              />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                allowDecimals={allowDecimalsYAxis}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                allowDecimals={allowDecimalsXAxis}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                allowDecimals={allowDecimalsYAxis}
              />
            </>
          )}
          <ChartTooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
              padding: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: "15px",
              }}
            />
          )}
          {processedBars.map((barConfig, index) => (
            <Bar
              key={barConfig.dataKey}
              label={{ position: "top", color: "black" }}
              dataKey={barConfig.dataKey}
              name={barConfig.name || barConfig.dataKey}
              fill={barConfig.color}
              stackId={stackBars ? "stack" : undefined}
              radius={[6, 6, 0, 0]}
              className="hover:opacity-80 transition-opacity duration-300"
              maxBarSize={maxBarSize}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
