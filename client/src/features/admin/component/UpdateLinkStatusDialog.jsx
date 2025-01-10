import Dialog from "../../../components/Dialog";
import { useToast } from "../../../state/ToastContext";
import { useUpdateLinkStatus } from "../../links/hooks/useLinks";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { TextArea } from "../../../components/TextArea";
import { Button } from "../../../components/Button";
import { useEffect } from "react";
import { Alert } from "../../../components/Alert";

const updateLinkStatusSchema = yup.object().shape({
  isDisabled: yup.bool(),
  message: yup
    .string()
    .nullable()
    .notRequired()
    .max(500, "Message must be at least 500 characters"),
});

const UpdateLinkStatusDialog = ({ isOpen, onClose, link }) => {
  const { addToast } = useToast();
  const updateLinkStatus = useUpdateLinkStatus(addToast);

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(updateLinkStatusSchema),
    defaultValues: {
      isDisabled: link?.isDisabled ? "true" : "false",
      message: "",
    },
  });

  useEffect(() => {
    reset({
      isDisabled: link?.isDisabled ? "true" : "false",
      message: link?.message,
    });
  }, [link, reset]);
  if (!link) {
    return null;
  }

  const onSubmit = handleSubmit(async (data) => {
    const payload = { ...data, linkId: link._id };
    updateLinkStatus.mutate(payload, {
      onSuccess: () => {
        handleClose();
      },
    });
  });

  const handleClose = () => {
    onClose();
    reset();
  };
  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      closeOnClickOutside={false}
      title="Update Link Status"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {updateLinkStatus.error && (
          <Alert variant="error" className="mb-6">
            {updateLinkStatus.error.response?.data?.message ||
              updateLinkStatus.error.message}
          </Alert>
        )}
        <Input value={link?.shortUrl} label="Short Url" readOnly />
        <Select
          {...register("isDisabled")}
          label="Status"
          options={[
            { label: "Enabled", value: "false" },
            { label: "Disabled", value: "true" },
          ]}
          error={errors.isDisabled?.message}
          required
        />
        {watch("isDisabled") === "true" && link?.isDisabled !== true && (
          <TextArea
            {...register("message")}
            label="Message"
            placeholder="Notification content for user"
            error={errors.message?.message}
          />
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="danger" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isSubmitting ? "Updating" : "Update Status"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default UpdateLinkStatusDialog;
