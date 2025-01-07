import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Represents a configuration for a table column.
 *
 * @typedef {Object} Column
 * @property {string} key - The key corresponding to the data object.
 * @property {React.ReactNode} title - A custom render for the header.
 * @property {boolean} [sortable] - Indicates whether the column is sortable.
 * @property {string} [width] - The width of the column (e.g., "100px", "10%").
 * @property {string} [className] - Custom class name for the column.
 * @property {function(any, any): React.ReactNode} [render] - A custom render function for the column.
 * - The function receives two arguments:
 *   - `value` (any): The value of the field for the current row.
 *   - `record` (any): The full data object for the current row.
 */

/**
 * Table component for displaying tabular data with customizable columns.
 *
 * @param {Object} props - The properties passed to the Table component.
 * @param {Array<Column>} [props.columns] - Configuration for the table columns.
 * @param {Array<Object>} props.data - The data to display in the table rows.
 * @param {string} [props.className=""] - Additional class names for the table.
 * @param {boolean} [props.loading=false] - Whether the table is in a loading state.
 * @param {string} [props.emptyMessage="No data available"] - Message to display when there is no data.
 * @param {function} [props.onRowClick] - Callback function when a row is clicked.
 * @param {function(row, index): string} [props.rowClassName] - Custom row className function
 * @param {string} [props.headerClassName=""] - Class name for the table header.
 * @param {string|null} [props.sortField=null] - The current field being sorted.
 * @param {string|null} [props.sortDirection=null] - The current sort direction ('asc' or 'desc').
 * @param {function} [props.onSort] - Callback function for when a column is sorted.
 */
export const Table = ({
  columns,
  data = [],
  className = "",
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  rowClassName,
  headerClassName = "",
  sortField = null,
  sortDirection = null,
  onSort,
  ...props
}) => {
  const generateColumns = (data) => {
    if (!data.length) return [];

    return Object.keys(data[0]).map((key) => ({
      key,
      title:
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      sortable: true,
    }));
  };

  const tableColumns = columns || generateColumns(data);

  const handleSort = (column) => {
    if (!column.sortable) return;

    let direction = "asc";
    if (sortField === column.key && sortDirection === "asc") {
      direction = "desc";
    }

    onSort?.({ field: column.key, direction });
  };

  const getSortIcon = (column) => {
    if (!column.sortable) return null;

    if (sortField !== column.key) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-500" />
    );
  };

  const renderCell = (row, column) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    if (value == null) return "-";

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return value;
  };

  const shouldTruncate = (column) => {
    return (
      !column.key.includes("select") && typeof column.render !== "function"
    );
  };

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className={`w-full border-collapse`} {...props}>
        <thead>
          <tr className={`bg-gray-50 ${headerClassName}`}>
            {tableColumns.map((column, index) => (
              <th
                key={index}
                className={`
                  px-6 py-3 text-left text-sm font-medium text-gray-700 border-b
                  ${column.sortable ? "cursor-pointer select-none" : ""}
                  ${column.className || ""}
                `}
                onClick={() => handleSort(column)}
                style={{
                  width: column.width || "auto",
                  ...(shouldTruncate(column) && {
                    maxWidth: column.width || "none",
                    minWidth: column.width || "auto",
                  }),
                }}
              >
                <div className="flex items-center gap-2">
                  {column.title}
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td
                colSpan={tableColumns.length}
                className="px-6 py-3 text-center text-gray-500"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={tableColumns.length}
                className="px-6 py-3 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={(e) => onRowClick?.(row, rowIndex)}
                className={`
                  ${rowClassName?.(row, rowIndex) || ""}
                  ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                `}
              >
                {tableColumns.map((column, cellIndex) => {
                  const needsTruncate = shouldTruncate(column);
                  return (
                    <td
                      key={cellIndex}
                      className={`px-6 py-3 text-sm text-gray-700 
                        ${needsTruncate ? "overflow-hidden" : ""}
                        ${column.className || ""}`}
                      style={{
                        width: column.width || "auto",
                        ...(needsTruncate && {
                          maxWidth: column.width || "none",
                          minWidth: column.width || "auto",
                        }),
                      }}
                    >
                      {needsTruncate ? (
                        <div
                          className="truncate"
                          title={renderCell(row, column)}
                        >
                          {renderCell(row, column)}
                        </div>
                      ) : (
                        renderCell(row, column)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
