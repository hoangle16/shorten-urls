import { Helmet } from "react-helmet-async";
import Benefits from "../components/Benefits";
import ShortenForm from "../features/links/components/ShortenForm";

const GuestHome = () => {
  return (
    <>
      <Helmet>
        <title>Shorten Urls - A Free, Simple, and Secure URL Shortener</title>
        <meta
          name="description"
          content="Shorten your links with our free URL shortener. Save time and effort by using our simple and secure service."
        />
        <meta
          property="og:title"
          content="Shorten URLs - A Free, Simple, and Secure URL Shortener"
        />
        <meta
          property="og:description"
          content="Shorten your links with our free URL shortener. Save time and effort by using our simple and secure service."
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">
            Shorten your links instantly
          </h1>

          <ShortenForm />
        </div>
        <div className="max-w-4xl mx-auto my-16">
          <Benefits />
        </div>
      </div>
    </>
  );
};

export default GuestHome;
