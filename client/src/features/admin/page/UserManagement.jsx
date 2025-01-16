import dayjs from "dayjs";
import DataManagement from "../../../components/DataManagement";
import {
  useBanUser,
  useDeleteUser,
  useDeleteUsers,
  useUsers,
} from "../../users/hooks/useUsers";
import UpdateUserDialog from "../component/UpdateUserDialog";
import { Button } from "../../../components/Button";
import { useToast } from "../../../state/ToastContext";
import { useState } from "react";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { UserRoundX } from "lucide-react";

const UserManagement = () => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [itemsToBan, setItemsToBan] = useState([]);
  const { addToast } = useToast();
  const banUser = useBanUser(addToast);

  const handleBanUser = (user) => {
    setItemsToBan([user]);
    setIsConfirmDialogOpen(true);
  };
  const handleBanConfirm = (users) => {
    if (users.length === 1) {
      banUser.mutate({ userId: users[0]?._id, isBanned: !users[0]?.isBanned });
    } else {
      // TODO: handle bulk action
    }
    setIsConfirmDialogOpen(false);
    setItemsToBan(null);
  };
  const columns = [
    {
      key: "username",
      title: "Username",
      sortable: true,
      width: "150px",
    },
    {
      key: "email",
      title: "Email",
      sortable: true,
      width: "200px",
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
      key: "isBanned",
      title: "Status",
      render: (_, row) =>
        row.isBanned ? (
          <div className="text-red-500">Banned</div>
        ) : (
          <div className="text-green-500">Allowed</div>
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
            variant={`${row.isBanned ? "success" : "warning"}`}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleBanUser(row);
            }}
            className="w-16"
          >
            {row.isBanned ? "UnBan" : "Ban"}
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
      key: "isBanned",
      placeholder: "Select ban status",
      options: [
        { label: "Banned", value: "true" },
        { label: "Allowed", value: "false" },
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
    <>
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
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleBanConfirm}
        title={`Confirm ${itemsToBan?.[0]?.isBanned ? "Unban" : "Ban"}`}
        ICON={<UserRoundX size={60} className="text-gray-800 mb-6" />}
        confirmText={`Are you sure you want to ${
          itemsToBan?.[0]?.isBanned ? "unban" : "ban"
        } user "${itemsToBan?.[0]?.username}"!`}
        items={itemsToBan}
      />
    </>
  );
};

export default UserManagement;
