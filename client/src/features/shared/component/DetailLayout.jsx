import { Helmet } from "react-helmet-async";
import React from "react";
import { Button } from "../../../components/Button";
import Loading from "../../../components/Loading";

export const DetailLayout = ({
  title,
  isLoading,
  actions,
  children,
  containerClassName = "max-w-5xl",
}) => {
  return (
    <>
      <Helmet>
        <title>{title} | Shorten URLs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className={`mx-auto ${containerClassName}`}>
          <div className="flex justify-between items-center mb-6 gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
          </div>

          {isLoading ? (
            <div className="min-h-[500px] flex">
              <Loading size="2rem" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
};
