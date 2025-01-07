import React, { useEffect, useState } from "react";
import ShortenForm from "../../links/components/ShortenForm";
import StatOverviewCard from "../../stats/components/StatOverviewCard";
import CustomLineChart from "../../stats/components/CustomLineChart";
import LinkList from "../../links/components/LinkList";
import LinkStatList from "../../stats/components/LinkStatList";
import { useToast } from "../../../state/ToastContext";
import { statApi } from "../../stats/api/statApi";
import { linkApi } from "../../links/api/linkApi";
import { useAuth } from "../../auth/state/AuthContext";
import { Button } from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const UserDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    clickData: {
      stats: [],
      totalLinks: 0,
      newLinksToday: 0,
      totalClicks: 0,
      newClicksToday: 0,
    },
    recentLinks: null,
    recentActivity: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [clickData, recentLinks, recentStats] = await Promise.all([
          statApi.getClickStatsByUser(),
          linkApi.getLinksByUserId({ userId: user._id, page: 1, limit: 5 }),
          statApi.getStatsByUser(),
        ]);

        setData((prev) => ({
          ...prev,
          clickData: {
            stats: clickData.stats,
            totalLinks: clickData.totalLinks,
            newLinksToday: clickData.newLinksToday,
            totalClicks: clickData.totalClicks,
            newClicksToday: clickData.newClicksToday,
          },
          recentLinks: recentLinks,
          recentActivity: recentStats,
        }));
      } catch (err) {
        console.error("Fetch data failed :", err);
        addToast("Failed to fetch data. Please try later.", {
          variant: "error",
          position: "top-right",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // const handleFilterChange = async (newFilterData) => {
  //   const recentLinks = await linkApi.getLinksByUserId({
  //     userId: user._id,
  //     ...newFilterData,
  //   });

  //   setData((prev) => ({
  //     ...prev,
  //     recentLinks: recentLinks,
  //   }));
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>User Dashboard | Shorten URLs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Shorten Form Section */}
        <div className="max-w-full mx-auto mb-8">
          <ShortenForm />
        </div>

        {/* Stats and Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Column */}
          <div className="lg:col-span-1 grid grid-rows-2 gap-6 h-[460px]">
            <StatOverviewCard
              title="Links"
              value={data.clickData.totalLinks}
              todayValue={data.clickData.newLinksToday}
            />
            <StatOverviewCard
              title="Clicks"
              value={data.clickData.totalClicks}
              todayValue={data.clickData.newClicksToday}
            />
          </div>

          {/* Chart Column */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg h-[460px]">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Recent Clicks
            </h2>
            <div className="w-full">
              <CustomLineChart
                data={data.clickData.stats}
                xKey="date"
                dataKey="clicks"
                dataName="Clicks"
                allowDecimals={false}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                height="400px"
              />
            </div>
          </div>
        </div>

        {/* Recent Links and Recent Activity  */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          {/* Recent Links Section */}
          <div className="xl:col-span-6 p-6 border rounded-xl h-fit lg:mb-6 space-y-4">
            <LinkList
              data={data.recentLinks}
              title="Recent Links"
              page={1}
              limit={5}
              // onFilterChange={handleFilterChange}
              showFilter={false}
              showPagination={false}
            />
            <div className="w-fit">
              <Button
                variant="primary"
                className="w-full"
                size="sm"
                onClick={() => navigate("/user/links")}
              >
                View All
              </Button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="xl:col-span-6 p-6 border rounded-xl h-fit space-y-4">
            <LinkStatList
              data={data.recentActivity}
              title="Recent Activity"
              page={1}
              limit={10}
              showFilter={false}
              showPagination={false}
            />
            <div className="w-fit">
              <Button
                variant="primary"
                className="w-full"
                size="sm"
                onClick={() => navigate("/user/stats")}
              >
                View All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
