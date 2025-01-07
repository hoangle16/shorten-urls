import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { authApi } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Alert } from "../../../components/Base";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(6, "Username must be at least 6 characters")
    .max(32, "Username must be at most 32 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Password must match"),
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
});

const Register = () => {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      setError("");
      const response = await authApi.register(data);
      console.log(response);
      if (data.email) {
        navigate("/verify-email", {
          state: { email: data.email, autoSend: false },
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to register. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  });
  return (
    <>
      <Helmet>
        <title>Register | Shorten URLs</title>
      </Helmet>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Create a new account
        </h2>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            {...register("username")}
            type="text"
            label="Username"
            placeholder="Enter your username"
            required
            error={errors.username?.message}
          />

          <Input
            {...register("email")}
            type="text"
            label="Email"
            placeholder="Enter your email address"
            required
            error={errors.email?.message}
          />

          <Input
            {...register("password")}
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            error={errors.password?.message}
          />

          <Input
            {...register("confirmPassword")}
            type="password"
            label="Confirm Password"
            placeholder="Enter your password"
            required
            error={errors.confirmPassword?.message}
          />

          <Input
            {...register("firstName")}
            type="text"
            label="First Name"
            placeholder="Enter your first name"
            error={errors.firstName?.message}
          />

          <Input
            {...register("lastName")}
            type="text"
            label="Last Name"
            placeholder="Enter your last name"
            error={errors.lastName?.message}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}{" "}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
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

export default Register;
