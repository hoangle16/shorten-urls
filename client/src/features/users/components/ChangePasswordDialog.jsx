import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast } from "../../../state/ToastContext";
import { userApi } from "../api/userApi";
import Dialog from "../../../components/Dialog";
import { Alert, Button, Input } from "../../../components/Base";
import { useState } from "react";

const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required("Current password is required")
    .min(8, "Current password must be at least 8 characters")
    .max(32, "Current password must be at most 32 characters"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "New password must be at least 8 characters")
    .max(32, "New password must be at most 32 characters"),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("newPassword"), null],
      "Confirm Password does not match New Password"
    ),
});

const ChangePasswordDialog = ({ isOpen, onClose }) => {
  const [error, setError] = useState("");

  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError("");

      await userApi.changePassword(data);
      addToast("Password updated successfully!", { variant: "success" });
      handleClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update password!");
    }
  });

  const handleClose = () => {
    reset();
    setError("");
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        <Input
          {...register("currentPassword")}
          type="password"
          label="Current Password"
          placeholder="Enter your current password"
          required
          error={errors.currentPassword?.message}
        />
        <Input
          {...register("newPassword")}
          type="password"
          label="New Password"
          placeholder="Enter new password"
          required
          error={errors.newPassword?.message}
        />
        <Input
          {...register("confirmPassword")}
          type="password"
          label="Confirm Password"
          placeholder="Enter confirmation password"
          required
          error={errors.confirmPassword?.message}
        />

        <div className="flex gap-2 items-center justify-end">
          <Button
            variant="danger"
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            size="sm"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ChangePasswordDialog;
