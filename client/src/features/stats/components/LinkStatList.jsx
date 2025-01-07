import Popover from "../../../components/Popover";
import { Link } from "react-router-dom";
import { EllipsisIcon, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SearchableSelect from "../../../components/SearchableSelect";
import DateRangePicker from "../../../components/DateRangePicker";
import dayjs from "dayjs";

// browser icons
import braveSvg from "../assets/img/browser/brave.svg";
import defaultBrowserIcon from "../assets/img/browser/browser.svg";
import chromeIcon from "../assets/img/browser/chrome.svg";
import edgeIcon from "../assets/img/browser/edge.svg";
import firefoxIcon from "../assets/img/browser/firefox.svg";
import operaIcon from "../assets/img/browser/opera.svg";
import safariIcon from "../assets/img/browser/safari.svg";

// os icons
import androidIcon from "../assets/img/os/android.svg";
import appleIcon from "../assets/img/os/apple.svg";
import linuxIcon from "../assets/img/os/linux.svg";
import windowsIcon from "../assets/img/os/windows.svg";
import defaultOsIcon from "../assets/img/os/os.svg";

// country icons
import defaultCountryIcon from "../assets/img/country/country.svg";

// referrer icons
import defaultReferrerIcon from "../assets/img/referrer/referrer.svg";
import { useToast } from "../../../state/ToastContext";
import { Select } from "../../../components/Select";
import { Button } from "../../../components/Button";
import Pagination from "../../../components/Pagination";
import { timeFromNow } from "../../../utils/dateUtils";

const BROWSER_ICONS = {
  brave: braveSvg,
  default: defaultBrowserIcon,
  chrome: chromeIcon,
  edge: edgeIcon,
  firefox: firefoxIcon,
  opera: operaIcon,
  safari: safariIcon,
};

const OS_ICONS = {
  android: androidIcon,
  apple: appleIcon,
  linux: linuxIcon,
  windows: windowsIcon,
  default: defaultOsIcon,
};

const getStatsSchema = yup.object().shape({
  os: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired(),
  browser: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired(),
  country: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired(),
  startDate: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired(),
  endDate: yup
    .string()
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

const LinkStatList = ({
  data,
  title = "Stats",
  page = 1,
  limit = 10,
  onFilterChange = () => {},
  showFilter = true,
  showPagination = true,
  showEllipsis = true,
  byUser = true,
}) => {
  const { stats, pagination } = data;

  const getBrowserIcon = (browser) => {
    const browserKey = Object.keys(BROWSER_ICONS).find((key) =>
      (browser || "").toLowerCase().includes(key)
    );
    return browserKey ? BROWSER_ICONS[browserKey] : defaultBrowserSvg;
  };

  const getOSIcon = (os) => {
    const osKey = Object.keys(OS_ICONS).find((key) =>
      (os || "").toLowerCase().includes(key)
    );
    return osKey ? OS_ICONS[osKey] : defaultOsSvg;
  };

  const initialStartDate = dayjs().subtract(6, "day").format("YYYY-MM-DD");
  const initialEndDate = dayjs().format("YYYY-MM-DD");

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(getStatsSchema),
    defaultValues: {
      os: null,
      browser: null,
      country: null,
      startDate: initialStartDate,
      endDate: initialEndDate,
      sortBy: null,
      sortOrder: null,
      page: page,
      limit: limit,
    },
  });

  const isFirstRender = useRef(true);
  const formValues = watch();

  const isFilterDirty = useMemo(() => {
    return (
      formValues.os !== null ||
      formValues.browser !== null ||
      formValues.country !== null ||
      formValues.startDate !== initialStartDate ||
      formValues.endDate !== initialEndDate ||
      formValues.sortBy !== null ||
      formValues.sortOrder !== null
    );
  }, [
    formValues.os,
    formValues.browser,
    formValues.country,
    formValues.startDate,
    formValues.endDate,
    formValues.sortBy,
    formValues.sortOrder,
  ]);

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
    formValues.os,
    formValues.browser,
    formValues.country,
    formValues.startDate,
    formValues.endDate,
    formValues.sortBy,
    formValues.sortOrder,
  ]);

  const handlePageChange = (page) => {
    setValue("page", page);

    handleSubmit((data) => {
      onFilterChange(data);
    })();
  };

  const handleDateChange = ({ startDate, endDate }) => {
    console.log(startDate, endDate);
    setValue("startDate", dayjs(startDate).format("YYYY-MM-DD"));
    setValue("endDate", dayjs(endDate).format("YYYY-MM-DD"));
  };

  const osOptions = [
    { value: null, label: "All" },
    { value: "Windows", label: "Windows" },
    { value: "Linux", label: "Linux" },
    { value: "Android", label: "Android" },
    { value: "Apple", label: "Apple" },
  ];

  const browserOptions = [
    { value: null, label: "All" },
    { value: "Chrome", label: "Chrome" },
    { value: "Edge", label: "Edge" },
    { value: "Firefox", label: "Firefox" },
    { value: "Brave", label: "Brave" },
    { value: "Opera", label: "Opera" },
    { value: "Safari", label: "Safari" },
  ];

  const countryOptions = [
    { value: null, label: "All" },
    { value: "VN", label: "Vietnam" },
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "ES", label: "Spain" },
    { value: "IT", label: "Italy" },
    { value: "CH", label: "Switzerland" },
    { value: "JP", label: "Japan" },
    { value: "SG", label: "Singapore" },
    { value: "KR", label: "Korea" },
    { value: "TW", label: "Taiwan" },
    { value: "CN", label: "China" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "NZ", label: "New Zealand" },
    { value: "IN", label: "India" },
    { value: "MY", label: "Malaysia" },
    { value: "TH", label: "Thailand" },
    { value: "ID", label: "Indonesia" },
    { value: "PH", label: "Philippines" },
  ];

  return (
    <>
      <div className={`flex justify-between`}>
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        {showEllipsis && (
          <Popover
            content={
              <div className="my-2">
                <div>
                  <Link
                    to="/user/stats"
                    className="block py-1 px-4 hover:bg-gray-100"
                  >
                    View All
                  </Link>
                </div>
              </div>
            }
            trigger="click"
            position="bottom"
            align="right"
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
        <form className="flex flex-col justify-center bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between flex-wrap gap-4">
            <div className="w-full md:w-48">
              <SearchableSelect
                {...register("os")}
                value={watch("os")}
                label="Operating System"
                options={osOptions}
                placeholder="All"
              />
            </div>
            <div className="w-full md:w-48">
              <SearchableSelect
                {...register("browser")}
                value={watch("browser")}
                label="Browser"
                options={browserOptions}
                placeholder="All"
              />
            </div>
            <div className="w-full md:w-48">
              <SearchableSelect
                {...register("country")}
                value={watch("country")}
                label="Country"
                options={countryOptions}
                placeholder="All"
              />
            </div>
            <div className="w-full md:w-56">
              <DateRangePicker
                value={{
                  startDate: formValues.startDate,
                  endDate: formValues.endDate,
                }}
                label="Between"
                onChange={handleDateChange}
                placeholder="Choose a date range"
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
                    os: null,
                    browser: null,
                    country: null,
                    startDate: initialStartDate,
                    endDate: initialEndDate,
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
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {stats?.length > 0 ? (
        <div className="space-y-4">
          {stats.map((stat) => (
            <div
              key={stat.statId || stat._id}
              className="flex flex-col bg-white px-6 py-4 rounded-xl shadow-lg space-y-2"
            >
              {byUser && (
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline">
                    <h2 className="a-link-default font-semibold text-xl">
                      <a href={stat.originalUrl} target="_blank">
                        {new URL(stat.originalUrl).hostname}
                      </a>
                    </h2>
                    <a
                      href={stat.shortUrl}
                      target="_blank"
                      className="a-link-default text-sm ml-2"
                    >
                      {stat.shortUrl}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <div className="flex items-center text-sm text-gray-800 gap-1">
                  <img
                    src={defaultCountryIcon}
                    alt={stat.country}
                    className="w-4 h-4"
                  />{" "}
                  {stat.country}
                </div>
                <div className="flex items-center text-sm text-gray-800 gap-1">
                  <img
                    src={getOSIcon(stat.os)}
                    alt={stat.os}
                    className="w-4 h-4"
                  />{" "}
                  {stat.os}
                </div>
                <div className="flex items-center text-sm text-gray-800 gap-1">
                  <img
                    src={getBrowserIcon(stat.browser)}
                    alt={stat.browser}
                    className="w-4 h-4"
                  />{" "}
                  {stat.browser}
                </div>
                <div className="flex items-center text-sm text-gray-800 gap-1">
                  <img
                    src={defaultReferrerIcon}
                    alt={stat.referrer}
                    className="w-4 h-4"
                  />{" "}
                  {stat.referrer !== "Direct" ? (
                    <a
                      href={stat.referrer}
                      target="_blank"
                      className="a-link-default"
                    >
                      {" "}
                      {stat.referrer}
                    </a>
                  ) : (
                    <span>{stat.referrer}</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  {timeFromNow(stat.statCreatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col bg-white p-6 rounded-xl shadow-lg space-y-2">
          <p className="text-center text-gray-700">
            No data available for this period.
          </p>
        </div>
      )}

      {showPagination && (
        <div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default LinkStatList;
