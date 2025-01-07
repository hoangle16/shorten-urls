import { forwardRef, useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

export const DateRangePicker = forwardRef(
  (
    {
      value,
      onChange,
      label,
      error,
      required = false,
      className = "",
      disabled = false,
      mode = "day", // 'day', 'week', or 'month'
      placeholder = "Select a date range",
      ...props
    },
    ref
  ) => {
    const [range, setRange] = useState(
      value || {
        startDate: null,
        endDate: null,
      }
    );

    useEffect(() => {
      setRange(value || { startDate: null, endDate: null });
    }, [value]);

    const handleChange = (newValue) => {
      let adjustedValue = newValue;
      if (mode === "week") {
        adjustedValue = {
          startDate: dayjs(newValue.startDate).startOf("week").toDate(),
          endDate: dayjs(newValue.endDate).endOf("week").toDate(),
        };
      } else if (mode === "month") {
        adjustedValue = {
          startDate: dayjs(newValue.startDate).startOf("month").toDate(),
          endDate: dayjs(newValue.endDate).endOf("month").toDate(),
        };
      }

      setRange(adjustedValue);
      if (onChange) {
        onChange(adjustedValue);
      }
    };

    const getDisplayFormat = () => {
      switch (mode) {
        case "week":
          return "YYYY-MM";
        case "month":
          return "YYYY-MM";
        default:
          return "YYYY-MM-DD";
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <Datepicker
            value={range}
            onChange={handleChange}
            disabled={disabled}
            readOnly
            displayFormat={getDisplayFormat()}
            separator="to"
            containerClassName="relative w-full"
            toggleClassName="absolute right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            inputClassName={`w-full rounded-lg border ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } ${
              disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
            } px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 ${className}`}
            placeholder={placeholder}
            toggleIcon={() => {}}
            maxDate={dayjs().toDate()}
            useRange={true}
            asSingle={false}
            popoverDirection="down"
            startWeekOn="sun"
            classNames={{
              input: "bg-white",
              inputIcon: "hidden",
              container: "relative",
              calendarContainer: "bg-white mt-2 rounded-lg shadow-lg p-4",
              monthContainer: "flex items-center justify-between",
              monthYearLabel: "font-semibold",
              monthYearSelectContainer: "flex items-center",
              yearSelect: "appearance-none bg-white",
              monthSelect: "appearance-none bg-white",
              weekDayContainer: "grid grid-cols-7 mb-1",
              weekDayLabel: "text-center text-sm text-gray-500",
              datepickerContainer: "grid grid-cols-7",
              dayButton: "p-2 hover:bg-blue-100 rounded-lg",
              selectedDay: "bg-blue-500 text-white hover:bg-blue-600",
              today: "border border-blue-500",
            }}
            showShortcuts={true}
            showFooter={true}
            configs={{
              shortcuts: {
                last7Days: {
                  text: "Last 7 Days",
                  period: {
                    start: dayjs().subtract(6, "day").toDate(),
                    end: dayjs().toDate(),
                  },
                },
                last30Days: {
                  text: "Last 30 Days",
                  period: {
                    start: dayjs().subtract(29, "day").toDate(),
                    end: dayjs().toDate(),
                  },
                },
                thisMonth: {
                  text: "This Month",
                  period: {
                    start: dayjs().startOf("month").toDate(),
                    end: dayjs().toDate(),
                  },
                },
                lastMonth: {
                  text: "Last Month",
                  period: {
                    start: dayjs()
                      .subtract(1, "month")
                      .startOf("month")
                      .toDate(),
                    end: dayjs().toDate(),
                  },
                },
                last3Months: {
                  text: "Last 3 Months",
                  period: {
                    start: dayjs()
                      .subtract(2, "month")
                      .startOf("month")
                      .toDate(),
                    end: dayjs().toDate(),
                  },
                },
              },
            }}
            {...props}
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";

export default DateRangePicker;
