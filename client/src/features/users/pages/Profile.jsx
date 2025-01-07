import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../../auth/state/AuthContext";
import { Input, Button, Alert } from "../../../components/Base";
import { useState } from "react";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import { useToast } from "../../../state/ToastContext";
import { userApi } from "../api/userApi";
import { Helmet } from "react-helmet-async";

const userSchema = yup.object().shape({
  firstName: yup.string().max(64, "First name must be at most 64 characters"),
  lastName: yup.string().max(64, "Last name must be at most 64 characters"),
});

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
    },
  });

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError("");
      const payload = { userId: user._id, ...data };
      await userApi.updateUser(payload);
      const updatedUser = {
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      updateUser(updatedUser);
      reset(payload);
      addToast("Profile updated successfully!", {
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update profile");
    }
  });

  return (
    <>
      <Helmet>
        <title>Profile | Shorten URLs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-center mb-8">Profile</h1>
          <form
            onSubmit={onSubmit}
            className="bg-white p-6 rounded-xl shadow-lg space-y-4"
          >
            {error && (
              <Alert
                variant="error"
                className="mb-6"
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <Input
              type="text"
              value={user.username}
              placeholder="Username"
              label="Username"
              disabled
            />
            <div className="flex items-end gap-2">
              <Input
                type="password"
                placeholder="********"
                label="Password"
                disabled
                className="flex-1"
              />
              <div>
                <Button variant="primary" onClick={handleOpen}>
                  Change Password
                </Button>
              </div>
            </div>
            <Input
              type="text"
              value={user.email}
              placeholder="Email"
              label="Email"
              disabled
            />
            <Input
              {...register("firstName")}
              type="text"
              placeholder="First Name"
              label="First Name"
              error={errors.firstName?.message}
            />
            <Input
              {...register("lastName")}
              type="text"
              placeholder="Last name"
              label="Last name"
              error={errors.lastName?.message}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
          </form>

          <ChangePasswordDialog isOpen={isOpen} onClose={handleClose} />
        </div>
      </div>
    </>
  );
};

export default Profile;
