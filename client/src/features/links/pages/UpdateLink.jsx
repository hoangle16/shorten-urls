import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { linkApi } from "../api/linkApi";
import Loading from "../../../components/Loading";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast } from "../../../state/ToastContext";
import {
  Alert,
  Input,
  TextArea,
  Button,
  Select,
} from "../../../components/Base";
import { domainApi } from "../../domains/api/domainApi";
import Datepicker from "../../../components/DatePicker";
import dayjs from "dayjs";
import { Helmet } from "react-helmet-async";

const updateLinkSchema = yup.object().shape({
  customAddress: yup
    .string()
    .nullable()
    .notRequired()
    .when({
      is: (value) => value !== null && value !== "",
      then: (schema) =>
        schema
          .min(4, "Custom address must be at least 4 characters")
          .max(32, "Custom address must be at most 32 characters"),
    }),

  password: yup
    .string()
    .nullable()
    .notRequired()
    .when({
      is: (value) => value !== null && value !== "",
      then: (schema) =>
        schema
          .min(4, "Password must be at least 4 characters")
          .max(16, "Password must be at most 16 characters"),
    }),

  expiryDate: yup.string().nullable().notRequired().trim(),

  description: yup
    .string()
    .nullable()
    .notRequired()
    .trim()
    .max(1024, "Description must be at most 1024 characters"),

  domainId: yup
    .string()
    .nullable()
    .length(24, "DomainId must be 24 characters long")
    .required("DomainId is required."),
});

const UpdateLink = () => {
  const { linkId } = useParams();
  const location = useLocation();

  const [linkInfo, setLinkInfo] = useState(null);
  const [isLinkInfoLoading, setIsLinkInfoLoading] = useState(true);
  const [error, setError] = useState("");
  const [domains, setDomains] = useState([]);
  const [isDomainsLoading, setIsDomainsLoading] = useState(true);

  const { addToast } = useToast();

  useEffect(() => {
    const initializeLinkInfo = async () => {
      if (location.state?.linkInfo) {
        setLinkInfo(location.state.linkInfo);
        setIsLinkInfoLoading(false);
        return;
      }

      try {
        setIsLinkInfoLoading(true);
        const data = await linkApi.getLinkById(linkId);
        setLinkInfo(data.link);
      } catch (error) {
        console.error("Failed to fetch link info:", error);
      } finally {
        setIsLinkInfoLoading(false);
      }
    };

    initializeLinkInfo();
  }, [linkId, location.state]);

  useEffect(() => {
    if (linkInfo) {
      reset(linkInfo);
    }
  }, [linkInfo]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setIsDomainsLoading(true);
        const domainsData = await domainApi.getDomains();
        const data = domainsData.map((domain) => ({
          value: domain._id,
          label: domain.domain,
        }));
        setDomains(data);
      } catch (err) {
        console.error("Failed to fetch domains:", error);
        addToast(
          ("Failed to fetch domains.",
          {
            variant: "error",
            position: "top-right",
            duration: 5000,
          })
        );
      } finally {
        setIsDomainsLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(updateLinkSchema),
    defaultValues: {
      customAddress: linkInfo?.customAddress,
      password: linkInfo?.password,
      expiryDate: linkInfo?.expiryDate,
      description: linkInfo?.description,
      domainId: linkInfo?.domainId,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    try {
      setError("");
      const payload = { linkId, ...data };
      const updateLink = await linkApi.updateLink(payload);
      reset(updateLink);
      addToast("Link updated successfully!", {
        variant: "success",
        position: "top-right",
      });
    } catch (err) {
      console.error("Failed to update link:", err);
      setError(err?.response?.data?.message || "Failed to update link!");
    }
  });

  if (isLinkInfoLoading || isDomainsLoading)
    return (
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
        <Loading size="2rem" />
      </div>
    );

  return (
    <>
      <Helmet>
        <title>Update Link - {linkInfo.shortUrl} | Shorten URLs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-8">Update Link</h1>

          <form
            onSubmit={onSubmit}
            className="bg-white p-6 rounded-xl shadow-lg space-y-4"
          >
            {error && (
              <Alert
                variant="error"
                className="mb-6"
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <Input
              type="text"
              value={linkInfo.originalUrl}
              placeholder="Original Url"
              label="Original Url"
              disabled
            />
            <Input
              type="text"
              value={linkInfo.shortUrl}
              placeholder="Short Url"
              label="Short Url"
              disabled
            />
            <Input
              {...register("customAddress")}
              type="text"
              placeholder="Enter your custom address. e.g `custom-short-url`"
              label="Custom Alias"
              error={errors.customAddress?.message}
            />
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <Input
                  {...register("password")}
                  type="text"
                  placeholder="Enter your password"
                  label="Password"
                />
              </div>
              <div className="flex-1">
                <Datepicker
                  value={linkInfo.expiryDate}
                  onChange={(date) => {
                    setValue(
                      "expiryDate",
                      date ? dayjs(date).endOf("day") : null,
                      {
                        shouldDirty: true,
                      }
                    );
                  }}
                  label="Expiry Date"
                  error={errors.expiryDate?.message}
                />
              </div>
            </div>
            <TextArea
              {...register("description")}
              placeholder="Enter a description (optional)"
              label="Description"
              error={errors.description?.message}
            />
            <Select
              {...register("domainId")}
              options={domains}
              label="Domain"
              placeholder="Select a domain"
              required
              error={errors.domainId?.message}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "Updating" : "Update"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateLink;
