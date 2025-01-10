import dayjs from "dayjs";
import DataManagement from "../../../components/DataManagement";
import {
  useReports,
  useDeleteReport,
  useDeleteReports,
} from "../../report/hooks/useReports";
import { Button } from "../../../components/Button";
import { Link } from "react-router-dom";
import Popover from "../../../components/Popover";
import { NotebookText } from "lucide-react";
import UpdateReportStatusDialog from "../component/UpdateReportStatusDialog";

const ReportManagement = () => {
  const columns = [
    {
      key: "link",
      title: "Short Link",
      width: "250px",
      render: (value) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/admin/links/${value._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="a-link-default"
          >
            {value.shortUrl}
          </Link>
        </div>
      ),
    },
    {
      key: "type",
      title: "Reason",
      render: (value) => (
        <span>
          {value?.charAt(0).toUpperCase()}
          {value.slice(1)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        let className = "";
        switch (value) {
          case "pending":
            className = "text-orange-400";
            break;
          case "reviewed":
            className = "text-green-500";
            break;
          case "resolved":
            className = "text-blue-500";
            break;
          case "rejected":
            className = "text-red-500";
            break;
          default:
            break;
        }
        return (
          <span className={`${className}`}>
            {value?.charAt(0).toUpperCase()}
            {value.slice(1)}
          </span>
        );
      },
    },
    {
      key: "reportedBy",
      title: "Reporter",
      render: (value) => <p className="text-center">{value ? value : "-"}</p>,
    },
    {
      key: "description",
      title: "Reporter Notes",
      render: (value) =>
        value ? (
          <div className="text-center">
            <Popover
              content={
                <div className="px-4 py-2 rounded-lg shadow-lg">{value}</div>
              }
              trigger="hover"
              position="top"
              align="left"
              offset={2}
            >
              <NotebookText size={16} />
            </Popover>
          </div>
        ) : (
          <div>
            <p className="text-center">-</p>
          </div>
        ),
    },
    {
      key: "resolvedBy",
      title: "Resolver",
      render: (value) => <p className="text-center">{value ? value : "-"}</p>,
    },
    {
      key: "adminNotes",
      title: "Resolver Notes",
      render: (value) =>
        value ? (
          <div className="text-center">
            <Popover
              content={
                <div className="px-4 py-2 rounded-lg shadow-lg">{value}</div>
              }
              trigger="hover"
              position="top"
              align="right"
            >
              <NotebookText size={16} />
            </Popover>
          </div>
        ) : (
          <div>
            <p className="text-center">-</p>
          </div>
        ),
    },
    {
      key: "resolvedDate",
      title: "Resolved Date",
      width: "150px",
      render: (value) =>
        value ? (
          dayjs(value).format("YYYY-MM-DD")
        ) : (
          <div>
            <p className="text-center">-</p>
          </div>
        ),
    },
    {
      key: "createdAt",
      title: "Reported At",
      width: "200px",
      render: (value) => dayjs(value).format("YYYY-MM-DD"),
      sortable: true,
    },
    {
      key: "actions",
      title: "Actions",
      width: "380px",
      render: (_, row, { navigate, onUpdate, onDelete }) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/reports/${row._id}`);
            }}
          >
            Detail
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(row);
            }}
          >
            Change Status
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row._id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    {
      key: "type",
      placeholder: "Select a report's reason",
      options: [
        { label: "Spam", value: "spam" },
        { label: "Abuse", value: "abuse" },
        { label: "Offensive", value: "offensive" },
        { label: "Other", value: "other" },
      ],
    },
    {
      key: "status",
      placeholder: "Select a report's status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Reviewed", value: "reviewed" },
        { label: "Resolved", value: "resolved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
  ];

  return (
    <DataManagement
      title="Report Management"
      pageTitle="Link Management | Shorten URLs"
      columns={columns}
      useDataQuery={useReports}
      useDeleteMutation={useDeleteReport}
      useDeleteManyMutation={useDeleteReports}
      filterOptions={filterOptions}
      UpdateDialog={UpdateReportStatusDialog}
      updateDialogProps={{ itemPropName: "report" }}
      searchPlaceholder="For short link or description"
      dataPath="reports"
      paginationPath="pagination"
      pathPrefix=""
    />
  );
};

export default ReportManagement;
