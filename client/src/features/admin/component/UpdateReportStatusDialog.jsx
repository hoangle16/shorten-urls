import Dialog from "../../../components/Dialog";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast } from "../../../state/ToastContext";
import { useUpdateReportStatus } from "../../report/hooks/useReports";
import {
  Input,
  Select,
  Button,
  TextArea,
  Alert,
} from "../../../components/Base";
import { useEffect } from "react";

const UpdateReportStatusSchema = yup.object().shape({
  status: yup.string().required("Status is required"),
  action: yup
    .string()
    .nullable()
    .notRequired()
    .transform((value) => (value === "" ? undefined : value)),
  isChangeRelated: yup.bool(),
  adminNotes: yup.string().nullable().notRequired(),
});

const UpdateReportStatusDialog = ({ isOpen, onClose, report }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(UpdateReportStatusSchema),
    defaultValues: {
      status: report?.status,
      action: "",
      isChangeRelated: false,
      adminNotes: report?.adminNotes,
    },
  });

  useEffect(() => {
    if (report) {
      reset({
        status: report?.status,
        action: "",
        isChangeRelated: false,
        adminNotes: report?.adminNotes,
      });
    }
  }, [report, reset]);

  const { addToast } = useToast();

  const updateReportStatus = useUpdateReportStatus(addToast);

  const onSubmit = handleSubmit(async (data) => {
    const payload = { ...data, reportId: report._id };
    updateReportStatus.mutate(payload, {
      onSuccess: () => {
        handleClose();
        reset();
      },
    });
  });

  const handleClose = () => {
    reset();
    onClose();
  };
  if (!report) {
    return null;
  }
  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Report Status"
      closeOnClickOutside={false}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {updateReportStatus.error && (
          <Alert variant="error" className="mb-6">
            {updateReportStatus.error.response?.data?.message ||
              updateReportStatus.error.message}
          </Alert>
        )}
        <Input value={report.link.shortUrl} label="Reported Link" disabled />
        <Input
          value={report.link.isDisabled ? "Disabled" : "Enabled"}
          label="Reported Link Status"
          disabled
        />
        <Input
          value={report.type.charAt(0).toUpperCase() + report.type.slice(1)}
          label="Reason"
          disabled
        />
        <Select
          {...register("status")}
          label="Status"
          options={[
            { value: "pending", label: "Pending" },
            { value: "reviewed", label: "Reviewed" },
            { value: "resolved", label: "Resolved" },
            { value: "rejected", label: "Rejected" },
          ]}
          error={errors.status?.message}
          required
        />
        {watch("status") === "resolved" && (
          <Select
            {...register("action")}
            label="Action"
            options={[
              { value: "", label: "Do nothing" },
              { value: "warning", label: "Send warning to user" },
              ...(!report.link.isDisabled
                ? [{ value: "disable", label: "Disable reported link" }]
                : []),
            ]}
            error={errors.action?.message}
            required
          />
        )}
        <TextArea
          {...register("adminNotes")}
          label="Admin Notes"
          placeholder="Provide additional details"
          error={errors.adminNotes?.message}
        />
        {watch("status") !== report.status && (
          <div className="flex items-center mb-4">
            <input
              {...register("isChangeRelated")}
              id="isChangeRelated"
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="isChangeRelated"
              className="ms-2 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
            >{`Set ${watch("status")} all reports related to this link`}</label>
          </div>
        )}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="danger" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Updating" : "Update"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default UpdateReportStatusDialog;
