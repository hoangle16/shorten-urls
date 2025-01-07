import { Helmet } from "react-helmet-async";

const Unauthorized = () => {
  return (
    <>
      <Helmet>
        <title>Unauthorized | Shorten URLs</title>
      </Helmet>
      <h1>Unauthorized Page</h1>
    </>
  );
};

export default Unauthorized;
