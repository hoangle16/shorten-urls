import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useParams } from "react-router-dom";
import { linkApi } from "../../links/api/linkApi";
import { useToast } from "../../../state/ToastContext";
import { timeFromNow } from "../../../utils/dateUtils";
import Loading from "../../../components/Loading";
import LinkStatList from "../components/LinkStatList";
import { statApi } from "../api/statApi";

const ListStatByLinkId = () => {
  const { linkId } = useParams();
  const location = useLocation();
  const [linkInfo, setLinkInfo] = useState(null);
  const [isLinkInfoLoading, setIsLinkInfoLoading] = useState(true);
  const [statsInfo, setStatsInfo] = useState({ stats: [], pagination: {} });

  const { addToast } = useToast();

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
        setLinkInfo(data);
      } catch (err) {
        console.error("Failed to fetch link info:", err);
        addToast("Failed to fetch link info", {
          variant: "error",
        });
      } finally {
        setIsLinkInfoLoading(false);
      }
    };

    initializeLinkInfo();
  }, [linkId, location.state]);

  const fetchStatList = async (params) => {
    try {
      const { stats, pagination } = await statApi.getStatListByLinkId({
        linkId,
        ...params,
      });
      setStatsInfo({ stats, pagination });
    } catch (err) {
      console.error("Failed to fetch stats list:", err);
      addToast("Failed to fetch stats list", {
        variant: "error",
      });
      setStatsInfo({ stats: [], pagination: {} });
    }
  };

  useEffect(() => {
    fetchStatList();
  }, [linkId]);

  const handleFilterChange = async (newFilterData) => {
    fetchStatList({ ...newFilterData });
  };

  if (isLinkInfoLoading) {
    return <Loading size="2rem" />;
  }
  return (
    <>
      <Helmet>
        <title>List Stats | Shorten URLs</title>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white mx-auto p-6 rounded-xl border shadow-lg mb-8">
            <h1 className="text-lg text-gray-700 font-semibold mb-2">
              Link Info
            </h1>
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
                <p className="text-gray-700">
                  {timeFromNow(linkInfo.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <LinkStatList
              data={statsInfo}
              onFilterChange={handleFilterChange}
              title="Stat List"
              page={1}
              limit={10}
              showFilter={true}
              showPagination={true}
              showEllipsis={false}
              byUser={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ListStatByLinkId;
