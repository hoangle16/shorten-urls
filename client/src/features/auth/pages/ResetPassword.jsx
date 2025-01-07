import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input, Alert } from "../../../components/Base";
import { userApi } from "../../users/api/userApi";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Password must match")
    .required("Confirm new password is required"),
});

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");
      await userApi.resetPassword(
        token,
        data.newPassword,
        data.confirmPassword
      );
      setMessage("Your password has been reset. You can now log in.");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  if (!token) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        <Alert variant="error">Invalid or missing reset token</Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password | Shorten URLs</title>
      </Helmet>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        {message && (
          <Alert variant="success" className="mb-4">
            {message}
          </Alert>
        )}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {!message && (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              {...register("newPassword")}
              type="password"
              label="New Password"
              placeholder="Enter new password"
              error={errors.newPassword?.message}
            />
            <Input
              {...register("confirmPassword")}
              type="password"
              label="Confirm New Password"
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
        {message && (
          <Link
            to="/login"
            className="text-blue-500 space-y-4 flex justify-center hover:underline"
          >
            Login here
          </Link>
        )}
      </div>
    </>
  );
};

export default ResetPassword;
