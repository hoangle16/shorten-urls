import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Helmet } from "react-helmet-async";

const EmailVerified = () => {
  const navigate = useNavigate();

  const handleRedirectToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Email Verified | Shorten URLs</title>
      </Helmet>
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Email Verified Successfully!
        </h2>
        <p className="text-gray-700 mb-6">
          Thank you for verifying your email. You can now log in to your
          account.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={handleRedirectToLogin}
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    </>
  );
};

export default EmailVerified;
