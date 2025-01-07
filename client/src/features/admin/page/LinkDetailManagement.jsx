import { useNavigate, useParams } from "react-router-dom";
import { useLink, useDeleteLink } from "../../links/hooks/useLinks";
import { useToast } from "../../../state/ToastContext";
import { useState } from "react";
import { ErrorDisplay } from "../../shared/component/ErrorDisplay";
import dayjs from "dayjs";
import { Button } from "../../../components/Button";
import { Edit, Trash2 } from "lucide-react";
import { DetailLayout } from "../../shared/component/DetailLayout";
import { InfoGrid } from "../../shared/component/InfoGrid";
import { StatCard } from "../../shared/component/StatCard";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationPopup";
import UpdateLinkDialog from "../component/UpdateLinkDialog";

const LinkDetailManagement = () => {
  const { linkId } = useParams();
  const { data, isLoading, error } = useLink(linkId);
  console.log(data);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const deleteLink = useDeleteLink(addToast);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  if (error) {
    return (
      <ErrorDisplay
        status={error.status}
        message={error.status === 404 ? "Link not found" : "Fetching failed!"}
        backMessage={
          error.status === 404
            ? "The link you're looking for doesn't exist."
            : "Please try later!"
        }
        onBack={() => navigate("/admin/links")}
      />
    );
  }
  const isExpired = dayjs().isAfter(dayjs(data?.link?.expiryDate));
  const linkFields = [
    {
      label: "Original Url",
      value: data?.link?.originalUrl,
      type: "url",
    },
    {
      label: "Short Url",
      value: data?.link?.shortUrl,
      type: "url",
    },
    { label: "Password", value: data?.link?.password || "N/A", type: "text" },
    {
      label: "Expiry Date",
      value:
        (data?.link?.expiryDate && (
          <span className={isExpired ? "text-red-500" : "text-green-500"}>
            {dayjs(data?.link?.expiryDate).format("YYYY-MM-DD HH:mm A")}
          </span>
        )) ||
        "N/A",
    },
    {
      label: "Description",
      value: data?.link?.description || "",
      type: "textarea",
    },
    { label: "Created By", value: data?.link?.createdBy || "N/A" },
    {
      label: "Created At",
      value:
        (data?.link?.createdAt &&
          dayjs(data?.link?.createdAt).format("YYYY-MM-DD")) ||
        "Unknown",
    },
  ];

  const actions = (
    <>
      <Button
        variant="primary"
        onClick={() => setIsUpdateDialogOpen(true)}
        className="flex items-center gap-2"
        size="sm"
      >
        <Edit className="w-4 h-4" /> Update Link
      </Button>
      <Button
        variant="danger"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="flex items-center gap-2"
        size="sm"
      >
        <Trash2 className="w-4 h-4" /> Delete Link
      </Button>
    </>
  );

  const handleDelete = (items) => {
    deleteLink.mutate(items[0], {
      onSettled: (_, error) => {
        if (!error) {
          navigate("/admin/links");
        }
      },
    });
  };

  return (
    <>
      <DetailLayout title="Link Detail" isLoading={isLoading} actions={actions}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <InfoGrid fields={linkFields} />
          </div>

          <div className="lg:col-span-1 grid grid-cols-1 gap-6">
            <StatCard
              title="Clicks"
              total={data?.stats?.totalClicks}
              today={data?.stats?.newClicksToday}
              className="!h-fit"
            />
          </div>
        </div>
      </DetailLayout>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        items={[data?.link?._id]}
        onConfirm={handleDelete}
      />
      <UpdateLinkDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        link={data?.link}
      />
    </>
  );
};

export default LinkDetailManagement;
