import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, Trash2, UserRoundCheck, UserRoundX } from "lucide-react";
import dayjs from "dayjs";
import { DetailLayout } from "../../shared/component/DetailLayout";
import { ErrorDisplay } from "../../shared/component/ErrorDisplay";
import { StatCard } from "../../shared/component/StatCard";
import { InfoGrid } from "../../shared/component/InfoGrid";
import { useBanUser, useDeleteUser, useUser } from "../../users/hooks/useUsers";
import { useToast } from "../../../state/ToastContext";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationPopup";
import UpdateUserDialog from "../component/UpdateUserDialog";
import { Button } from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";

const UserDetail = () => {
  const { userId } = useParams();
  const { data, isLoading, error } = useUser(userId);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const deleteUser = useDeleteUser(addToast);
  const banUser = useBanUser(addToast);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  const isBanned = !!data?.user?.isBanned;

  if (error) {
    return (
      <ErrorDisplay
        status={error.status}
        message={error.status === 404 ? "User not found" : "Fetching failed!"}
        backMessage={
          error.status === 404
            ? "The user you're looking for doesn't exist."
            : "Please try later!"
        }
        onBack={() => navigate("/admin/users")}
      />
    );
  }

  const userFields = [
    { label: "Username", value: data?.user?.username || "" },
    { label: "Email", value: data?.user?.email || "" },
    { label: "First Name", value: data?.user?.firstName || "" },
    { label: "Last Name", value: data?.user?.lastName || "" },
    {
      label: "Role",
      value:
        data?.user?.role?.charAt(0).toUpperCase() + data?.user?.role?.slice(1),
    },
    {
      label: "Verify",
      value: data?.user?.isVerify ? "Verified" : "Unverified",
    },
    {
      label: "Status",
      value: isBanned ? "Banned" : "Allowed",
    },
    {
      label: "Join Date",
      value: dayjs(data?.user?.createdAt).format("YYYY-MM-DD HH:mm"),
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
        Update User
      </Button>
      <Button
        variant={`${isBanned ? "success" : "warning"}`}
        onClick={() => setIsBanDialogOpen(true)}
        className="flex items-center gap-2"
        size="sm"
      >
        <UserRoundX className="w-4 h-4" />
        {isBanned ? "Unban" : "Ban"} User
      </Button>
      <Button
        variant="danger"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="flex items-center gap-2"
        size="sm"
      >
        <Trash2 className="w-4 h-4" />
        Delete User
      </Button>
    </>
  );

  const handleDelete = (items) => {
    console.log(items);
    deleteUser.mutate(items[0], {
      onSettled: (_, error) => {
        if (!error) {
          navigate("/admin/users");
        }
      },
    });
  };

  const handleBanConfirm = (ids) => {
    banUser.mutate({ userId: ids[0], isBanned: !isBanned });
    setIsBanDialogOpen(false);
  };

  return (
    <>
      <DetailLayout title="User Detail" isLoading={isLoading} actions={actions}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <InfoGrid fields={userFields} />
          </div>

          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <StatCard
              title="Links"
              total={data?.stats?.totalLinks}
              today={data?.stats?.newLinksToday}
            />
            <StatCard
              title="Clicks"
              total={data?.stats?.totalClicks}
              today={data?.stats?.newClicksToday}
            />
          </div>
        </div>
      </DetailLayout>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        items={[data?.user?._id]}
        onConfirm={handleDelete}
      />

      <UpdateUserDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        user={data?.user}
      />
      <ConfirmDialog
        isOpen={isBanDialogOpen}
        onClose={() => setIsBanDialogOpen(false)}
        onConfirm={handleBanConfirm}
        title="Confirm Ban"
        ICON={
          isBanned ? (
            <UserRoundCheck size={60} className="text-gray-800 mb-6" />
          ) : (
            <UserRoundX size={60} className="text-gray-800 mb-6" />
          )
        }
        confirmText={`Are you sure you want to ${
          isBanned ? "unban" : "ban"
        } this user!`}
        items={[data?.user?._id]}
      />
    </>
  );
};

export default UserDetail;
