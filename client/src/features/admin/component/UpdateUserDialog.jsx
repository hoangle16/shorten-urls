import Dialog from "../../../components/Dialog";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast } from "../../../state/ToastContext";
import { useUpdateUser } from "../../users/hooks/useUsers";
import { Input, Button, Select } from "../../../components/Base";
import { useEffect } from "react";

const updateUserSchema = yup.object().shape({
  firstName: yup
    .string()
    .nullable()
    .notRequired()
    .when({
      is: (value) => value !== null && value !== "",
      then: (schema) =>
        schema
          .min(2, "First name must be between 2 and 64 characters")
          .max(64, "First name must be between 2 and 64 characters"),
    }),

  lastName: yup
    .string()
    .nullable()
    .notRequired()
    .when({
      is: (value) => value !== null && value !== "",
      then: (schema) =>
        schema
          .min(2, "Last name must be between 2 and 64 characters")
          .max(64, "Last name must be between 2 and 64 characters"),
    }),
  role: yup
    .mixed()
    .transform((value) => (value === "" ? null : value))
    .oneOf(["admin", "user", null, ""]),
  isVerify: yup
    .boolean()
    .transform((value) => (value === "" ? null : value))
    .oneOf([true, false]),
});
const UpdateUserDialog = ({ isOpen, onClose, user }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(updateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: null,
      isVerify: null,
    },
  });

  const { addToast } = useToast();

  const updateUser = useUpdateUser(addToast);

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role || null,
        isVerify: user.isVerify ?? null,
      });
    }
  }, [user, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = { ...data, userId: user._id };
    updateUser.mutate(payload);
    handleClose();
  });

  const handleClose = () => {
    reset();
    onClose();
  };
  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Update User Info" closeOnClickOutside={false}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input defaultValue={user?.username} label="Username" disabled />
        <Input defaultValue={user?.email} label="Email" disabled />
        <Input
          {...register("firstName")}
          label="First Name"
          placeholder="Enter your new first name"
          error={errors.firstName?.message}
        />
        <Input
          {...register("lastName")}
          label="Last Name"
          placeholder="Enter your new last name"
          error={errors.lastName?.message}
        />
        <Select
          {...register("role")}
          options={[
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ]}
          label="Role"
          required
          error={errors.role?.message}
        />
        <Select
          {...register("isVerify")}
          options={[
            { label: "Verified", value: true },
            { label: "Unverified", value: false },
          ]}
          label="Verification"
          required
          error={errors.isVerify?.message}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            Update user
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default UpdateUserDialog;
