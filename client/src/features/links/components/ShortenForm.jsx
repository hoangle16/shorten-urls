import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Input, Button, Select, TextArea } from "../../../components/Base";
import { linkSchema } from "../schema/linkSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { linkApi } from "../api/linkApi";
import { domainApi } from "../../domains/api/domainApi";
import { useToast } from "../../../state/ToastContext";
import DatePicker from "../../../components/DatePicker";
import dayjs from "dayjs";

const ShortenForm = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [domains, setDomains] = useState([]);
  const [shortUrl, setShortUrl] = useState("");
  const [showForm, setShowForm] = useState(true);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(linkSchema),
    defaultValues: {
      originalUrl: "",
      customAddress: "",
      password: "",
      expiryDate: "",
      description: "",
      domainId: "",
    },
  });

  useEffect(() => {
    getDomains();
  }, []);

  const getDomains = async () => {
    try {
      const domainsData = await domainApi.getDomains();
      const data = domainsData.map((domain) => ({
        value: domain._id,
        label: domain.domain,
      }));
      setDomains(data);

      if (domainsData.length > 0) {
        reset({ domainId: data[0].value });
      }
    } catch (err) {
      console.error("Error fetching domains: ", err);
      addToast("Failed to fetch domains. Please try later!", {
        variant: "error",
        position: "top-right",
        duration: 5000,
      });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await linkApi.createLink(data);
      setShortUrl(response.shortUrl);
      setShowForm(false);
    } catch (err) {
      console.error("Form submission failed: ", err);
      addToast(
        err?.response?.data?.message ||
          "Failed to create link. Please try again.",
        {
          variant: "error",
          position: "top-right",
          duration: 5000,
        }
      );
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setShortUrl("");
    setShowForm(true);
    reset();
    addToast("Shortened URL copied to clipboard!", {
      variant: "success",
      position: "top-right",
      duration: 5000,
    });
  };

  if (!showForm) {
    return (
      <div className="text-center flex flex-wrap justify-center items-center gap-2">
        <Input
          type="text"
          value={shortUrl}
          disabled
          label="Your short URL"
          className="mb-4 w-[80%]"
        />

        <Button variant="primary" onClick={handleCopy} className="mt-2.5">
          <div className="flex justify-center items-center">
            <Copy size={16} className="mr-2" />
            <p>Copy Link</p>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow-lg">
      <div className="space-y-4">
        <div>
          <div className="flex flex-row items-start gap-2">
            <div className="flex-grow">
              <Input
                {...register("originalUrl")}
                type="text"
                label="Original URL"
                placeholder="Enter your URL"
                required
                error={errors.originalUrl?.message}
              />
            </div>
            <div className="pt-7">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Shortening..." : "Shorten"}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Input
                  {...register("customAddress")}
                  type="text"
                  label="Custom Address"
                  placeholder="Enter a custom address"
                  error={errors.customAddress?.message}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    {...register("password")}
                    type="password"
                    label="Password"
                    placeholder="Enter a password"
                    error={errors.password?.message}
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    onChange={(date) => {
                      setValue(
                        "expiryDate",
                        date ? dayjs(date).endOf("day") : null
                      );
                    }}
                    label="Expiry Date"
                    error={errors.expiryDate?.message}
                  />
                </div>
              </div>
              <div>
                <TextArea
                  {...register("description")}
                  label="Description"
                  placeholder="Enter a description (optional)"
                  error={errors.description?.message}
                />
              </div>
              <div>
                <Select
                  {...register("domainId")}
                  options={domains}
                  label="Domain"
                  placeholder="Select a domain"
                  required
                  error={errors.domainId?.message}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default ShortenForm;
