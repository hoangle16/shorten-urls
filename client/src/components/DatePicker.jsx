import { forwardRef, useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import dayjs from "dayjs";

const DatePicker = forwardRef(
  (
    {
      value,
      onChange,
      label,
      error,
      required = false,
      className = "",
      disabled = false,
      placeholder = "Select a date",
      ...props
    },
    ref
  ) => {
    const [date, setDate] = useState(() => {
      if (!value) return { startDate: null, endDate: null };
      return {
        startDate: dayjs(value).toDate(),
        endDate: dayjs(value).toDate(),
      };
    });

    useEffect(() => {
      if (!value) {
        setDate({ startDate: null, endDate: null });
        return;
      }
      setDate({
        startDate: dayjs(value).toDate(),
        endDate: dayjs(value).toDate(),
      });
    }, [value]);

    const handleChange = (newValue) => {
      setDate(newValue);
      if (onChange) {
        onChange(
          newValue.startDate ? dayjs(newValue.startDate).toISOString() : null
        );
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
            value={date}
            onChange={handleChange}
            disabled={disabled}
            containerClassName="relative w-full"
            toggleClassName="absolute right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            inputClassName={`w-full rounded-lg border ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            } ${
              disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
            } px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 ${className}`}
            placeholder={placeholder}
            minDate={dayjs().add(1, "day").toDate()}
            useRange={false}
            asSingle={true}
            popoverDirection="down"
            startWeekOn="monday"
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
                tomorrow: {
                  text: "Tomorrow",
                  period: {
                    start: dayjs().add(1, "day").toDate(),
                    end: dayjs().add(1, "day").toDate(),
                  },
                },
                next3days: {
                  text: "Next 3 days",
                  period: {
                    start: dayjs().add(3, "day").toDate(),
                    end: dayjs().add(3, "day").toDate(),
                  },
                },
                next7days: {
                  text: "Next 7 days",
                  period: {
                    start: dayjs().add(7, "day").toDate(),
                    end: dayjs().add(7, "day").toDate(),
                  },
                },
                nextMonth: {
                  text: "Next month",
                  period: {
                    start: dayjs().add(1, "month").toDate(),
                    end: dayjs().add(1, "month").toDate(),
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

DatePicker.displayName = "DatePicker";

export default DatePicker;
