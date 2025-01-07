import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 *
 * @param {string | Date} date
 * @returns {string} - e.g "5 days ago"
 */
export const timeFromNow = (date) => {
  return dayjs(date).fromNow();
};

/**
 *
 * @param {string | Date} date
 * @returns {boolean}
 */
export const checkIsExpired = (date) => {
  if (!date) return false;

  const parsedDate = dayjs(date);

  if (!parsedDate.isValid()) {
    throw new Error("Invalid date format");
  }

  return dayjs().isAfter(parsedDate);
};
