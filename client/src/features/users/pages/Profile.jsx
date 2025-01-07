import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../../auth/state/AuthContext";
import { Input, Button, Alert } from "../../../components/Base";
import { useRef, useState } from "react";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import { useToast } from "../../../state/ToastContext";
import { userApi } from "../api/userApi";
import { Helmet } from "react-helmet-async";
import { Camera } from "lucide-react";
import { useUpdateAvatar } from "../hooks/useUsers";

const userSchema = yup.object().shape({
  firstName: yup.string().max(64, "First name must be at most 64 characters"),
  lastName: yup.string().max(64, "Last name must be at most 64 characters"),
});

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const { user, updateUser } = useAuth();
  const [preview, setPreview] = useState(user?.avatar?.url || null);
  const fileInputRef = useRef(null);
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

  const updateAvatar = useUpdateAvatar(addToast);

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

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Invalid file type. Please select an image file.", {
        variant: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast(
        "File size exceeds the maximum limit of 5MB. Please select a smaller image file.",
        {
          variant: "error",
        }
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);

    updateAvatar.mutate(formData, {
      onSettled: (data, err) => {
        if (err) {
          setPreview(user?.avatar?.url || "/images/default-avatar.jpg");
        }

        if (data.avatar) {
          const updatedUser = {
            ...user,
            avatar: data.avatar,
          };
          updateUser(updatedUser);
        }
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>Profile | Shorten URLs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-14">Profile</h1>
          <form
            onSubmit={onSubmit}
            className="bg-white p-6 rounded-xl shadow-lg space-y-4 relative"
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

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <img
                  src={preview || "/images/default-avatar.jpg"}
                  alt={user.username || "User avatar"}
                  className="w-44 h-44 rounded-full object-cover border-2 border-gray-200 shadow-lg"
                />
                <button
                  type="button"
                  className="absolute right-2 bottom-0 w-11 h-11 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  aria-label="Change avatar"
                  onClick={handleAvatarButtonClick}
                >
                  <Camera size={24} className="text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <Input
              type="text"
              value={user.username}
              placeholder="Username"
              label="Username"
              disabled
              className="!mt-12"
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
