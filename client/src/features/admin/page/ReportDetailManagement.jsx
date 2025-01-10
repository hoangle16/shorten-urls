import { useNavigate, useParams } from "react-router-dom";
import { useDeleteReport, useReportById } from "../../report/hooks/useReports";
import { useToast } from "../../../state/ToastContext";
import { ErrorDisplay } from "../../shared/component/ErrorDisplay";
import dayjs from "dayjs";
import { Button } from "../../../components/Button";
import { Edit } from "lucide-react";
import { DetailLayout } from "../../shared/component/DetailLayout";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationPopup";
import UpdateReportStatusDialog from "../component/UpdateReportStatusDialog";
import { InfoGrid } from "../../shared/component/InfoGrid";
import { useState } from "react";
import { Link } from "react-router-dom";

const ReportDetailManagement = () => {
  const { reportId } = useParams();
  const { data, isLoading, error } = useReportById(reportId);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const deleteReport = useDeleteReport(addToast);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  if (error) {
    return (
      <ErrorDisplay
        status={error.status}
        message={error.status === 404 ? "Report not found" : "Fetching failed!"}
        backMessage={
          error.status === 404
            ? "The report you're looking for doesn't exist."
            : "Please try again later!"
        }
        onBack={() => navigate("/admin/reports")}
      />
    );
  }

  const reportFields = [
    {
      label: "Short Link",
      value: (
        <div onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/admin/links/${data?.linkId?._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="a-link-default"
          >
            {data?.linkId?.shortUrl}
          </Link>
        </div>
      ),
    },
    {
      label: "Short Link Status",
      value: data?.linkId?.isDisabled ? (
        <span className="text-red-500">Disabled</span>
      ) : (
        <span className="text-green-500">Enabled</span>
      ),
    },
    {
      label: "Reason",
      value:
        (
          <span>
            {data?.type?.charAt(0).toUpperCase()}
            {data?.type?.slice(1)}
          </span>
        ) || "",
    },
    {
      label: "Status",
      value: (
        <span
          className={`${
            data?.status === "pending"
              ? "text-orange-400"
              : data?.status === "reviewed"
              ? "text-green-500"
              : data?.status === "resolved"
              ? "text-blue-500"
              : "text-red-500"
          }`}
        >
          {data?.status?.charAt(0).toUpperCase()}
          {data?.status.slice(1)}
        </span>
      ),
    },
    { label: "Reporter", value: data?.reportedBy || "" },
    { label: "Reporter Notes", value: data?.description || "" },
    { label: "Resolver", value: data?.resolvedBy || "" },
    { label: "Resolver Notes", value: data?.adminNotes || "" },
    {
      label: "Resolved Date",
      value: data?.resolvedDate
        ? dayjs(data?.resolvedDate).format("YYYY-MM-DD HH:mm")
        : "",
    },
    {
      label: "Reported At",
      value: dayjs(data?.createdAt).format("YYYY-MM-DD HH:mm"),
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
        <Edit className="w-4 h-4" />
        Change Status
      </Button>
      <Button
        variant="danger"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="flex items-center gap-2"
        size="sm"
      >
        Delete Report
      </Button>
    </>
  );

  const handleDelete = (items) => {
    deleteReport.mutate(items[0], {
      onSuccess: () => {
        navigate("/admin/reports");
      },
    });
  };

  return (
    <>
      <DetailLayout
        title="Report Detail"
        isLoading={isLoading}
        actions={actions}
      >
        <InfoGrid fields={reportFields} />
      </DetailLayout>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        items={[data?._id]}
        onConfirm={handleDelete}
      />
      <UpdateReportStatusDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        report={data}
      />
    </>
  );
};

export default ReportDetailManagement;
