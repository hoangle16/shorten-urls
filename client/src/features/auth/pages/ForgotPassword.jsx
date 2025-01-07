import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { userApi } from "../../users/api/userApi";
import { Button, Input, Alert } from "../../../components/Base";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const ForgotPassword = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");
      await userApi.forgotPassword(data.email);
      setMessage("If the email exists, a password reset link has been sent.");
    } catch (err) {
      console.error(err);
      setError("Failed to send password reset email");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      <Helmet>
        <title>Forgot Password | Shorten URLs</title>
      </Helmet>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Reset your password
        </h2>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert
            variant="success"
            className="mb-6"
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            {...register("email")}
            type="email"
            label="Email"
            placeholder="Enter your email"
            error={errors.email?.message}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-blue-500 font-semibold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
