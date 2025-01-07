import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { userApi } from "../../users/api/userApi";
import { Alert } from "../../../components/Alert";
import { Helmet } from "react-helmet-async";

const VerifyEmail = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const initialRenderRef = useRef(true);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const autoSend = location.state?.autoSend || false;

  useEffect(() => {
    if (!email) {
      console.warn("No email provided, redirecting to /register");
      navigate("/register");
      return;
    }

    if (initialRenderRef.current && autoSend && !emailSent) {
      console.log("handleResendEmail call in useEffect");
      handleResendEmail();
      setEmailSent(true);
      initialRenderRef.current = false;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isSending) return;

    try {
      setIsSending(true);
      await userApi.resendVerifyEmail(email);
      setSuccess("Verification email sent successfully");
      setResendCooldown(60); // 1 minute cooldown
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to resend verification email"
      );
      setSuccess("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify Email | Shorten URLs</title>
      </Helmet>
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Verify Email page
        </h2>
        <p className="mb-6">
          We have sent a verification link to <strong>{email}</strong>
        </p>
        <p className="mb-6">
          Click on the link to complete the verification process. You might need
          to <strong>check your spam folder.</strong>
        </p>
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            variant="success"
            className="mb-6"
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}
        <div className="flex flex-row justify-around">
          <Button
            variant="primary"
            size="md"
            onClick={handleResendEmail}
            disabled={isSending || resendCooldown > 0}
          >
            {isSending
              ? "Sending..."
              : resendCooldown > 0
              ? `Wait ${resendCooldown}s`
              : "Resend Email"}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
