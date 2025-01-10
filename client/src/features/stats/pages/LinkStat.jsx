import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { linkApi } from "../../links/api/linkApi";
import Loading from "../../../components/Loading";
import {
  Globe,
  Home,
  LaptopMinimalCheck,
  MapPin,
  PanelTop,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/Tabs";
import { statApi } from "../api/statApi";
import dayjs from "dayjs";
import CustomLineChart from "../components/CustomLineChart";
import CustomPieChart from "../components/CustomPieChart";
import CustomBarChart from "../components/CustomBarChart";
import DateRangePicker from "../../../components/DateRangePicker";
import { timeFromNow } from "../../../utils/dateUtils";
import { Helmet } from "react-helmet-async";
import LinkStatList from "../components/LinkStatList";
import { Button } from "../../../components/Button";

const TABS = {
  SUMMARY: "summary",
  COUNTRIES: "countries",
  PLATFORMS: "platforms",
  BROWSERS: "browsers",
  REFERRERS: "referrers",
};

const TAB_CONFIGS = {
  [TABS.SUMMARY]: {
    icon: Home,
    label: "Summary",
    groupBy: "date",
    ChartComponent: CustomLineChart,
    chartProps: {
      xKey: "name",
      dataKey: "value",
      dataName: "Clicks",
      allowDecimals: false,
      height: "500px",
    },
  },
  [TABS.COUNTRIES]: {
    icon: MapPin,
    label: "Countries",
    groupBy: "country",
    ChartComponent: CustomPieChart,
    chartProps: { xKey: "name", dataKey: "value", height: "500px" },
  },
  [TABS.PLATFORMS]: {
    icon: LaptopMinimalCheck,
    label: "Platforms",
    groupBy: "os",
    ChartComponent: CustomPieChart,
    chartProps: { xKey: "name", dataKey: "value", height: "500px" },
  },
  [TABS.BROWSERS]: {
    icon: PanelTop,
    label: "Browsers",
    groupBy: "browser",
    ChartComponent: CustomPieChart,
    chartProps: { xKey: "name", dataKey: "value", height: "500px" },
  },
  [TABS.REFERRERS]: {
    icon: Globe,
    label: "Referrers",
    groupBy: "referrer",
    ChartComponent: CustomBarChart,
    chartProps: {
      layout: "horizontal",
      maxBarSize: 60,
      allowDecimalsYAxis: false,
      height: "500px",
    },
  },
};

const LinkStat = () => {
  const { linkId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(TABS.SUMMARY);
  const [linkInfo, setLinkInfo] = useState(null);
  const [isLinkInfoLoading, setIsLinkInfoLoading] = useState(true);
  const [tabData, setTabData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });
  const [statsInfo, setStatsInfo] = useState({ stats: [], pagination: {} });

  const navigate = useNavigate();

  useEffect(() => {
    const initializeLinkInfo = async () => {
      if (location.state?.linkInfo) {
        setLinkInfo(location.state.linkInfo);
        setIsLinkInfoLoading(false);
        return;
      }

      try {
        setIsLinkInfoLoading(true);
        const data = await linkApi.getLinkById(linkId);
        setLinkInfo(data.link);
      } catch (error) {
        console.error("Failed to fetch link info:", error);
      } finally {
        setIsLinkInfoLoading(false);
      }
    };

    initializeLinkInfo();
  }, [linkId, location.state]);

  useEffect(() => {
    const fetchTabData = async () => {
      try {
        const data = await statApi.getStatsByLinkId({
          linkId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          groupBy: TAB_CONFIGS[activeTab].groupBy,
        });
        setTabData(data);
      } catch (error) {
        console.error("Failed to fetch tab data:", error);
        setTabData([]);
      }
    };

    fetchTabData();
  }, [activeTab, dateRange, linkId]);

  useEffect(() => {
    const fetchStatList = async () => {
      try {
        const { stats, pagination } = await statApi.getStatListByLinkId({
          linkId,
        });
        setStatsInfo({ stats, pagination });
      } catch (err) {
        console.error("Failed to fetch stat list:", err);
        setStatsInfo({ stats: [], pagination: {} });
      }
    };

    fetchStatList();
  }, []);

  const handleDateRangeChange = (newRange) => {
    setDateRange({
      startDate: dayjs(newRange.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(newRange.endDate).format("YYYY-MM-DD"),
    });
  };

  const sortedTabData = useMemo(() => {
    return [...tabData].sort((a, b) => b.value - a.value);
  }, [tabData]);

  const renderLinkInfo = () => {
    if (isLinkInfoLoading) return <Loading size="2rem" />;

    return (
      <>
        <Helmet>
          <title>Link Stats - {linkInfo.shortUrl} | Shorten URLs</title>
        </Helmet>
        <h1 className="text-lg text-gray-700 font-semibold mb-2">Link Info</h1>
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div>
            <a
              className="a-link-default text-xl block"
              href={linkInfo.originalUrl}
              target="_blank"
            >
              {linkInfo.originalUrl}
            </a>
            <a
              className="a-link-default text-sm"
              href={linkInfo.shortUrl}
              target="_blank"
            >
              {linkInfo.shortUrl}
            </a>
          </div>
          <div>
            <p className="text-gray-700">{timeFromNow(linkInfo.createdAt)}</p>
          </div>
        </div>
      </>
    );
  };

  const renderTabContent = () => {
    const { ChartComponent, chartProps } = TAB_CONFIGS[activeTab];
    const showSidebar = activeTab !== TABS.SUMMARY;

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-700">
            {TAB_CONFIGS[activeTab].label}
          </h1>
          <div>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-[210px]"
            />
          </div>
        </div>

        {tabData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div
              className={`border rounded-xl ${
                showSidebar ? "lg:col-span-8" : "lg:col-span-12"
              }`}
            >
              <ChartComponent data={tabData} {...chartProps} />
            </div>

            {showSidebar && (
              <div className="py-4 px-2 lg:col-span-4">
                <h2 className="text-lg font-semibold mb-4">
                  Top {TAB_CONFIGS[activeTab].label}
                </h2>
                {sortedTabData.slice(0, 10).map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between mb-2 border-b"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="bg-gray-900 mb-1 px-2 text-white ml-2">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No data available for this period.
          </p>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white mx-auto p-6 rounded-xl border shadow-lg mb-8">
          {renderLinkInfo()}
        </div>

        <div className="bg-white mx-auto p-6 rounded-xl border shadow-lg mb-8">
          <Tabs
            defaultValue={TABS.SUMMARY}
            value={activeTab}
            onValueChange={setActiveTab}
            variant="underline"
          >
            <TabsList className="flex justify-between">
              {Object.entries(TAB_CONFIGS).map(
                ([value, { icon: Icon, label }]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex gap-2 items-center"
                  >
                    <Icon size={16} /> {label}
                  </TabsTrigger>
                )
              )}
            </TabsList>

            {Object.keys(TAB_CONFIGS).map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue}>
                {renderTabContent()}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        {activeTab === TABS.SUMMARY && (
          <div className="space-y-4">
            <LinkStatList
              data={statsInfo}
              title="Recent Activity"
              page={1}
              limit={10}
              showFilter={false}
              showPagination={false}
              showEllipsis={false}
              byUser={false}
            />
            <div className="w-fit">
              <Button
                variant="primary"
                className="w-full"
                size="sm"
                onClick={() =>
                  navigate(`/user/links/${linkId}/stat-list`, {
                    state: { linkInfo },
                  })
                }
              >
                View All
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkStat;
