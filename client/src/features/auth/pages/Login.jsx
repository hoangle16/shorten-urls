import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../state/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card, Alert } from "../../../components/Base";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(6, "Username must be at least 6 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      setError("");
      const response = await login(data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        const email = err.response?.data?.extraData?.email || "";
        navigate("/verify-email", { state: { email: email, autoSend: true } });
      } else {
        setError("Failed to login. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      <Helmet>
        <title>Login | Shorten URLs</title>
      </Helmet>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Login to your account
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
            {...register("password")}
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            error={errors.password?.message}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <div>
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline text-sm"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 font-semibold hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
