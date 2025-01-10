import { Helmet } from "react-helmet-async";
import {
  Alert,
  Button,
  Input,
  Select,
  TextArea,
} from "../../../components/Base";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useCreateReport } from "../hooks/useReports";
import { useToast } from "../../../state/ToastContext";
// import { useAuth } from "../../auth/state/AuthContext";

const createReportSchema = yup.object().shape({
  shortUrl: yup
    .string()
    .required("Short URL is required")
    .test("is-valid-url", "Short URL must be a valid URL", (value) => {
      try {
        const url = new URL(value);
        return true;
      } catch {
        return false;
      }
    }),
  type: yup
    .string()
    .required("Type is required")
    .oneOf(["abuse", "spam", "offensive", "other"], "Invalid report type"),
  description: yup
    .string()
    .nullable()
    .notRequired()
    .max(500, "Description must be max 500 characters"),
});
const ReportLink = () => {
  // const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(createReportSchema),
    defaultValues: {
      type: "spam",
    },
  });
  const { addToast } = useToast();
  const createReport = useCreateReport(addToast);

  const onSubmit = handleSubmit(async (data) => {
    console.log("Create Report", data);
    await createReport.mutateAsync(data, {
      skipDefaultOnError: true,
      onSettled: (data) => {
        if (data) {
          reset();
        }
      },
    });
  });
  return (
    <>
      <Helmet>
        <title>Report Link | Shorten URLs</title>
      </Helmet>

      <div className="container mx-auto max-w-4xl px-4 py-14">
        <div className="flex flex-col md:flex-row justify-center gap-6 items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Report Link
            </h1>
            <p className="text-gray-700">
              Please report a link that you consider risky or dangerous. We will
              review all cases and take measure to remove the link.
            </p>
          </div>
          <form
            onSubmit={onSubmit}
            className="flex-1 bg-white p-6 rounded-lg shadow-xl space-y-4"
          >
            {/* <Input
              value={user?.email}
              label="Email"
              placeholder="Enter your email"
              required
              readOnly={!user?.email}
            /> */}
            {createReport.error && (
              <Alert
                variant="error"
                className="mb-6"
                onClose={() => createReport.reset()}
              >
                {createReport.error.response?.data?.message ||
                  createReport.error.message}
              </Alert>
            )}
            <Input
              {...register("shortUrl")}
              label="Short Link"
              placeholder="Enter short link to report"
              required
              error={errors.shortUrl?.message}
            />
            <Select
              {...register("type")}
              label="Reason"
              options={[
                { value: "spam", label: "Spam" },
                { value: "abuse", label: "Abuse" },
                { value: "offensive", label: "Offensive" },
                { value: "other", label: "Other" },
              ]}
              required
              error={errors.type?.message}
            />
            <TextArea
              {...register("description")}
              label="Description"
              placeholder="Provide additional details about the reported link."
              error={errors.description?.message}
            />
            <Button type="submit" variant="primary">
              {isSubmitting ? "Sending" : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReportLink;
