import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { linkApi } from "../api/linkApi";
import Loading from "../../../components/Loading";
import { Alert } from "../../../components/Alert";
import { Helmet } from "react-helmet-async";
import dayjs from "dayjs";
import { Button } from "../../../components/Button";
import { ChartNoAxesColumn, Edit } from "lucide-react";

const LinkDetail = () => {
  const { linkId } = useParams();
  const [linkInfo, setLinkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLinkInfo = async () => {
      try {
        setIsLoading(true);
        const data = await linkApi.getLinkById(linkId);
        setLinkInfo(data);
      } catch (err) {
        console.error("Failed to fetch link info:", err);
        setError(
          err?.response?.data?.message || "Failed to fetch link details!"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkInfo();
  }, [linkId]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
        <Loading size="2rem" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error" className="max-w-3xl mx-auto">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Link Details - {linkInfo?.shortUrl} | Shorten URLs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Link Details</h1>

          <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
            <div className="space-y-2 border-b">
              <h3 className="text-sm font-medium text-gray-700">
                Original URL
              </h3>
              <p className="text-gray-900 break-all">{linkInfo?.originalUrl}</p>
            </div>

            <div className="space-y-2 border-b">
              <h3 className="text-sm font-medium text-gray-700">Short URL</h3>
              <p className="text-gray-900">{linkInfo?.shortUrl}</p>
            </div>

            {linkInfo?.password && (
              <div className="space-y-2 border-b">
                <h3 className="text-sm font-medium text-gray-700">
                  Password Protected
                </h3>
                <p className="text-gray-900">Yes</p>
              </div>
            )}

            {linkInfo?.expiryDate && (
              <div className="space-y-2 border-b">
                <h3 className="text-sm font-medium text-gray-700">
                  Expiry Date
                </h3>
                <p className="text-gray-900">
                  {dayjs(linkInfo.expiryDate).format("YYYY-MM-DD")}
                </p>
              </div>
            )}

            {linkInfo?.description && (
              <div className="space-y-2 border-b">
                <h3 className="text-sm font-medium text-gray-700">
                  Description
                </h3>
                <p className="text-gray-900">{linkInfo.description}</p>
              </div>
            )}

            <div className="space-y-2 border-b">
              <h3 className="text-sm font-medium text-gray-700">Created At</h3>
              <p className="text-gray-900">
                {dayjs(linkInfo?.createdAt).format("YYYY-MM-DD HH:mm:ss A")}
              </p>
            </div>

            <div className="space-y-2 border-b">
              <h3 className="text-sm font-medium text-gray-700">
                Last Updated
              </h3>
              <p className="text-gray-900">
                {dayjs(linkInfo?.updatedAt).format("YYYY-MM-DD HH:mm:ss A")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => navigate("edit")}>
                <div className="flex items-center gap-2">
                  <Edit size={20} /> Edit
                </div>
              </Button>
              <Button variant="secondary" onClick={() => navigate("stat")}>
                <div className="flex items-center gap-2">
                  <ChartNoAxesColumn size={20} /> Statistics
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkDetail;
