import Popover from "../../../components/Popover";
import Tooltip from "../../../components/Tooltip";
import {
  EllipsisIcon,
  Search,
  NotebookTextIcon,
  Copy,
  Lock,
  RotateCcw,
  EllipsisVertical,
  ChartNoAxesColumn,
  Edit,
  Trash,
  CalendarX2,
  ListCollapse,
} from "lucide-react";
import { Input, Button, Select } from "../../../components/Base";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Pagination from "../../../components/Pagination";
import { useEffect, useMemo, useRef } from "react";
import { useToast } from "../../../state/ToastContext";
import { checkIsExpired, timeFromNow } from "../../../utils/dateUtils";
import { linkApi } from "../api/linkApi";

const getLinkSchema = yup.object().shape({
  search: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired(),
  isExpired: yup
    .boolean("isExpired can only be true or false")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired(),
  hasPassword: yup
    .boolean("hasPassword can only be true or false")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired(),
  sortBy: yup
    .mixed()
    .transform((value) => (value === "" ? null : value))
    .oneOf(["createdAt", "expiryDate", null, ""])
    .nullable()
    .notRequired(),
  sortOrder: yup
    .mixed()
    .transform((value) => (value === "" ? null : value))
    .oneOf(["asc", "desc", null, ""])
    .nullable()
    .notRequired(),
  page: yup.number().nullable().notRequired(),
  limit: yup.number().nullable().notRequired(),
});

