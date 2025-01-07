import { useEffect, useState } from "react";
import LinkList from "../components/LinkList";
import { linkApi } from "../api/linkApi";
import { useAuth } from "../../auth/state/AuthContext";
import { useToast } from "../../../state/ToastContext";
import { Helmet } from "react-helmet-async";

const LinksManager = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await handleFilterChange({ userId: user?._id, page: 1, limit: 10 });
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleFilterChange = async (filterData) => {
    try {
      const response = await linkApi.getLinksByUserId({
        userId: user?._id,
        ...filterData,
      });

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
        <title>Links Manager | Shorten URLs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <LinkList
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

export default LinksManager;
