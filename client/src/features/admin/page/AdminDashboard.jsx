import { Helmet } from "react-helmet-async";
import { useAuth } from "../../auth/state/AuthContext";
import { RadioButtonGroup } from "../../../components/RadioButtonGroup";
import { useState } from "react";
import { useDashboardOverview, useDashboardChart } from "../hooks/useAdmin";
import dayjs from "dayjs";
import Loading from "../../../components/Loading";
import { Globe, Link, MousePointerClick, Users } from "lucide-react";
import CustomLineChart from "../../stats/components/CustomLineChart";
import DateRangePicker from "../../../components/DateRangePicker";
import { useToast } from "../../../state/ToastContext";

const chartTypeOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const overviewList = [
  { key: "links", label: "Links", icon: <Link size={18} /> },
  { key: "clicks", label: "Clicks", icon: <MousePointerClick size={18} /> },
  { key: "users", label: "Users", icon: <Users size={18} /> },
  { key: "domains", label: "Domains", icon: <Globe size={18} /> },
];

const AdminDashboard = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const initDateRange = {
    startDate: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  };
  const initWeekRange = {
    startDate: dayjs().subtract(3, "week").startOf("week").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("week").format("YYYY-MM-DD"),
  };
  const initMonthRange = {
    startDate: dayjs()
      .subtract(2, "month")
      .startOf("month")
      .format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
  };

  const [chartType, setChartType] = useState(chartTypeOptions[0].value);
  const [dateRange, setDateRange] = useState(initDateRange);

  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    error: overViewError,
  } = useDashboardOverview();
  const {
    data: chartData,
    isLoading: isLoadingChart,
    error: chartError,
  } = useDashboardChart({ range: chartType, ...dateRange });

  if (!isAuthenticated) {
    return <div>Please log in to view this page.</div>;
  }

  const handleChartTypeChange = (event) => {
    const chartType = event.target.value;
    setChartType(chartType);
    switch (chartType) {
      case "day":
        setDateRange(initDateRange);
        break;
      case "week":
        setDateRange(initWeekRange);
        break;
      case "month":
        setDateRange(initMonthRange);
        break;
      default:
        console.error(`Invalid chartType: ${chartType}`);
        break;
    }
  };

  const handleDateRangeChange = ({ startDate, endDate }) => {
    const rangeDiff = dayjs(endDate)
      .endOf(chartType)
      .diff(dayjs(startDate).startOf(chartType), chartType);
    console.log(`test: type ${chartType}, diff: ${rangeDiff}`);
    if (rangeDiff > 0) {
    }
    setDateRange({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Shorten URLs</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {isLoadingOverview ? (
              <div className="col-span-4 h-52 bg-white rounded-xl shadow-lg">
                <div className="flex items-center justify-center h-full">
                  <Loading size="2em" />
                </div>
              </div>
            ) : (
              overviewList.map((item) => (
                <div
                  key={item.key}
                  className="col-span-1 md:col-span-2 lg:col-span-1"
                >
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 flex items-center gap-2">
                      {item.label} {item.icon}
                    </h3>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <p className="text-gray-900 text-3xl font-bold mb-2">
                          {overviewData[item.key].total}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total {item.label}
                        </p>
                      </div>
                      <p className="text-green-400 text-sm">
                        +{overviewData[item.key].today} today
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Chart */}
          <div>
            {isLoadingChart ? (
              <div className="w-full h-[500px] bg-white rounded-xl shadow-lg">
                <div className="flex items-center justify-center h-full">
                  <Loading size="2em" />
                </div>
              </div>
            ) : (
              <div className="bg-white p-6">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                  <h1 className="text-lg font-semibold text-gray-900 ">
                    System Statistics
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-[220px]">
                      <RadioButtonGroup
                        name="example"
                        required
                        options={chartTypeOptions}
                        value={chartType}
                        onChange={handleChartTypeChange}
                        disabled={false}
                      />
                    </div>
                    <div>
                      <DateRangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        mode={chartType}
                        className="w-[205px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <CustomLineChart
                    data={chartData}
                    xKey="date"
                    lines={[
                      { dataKey: "links", name: "Links", color: "#8884d8" },
                      { dataKey: "clicks", name: "Clicks", color: "#82ca9d" },
                      { dataKey: "users", name: "Users", color: "#ffc658" },
                      // { dataKey: "domains", name: "Domains", color: "#ff7300" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
