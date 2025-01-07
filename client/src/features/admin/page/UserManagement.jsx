import dayjs from "dayjs";
import DataManagement from "../../../components/DataManagement";
import {
  useDeleteUser,
  useDeleteUsers,
  useUsers,
} from "../../users/hooks/useUsers";
import UpdateUserDialog from "../component/UpdateUserDialog";
import { Button } from "../../../components/Button";

const UserManagement = () => {
  const columns = [
    {
      key: "username",
      title: "Username",
      sortable: true,
      width: "150px"
    },
    {
      key: "email",
      title: "Email",
      sortable: true,
      width: "200px"
    },
    {
      key: "fullName",
      title: "Full Name",
      width: "200px",
      render: (_, row) => (
        <>
          {row.firstName} {row.lastName}
        </>
      ),
    },
    {
      key: "isVerify",
      title: "Verified",
      render: (_, row) =>
        row.isVerify ? (
          <div className="text-green-500">Yes</div>
        ) : (
          <div className="text-red-500">No</div>
        ),
    },
    {
      key: "role",
      title: "Role",
      sortable: true,
      render: (value) => (
        <>
          {value.charAt(0).toUpperCase()}
          {value.slice(1)}
        </>
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      sortable: true,
      render: (value) => <>{dayjs(value).format("YYYY-MM-DD")}</>,
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
              navigate(`/admin/users/${row._id}`);
            }}
          >
            Detail
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
      key: "isVerify",
      placeholder: "Select verify status",
      options: [
        { label: "Verified", value: "true" },
        { label: "Unverified", value: "false" },
      ],
      parseValue: (value) => value === "true",
    },
    {
      key: "role",
      placeholder: "Select a role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
    },
  ];

  return (
    <DataManagement
      title="User Manager"
      pageTitle="User Manager | Shorten URLs"
      columns={columns}
      useDataQuery={useUsers}
      useDeleteMutation={useDeleteUser}
      useDeleteManyMutation={useDeleteUsers}
      filterOptions={filterOptions}
      UpdateDialog={UpdateUserDialog}
      updateDialogProps={{
        itemPropName: "user",
      }}
      searchPlaceholder="Enter text to search..."
      dataPath="users"
      paginationPath="pagination"
      pathPrefix="/admin/users"
    />
  );
};

export default UserManagement;
