import { useEffect, useState } from "react";
import { useToast } from "../../../state/ToastContext";
import { statApi } from "../api/statApi";
import LinkStatList from "../components/LinkStatList";
import dayjs from "dayjs";
import { Helmet } from "react-helmet-async";

const StatsManager = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await handleFilterChange({
        startDate: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
      });
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleFilterChange = async (filterData) => {
    try {
      const response = await statApi.getStatsByUser(filterData);

      setData(response);
    } catch (err) {
      console.error("Fetch data failed :", err);
      addToast(
        err?.response?.data?.message ||
          "Failed to fetch data. Please try later.",
        {
          variant: "error",
          position: "top-right",
          duration: 5000,
        }
      );
    }
  };
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
        <title>Stats Manager | Shorten URLs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <LinkStatList
            data={data}
            onFilterChange={handleFilterChange}
            limit={10}
            page={1}
            showEllipsis={false}
          />
        </div>
      </div>
    </>
  );
};

export default StatsManager;
