import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Card, Input } from "../../../components/Base";
import { linkApi } from "../api/linkApi";
import { useToast } from "../../../state/ToastContext";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(4, "Password must be at least 4 characters")
    .max(16, "Password must be at most 16 characters"),
});

const VerificationProtectedLink = () => {
  const { shortCode } = useParams();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (!shortCode) {
    navigate("*", { replace: true });
    addToast("Link does not exist or has been removed", {
      variant: "warning",
    });
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await linkApi.getProtectedLinkByShortUrl(
        shortCode,
        data.password
      );
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError("Invalid password. Please try again.");
      } else {
        setError("Failed to unlock the link. Please try again.");
      }
    }
  });
  return (
    <>
      <Helmet>
        <title>Unlock Protected Link | Shorten URLs</title>
      </Helmet>
      <div className="container min-h-screen mx-auto px-4 pt-44">
        <div className="max-w-xl mx-auto">
          <Card className="px-4 py-6">
            <h1 className="text-4xl font-bold text-center mb-8">
              Protected Link
            </h1>
            <p className="mb-8 text-gray-900">
              The link has been password protected by the owner. Please enter
              the password you were given to unlock it.
            </p>

            {error && (
              <Alert
                variant="error"
                onClose={() => setError("")}
                className="mb-4"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <div className="flex flex-col gap-4 justify-center">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Unlocking" : "Unlock"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default VerificationProtectedLink;