const LinkList = ({
  data,
  title = "Links",
  page = 1,
  limit = 10,
  onFilterChange = () => {},
  showFilter = true,
  showPagination = true,
  showEllipsis = true,
}) => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(getLinkSchema),
    defaultValues: {
      search: null,
      isExpired: null,
      hasPassword: null,
      sortBy: null,
      sortOrder: null,
      page: page,
      limit: limit,
    },
  });

  const isFirstRender = useRef(true);
  const { addToast } = useToast();
  const formValues = watch();

  const isFilterDirty = useMemo(() => {
    return (
      (formValues.search !== "" && formValues.search !== null) ||
      formValues.isExpired !== null ||
      formValues.hasPassword !== null ||
      formValues.sortBy !== null ||
      formValues.sortOrder !== null
    );
  }, [formValues]);

  useEffect(() => {
    if (!isFirstRender.current) {
      handleSubmit((data) => {
        const payload = { ...data, page: 1 };
        onFilterChange(payload);
      })();
    } else {
      isFirstRender.current = false;
    }
  }, [
    formValues.isExpired,
    formValues.hasPassword,
    formValues.sortBy,
    formValues.sortOrder,
  ]);

  const onSubmit = handleSubmit(async (data) => {
    onFilterChange(data);
  });

  const handlePageChange = (page) => {
    setValue("page", page);

    handleSubmit((data) => {
      onFilterChange(data);
    })();
  };

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    reset();
    addToast("Shortened URL copied to clipboard!", {
      variant: "success",
      position: "top-right",
      duration: 5000,
    });
  };

  const handleDeleteLink = async (linkId) => {
    try {
      await linkApi.deleteLink(linkId);
      handleSubmit((data) => {
        onFilterChange(data);
      })();
      addToast("Link deleted successfully!", {
        variant: "success",
        position: "top-right",
        duration: 5000,
      });
    } catch (err) {
      console.error("Delete link failed :", err);
      addToast("Failed to delete link. Please try again.", {
        variant: "error",
        position: "top-right",
        duration: 5000,
      });
    }
  };

  return (
    <>
      {/* Recent Links Header */}
      <div className={`flex justify-between`}>
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        {showEllipsis && (
          <Popover
            content={
              <div className="my-2">
                <div>
                  <Link
                    to="/user/links"
                    className="block py-1 px-4 hover:bg-gray-100"
                  >
                    View All
                  </Link>
                </div>
              </div>
            }
            trigger="click"
            position="bottom"
            align="left"
            offset={1}
          >
            <EllipsisIcon
              size={20}
              className="cursor-pointer text-gray-700 mr-1"
            />
          </Popover>
        )}
      </div>

      {showFilter && (
        <form
          onSubmit={onSubmit}
          className="flex flex-col justify-center bg-white rounded-xl shadow-lg p-6 space-y-4"
        >
          <div className="flex gap-4">
            <Input
              {...register("search")}
              type="text"
              placeholder="Search for links"
              className="flex-1"
              error={errors.search?.message}
            />
            <Button type="submit" disabled={isSubmitting} variant="light">
              <Search size={20} />
            </Button>
          </div>

          <div className="flex flex-col md:flex-row flex-wrap justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-grow">
              <div className="w-full md:w-48">
                <Select
                  {...register("isExpired")}
                  options={[
                    {
                      label: "Expired",
                      value: true,
                    },
                    { label: "Not expired", value: false },
                  ]}
                  label="Expiration"
                  placeholder="Select a option"
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  {...register("hasPassword")}
                  options={[
                    {
                      label: "Password set",
                      value: true,
                    },
                    { label: "Password not set", value: false },
                  ]}
                  label="Password"
                  placeholder="Select a option"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select
                options={[
                  {
                    label: "Newest",
                    value: JSON.stringify({
                      sortBy: "createdAt",
                      sortOrder: "desc",
                    }),
                  },
                  {
                    label: "Oldest",
                    value: JSON.stringify({
                      sortBy: "createdAt",
                      sortOrder: "asc",
                    }),
                  },
                  {
                    label: "Expiration (latest first)",
                    value: JSON.stringify({
                      sortBy: "expiryDate",
                      sortOrder: "desc",
                    }),
                  },
                  {
                    label: "Expiration (soonest first)",
                    value: JSON.stringify({
                      sortBy: "expiryDate",
                      sortOrder: "asc",
                    }),
                  },
                ]}
                label="Sort by"
                placeholder="Select a option"
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue) {
                    const { sortBy, sortOrder } = JSON.parse(selectedValue);
                    setValue("sortBy", sortBy);
                    setValue("sortOrder", sortOrder);
                  } else {
                    setValue("sortBy", null);
                    setValue("sortOrder", null);
                  }
                }}
              />
            </div>
          </div>
          {isFilterDirty && (
            <div>
              <Button
                type="button"
                variant="custom"
                onClick={() => {
                  reset({
                    search: "",
                    isExpired: null,
                    hasPassword: null,
                    sortBy: null,
                    sortOrder: null,
                    page: page,
                    limit: limit,
                  });
                }}
                size="sm"
                className="flex items-start justify-start gap-2 text-red-500 border border-red-400 hover:text-red-600 hover:ring-red-100 hover:ring-2 transition-colors duration-300"
              >
                <RotateCcw size={20} />
                Reset All
              </Button>
            </div>
          )}
        </form>
      )}

      {showPagination && (
        <div>
          <Pagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Links Component */}
      {data.links.map((link) => (
        <div
          key={link._id}
          className="bg-white rounded-xl px-6 py-4 shadow-lg space-y-2 relative"
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {checkIsExpired(link.expiryDate) && (
              <div className="absolute top-0 right-0 bg-red-500 text-white px-8 py-0.5 transform rotate-45 translate-x-8 translate-y-2">
                <span className="text-xs font-semibold">EXPIRED</span>
              </div>
            )}
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="a-link-default font-semibold text-xl">
                <a href={link.originalUrl} target="_blank">
                  {new URL(link.originalUrl).hostname}
                </a>
              </h2>
              <Popover
                content={
                  <div className="my-2">
                    <div className="border-b mb-2 text-gray-800">
                      <Link
                        to={`/user/links/${link._id}`}
                        className="flex gap-2 items-center py-1 px-4 hover:bg-gray-100"
                      >
                        <ListCollapse size={20} /> Detail
                      </Link>
                      <Link
                        to={`/user/links/${link._id}/stat`}
                        state={{ linkInfo: link }}
                        className="flex gap-2 items-center py-1 px-4 hover:bg-gray-100"
                      >
                        <ChartNoAxesColumn size={20} /> Statistics
                      </Link>
                      <Link
                        to={`/user/links/${link._id}/edit`}
                        state={{ linkInfo: link }}
                        className="flex gap-2 items-center py-1 px-4 hover:bg-gray-100"
                      >
                        <Edit size={20} /> Edit
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDeleteLink(link._id)}
                        className="w-full flex gap-2 items-center py-1 px-4  text-red-600 hover:bg-red-200"
                      >
                        <Trash size={20} /> Delete
                      </button>
                    </div>
                  </div>
                }
                trigger="click"
                position="bottom"
                align="right"
                offset={1}
              >
                <EllipsisVertical
                  size={20}
                  className="cursor-pointer text-gray-700"
                />
              </Popover>
            </div>
            {(link.password || link.description) && (
              <div className="flex gap-6">
                {link.password && (
                  <div className="flex items-center">
                    <Lock size={14} className="mr-2" />{" "}
                    <span className="text-gray-700 text-sm">Protected</span>
                  </div>
                )}
                {link.description && (
                  <Tooltip content={link.description} position="top">
                    <div className="flex items-center">
                      <NotebookTextIcon size={14} className="mr-2" />{" "}
                      <span className="text-gray-700 text-sm">Description</span>
                    </div>
                  </Tooltip>
                )}
              </div>
            )}
            <div className="flex items-center">
              <a
                href={link.shortUrl}
                target="_blank"
                className="a-link-default text-sm mr-4"
              >
                {link.shortUrl}
              </a>{" "}
              <div
                className="group flex items-center cursor-pointer transition-colors duration-300 hover:text-blue-600"
                onClick={() => handleCopy(link.shortUrl)}
              >
                <Copy
                  size={14}
                  className="mr-2 group-hover:text-blue-600 transition-colors duration-300"
                />
                <p className="text-gray-700 text-sm group-hover:text-blue-600 transition-colors duration-300">
                  Copy
                </p>
              </div>
            </div>
            <div className="text-sm">
              <p className="text-gray-700">
                {timeFromNow(link.createdAt)} -{" "}
                <Link
                  to={`/user/links/${link._id}/stat`}
                  state={{ linkInfo: link }}
                  className="a-link-default font-semibold"
                >
                  {link.clicks} Click
                </Link>
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {showPagination && (
        <div>
          <Pagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default LinkList;
