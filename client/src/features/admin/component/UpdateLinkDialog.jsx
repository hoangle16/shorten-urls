import Dialog from "../../../components/Dialog";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast } from "../../../state/ToastContext";
import { useUpdateLink } from "../../links/hooks/useLinks";
import { useDomains } from "../../domains/hooks/useDomains";
import { Input, Button, Select, TextArea } from "../../../components/Base";
import { useEffect } from "react";
import DatePicker from "../../../components/DatePicker";
import dayjs from "dayjs";
import Loading from "../../../components/Loading";

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

const UpdateLinkDialog = ({ isOpen, onClose, link }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(updateLinkSchema),
    defaultValues: {
      customAddress: link?.customAddress,
      password: link?.password,
      expiryDate: link?.expiryDate,
      description: link?.description,
      domainId: link?.domainId,
    },
  });

  const { addToast } = useToast();

  const { data: domains, isLoading, error } = useDomains();

  const transformedDomains = domains?.map((domain) => ({
    value: domain._id,
    label: domain.domain,
  }));
  const updateLink = useUpdateLink(addToast);

  useEffect(() => {
    if (link) {
      reset({
        customAddress: link?.customAddress,
        password: link?.password,
        expiryDate: link?.expiryDate,
        description: link.description,
        domainId: link?.domainId,
      });
    }
  }, [link, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = { ...data, linkId: link._id };
    updateLink.mutate(payload);
    handleClose();
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (error) {
    console.error("Fetching domain has failed...", error);
    addToast("Fetching domain has failed", { variant: "error" });
  }
  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Link Info"
      closeOnClickOutside={false}
    >
      {isLoading ? (
        <div>
          <Loading size="2rem" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            text="text"
            value={link?.originalUrl || ""}
            placeholder="Original Url"
            label="Original Url"
            disabled
          />
          <Input
            type="text"
            value={link?.shortUrl || ""}
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
              <DatePicker
                value={link?.expiryDate}
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
            options={transformedDomains || {}}
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
      )}
    </Dialog>
  );
};

export default UpdateLinkDialog;
