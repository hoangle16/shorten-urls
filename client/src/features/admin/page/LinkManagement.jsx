import dayjs from "dayjs";
import DataManagement from "../../../components/DataManagement";
import {
  useDeleteLink,
  useDeleteLinks,
  useLinks,
} from "../../links/hooks/useLinks";
import UpdateLinkDialog from "../component/UpdateLinkDialog";
import { Button } from "../../../components/Button";

const LinkManagement = () => {
  const columns = [
    {
      key: "originalUrl",
      title: "Original URL",
      width: "250px",
    },
    {
      key: "shortUrl",
      title: "Short URL",
      width: "250px",
    },
    {
      key: "password",
      title: "Access",
      render: (value) => (
        <div>
          {value ? (
            <span className="text-red-500">Private</span>
          ) : (
            <span className="text-green-500">Public</span>
          )}
        </div>
      ),
    },
    {
      key: "expiryDate",
      title: "Expiry Date",
      sortable: true,
      width: "200px",
      render: (value) => {
        if (value === undefined || value === null) {
          return <div title="valid">N/A</div>;
        }
        const isExpired = dayjs(value).isBefore(dayjs());
        return (
          <div
            className={`${isExpired ? "text-red-500" : "text-green-500"}`}
            title={isExpired ? "Expired" : "Valid"}
          >
            {dayjs(value).format("YYYY-MM-DD HH:mm A")}
          </div>
        );
      },
    },
    {
      key: "createdBy",
      title: "Created By",
      render: (value) => {
        return value === "Unknown" ? <div>N/A</div> : <div>{value}</div>;
      },
    },
    {
      key: "createdAt",
      title: "Created At",
      sortable: true,
      render: (value) => <div>{dayjs(value).format("YYYY-MM-DD HH:mm")}</div>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row, { onUpdate, onDelete, navigate }) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/links/${row._id}`);
            }}
          >
            Detail
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/links/${row._id}/stat`);
            }}
          >
            Stat
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(row);
            }}
          >
            Update
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
      key: "hasPassword",
      placeholder: "Select a access mode",
      options: [
        { label: "Public", value: "false" },
        { label: "Private", value: "true" },
      ],
      parseValue: (value) => value === "true",
    },
    {
      key: "isExpired",
      placeholder: "Select an expiration status",
      options: [
        { label: "Expired", value: "true" },
        { label: "Not expired", value: "false" },
      ],
      parseValue: (value) => value === "true",
    },
  ];
  return (
    <DataManagement
      title="Link Management"
      pageTitle="Link Management | Shorten URLs"
      columns={columns}
      useDataQuery={useLinks}
      useDeleteMutation={useDeleteLink}
      useDeleteManyMutation={useDeleteLinks}
      filterOptions={filterOptions}
      UpdateDialog={UpdateLinkDialog}
      updateDialogProps={{
        itemPropName: "link",
      }}
      searchPlaceholder="Enter text to search..."
      dataPath="links"
      paginationPath="pagination"
      pathPrefix="/admin/links"
    />
  );
};

export default LinkManagement;
