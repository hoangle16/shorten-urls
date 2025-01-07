import { Helmet } from "react-helmet-async";
import { Table } from "./Table";
import { useState } from "react";
import Loading from "./Loading";
import { Alert, Button, Input, Select } from "./Base";
import Pagination from "./Pagination";
import { Search } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import DeleteConfirmationDialog from "./DeleteConfirmationPopup";
import { useToast } from "../state/ToastContext";
import { useNavigate } from "react-router-dom";

const DataManagement = ({
  title,
  columns,
  useDataQuery,
  useDeleteMutation,
  useDeleteManyMutation,
  filterOptions,
  UpdateDialog,
  updateDialogProps = {
    itemPropName: "item", // default prop name
  },
  pageTitle,
  searchPlaceholder = "Enter search text",
  onRowClick,
  additionalFilters = {},
  defaultFilters = {},
  pathPrefix = "",

  dataPath = "items", // Path to data array in response (e.g., "users", "links", "stats")
  paginationPath = "pagination", // Path to pagination data
  detailPath = "", // Path suffix for detail view
  defaultSortField = "createdAt",
  hasSearchInput = true,
}) => {
  const [filters, setFilters] = useState({
    search: "",
    sortBy: defaultSortField,
    sortOrder: "desc",
    page: 1,
    limit: 10,
    ...defaultFilters,
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsToDelete, setItemsToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);

  const navigate = useNavigate();
  const debouncedSearch = useDebounce(filters.search, 500);
  const { addToast } = useToast();

  const { data, isLoading, error } = useDataQuery({
    ...filters,
    ...additionalFilters,
    search: debouncedSearch,
  });

  const items =
    dataPath.split(".").reduce((obj, path) => obj?.[path], data) || [];

  const pagination = paginationPath
    .split(".")
    .reduce((obj, path) => obj?.[path], data);

  const deleteItem = useDeleteMutation(addToast);
  const deleteItems = useDeleteManyMutation(addToast);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(items.map((item) => item._id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectOne = (itemId, checked) => {
    setSelectedItems((prev) => {
      if (checked) {
        return [...prev, itemId];
      }
      return prev.filter((id) => id !== itemId);
    });
  };

  const handleUpdate = (row) => {
    setItemToUpdate(row);
    setIsUpdateDialogOpen(true);
  };

  const handleDelete = (id) => {
    setItemsToDelete([id]);
    setIsDeleteDialogOpen(true);
  };

  const enhanceColumnWithActions = (column) => {
    if (column.key === "actions") {
      return {
        ...column,
        render: (_, row) => {
          if (typeof column.render === "function") {
            return column.render(_, row, {
              onUpdate: handleUpdate,
              onDelete: handleDelete,
              navigate,
            });
          }

          return (
            <div className="flex gap-2">
              {pathPrefix && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `${pathPrefix}/${row._id}${
                        detailPath ? `/${detailPath}` : ""
                      }`
                    );
                  }}
                >
                  Detail
                </Button>
              )}
              {UpdateDialog && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate(row);
                  }}
                >
                  Update
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row._id);
                }}
              >
                Delete
              </Button>
            </div>
          );
        },
      };
    }
    return column;
  };

  // Add default action column if pathPrefix is provided
  const getDefaultActionColumn = () => ({
    key: "actions",
    title: "Actions",
    render: (_, row) => (
      <div className="flex gap-2">
        {pathPrefix && (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `${pathPrefix}/${row._id}${detailPath ? `/${detailPath}` : ""}`
              );
            }}
          >
            Detail
          </Button>
        )}
        {UpdateDialog && (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsUpdateDialogOpen(true);
              setItemToUpdate(row);
            }}
          >
            Update
          </Button>
        )}
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setItemsToDelete([row._id]);
            setIsDeleteDialogOpen(true);
          }}
        >
          Delete
        </Button>
      </div>
    ),
  });

  // Add checkbox column and action column if needed
  const enhancedColumns = [
    {
      key: "select",
      title: (
        <Input
          type="checkbox"
          inputClassName="w-4 h-4 rounded border-gray-300 focus:ring-0"
          checked={items.length > 0 && selectedItems.length === items.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      width: "40px",
      render: (_, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Input
            type="checkbox"
            inputClassName="w-4 h-4 rounded border-gray-300 focus:ring-0"
            checked={selectedItems.includes(row._id)}
            onChange={(e) => handleSelectOne(row._id, e.target.checked)}
          />
        </div>
      ),
    },
    ...columns.map(enhanceColumnWithActions),
    ...(!columns.some((col) => col.key === "actions") &&
    (pathPrefix || UpdateDialog)
      ? [getDefaultActionColumn()]
      : []),
  ];

  const handleSort = ({ field, direction }) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      sortBy: field,
      sortOrder: direction,
    }));
  };

  const getRowClassName = (row, index) => {
    return selectedItems.includes(row._id)
      ? "bg-blue-50"
      : index % 2 === 0
      ? "bg-white"
      : "bg-gray-50";
  };

  const handleDefaultRowClick = (row) => {
    handleSelectOne(row._id, !selectedItems.includes(row._id));
  };

  const handleFilter = (filterKey, value) => {
    const page = filterKey === "page" ? value : 1;
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
      page: page,
    }));
  };

  const handleConfirmDelete = (ids) => {
    if (ids.length === 1) {
      deleteItem.mutate(ids[0]);
    } else {
      deleteItems.mutate(ids);
    }
    setIsDeleteDialogOpen(false);
    setItemsToDelete(null);
    setSelectedItems([]);
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-full mx-auto overflow-x-hidden">
          <h1 className="text-lg font-semibold text-gray-900 mb-6">{title}</h1>

          {isLoading ? (
            <div className="min-h-[calc(100vh-400px)] flex">
              <Loading size="2rem" />
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-4">
                {error && (
                  <Alert variant="error" onClose={() => console.error(error)}>
                    {error.message}
                  </Alert>
                )}

                <div className="flex flex-col flex-wrap lg:flex-row justify-between gap-2 mb-6">
                  <div className="flex gap-2 flex-col flex-wrap lg:flex-row">
                    {hasSearchInput && (
                      <div className="relative min-w-[200px] md:min-w-[300px]">
                        <Search
                          size={20}
                          className="absolute top-1/2 left-4 -translate-y-1/2"
                        />
                        <Input
                          value={filters.search}
                          placeholder={searchPlaceholder}
                          onChange={(e) =>
                            handleFilter("search", e.target.value)
                          }
                          inputClassName="pl-12 text-sm bg-gray-50"
                        />
                      </div>
                    )}

                    {filterOptions?.map((filter) => (
                      <div key={filter.key} className="min-w-[150px]">
                        <Select
                          options={filter.options}
                          placeholder={filter.placeholder}
                          onChange={(event) => {
                            const value =
                              event.target.value === ""
                                ? undefined
                                : filter.parseValue
                                ? filter.parseValue(event.target.value)
                                : event.target.value;
                            handleFilter(filter.key, value);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col lg:flex-row gap-2">
                    {selectedItems.length > 0 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setItemsToDelete(selectedItems);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete Selected ({selectedItems.length})
                      </Button>
                    )}
                  </div>
                </div>

                <Table
                  columns={enhancedColumns}
                  data={items}
                  sortField={filters.sortBy}
                  sortDirection={filters.sortOrder}
                  onSort={handleSort}
                  loading={isLoading}
                  emptyMessage={`No ${title.toLowerCase()} found`}
                  className="shadow-sm rounded-lg border"
                  headerClassName="bg-gray-200"
                  rowClassName={getRowClassName}
                  onRowClick={onRowClick || handleDefaultRowClick}
                />
              </div>

              <div className="px-6">
                <Pagination
                  currentPage={filters.page}
                  totalPages={pagination?.totalPages}
                  onPageChange={(page) => handleFilter("page", page)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setItemsToDelete(null);
        }}
        items={itemsToDelete}
        onConfirm={handleConfirmDelete}
      />

      {UpdateDialog && (
        <UpdateDialog
          isOpen={isUpdateDialogOpen}
          onClose={() => {
            setIsUpdateDialogOpen(false);
            setItemToUpdate(null);
          }}
          {...updateDialogProps}
          {...{ [updateDialogProps.itemPropName]: itemToUpdate }}
        />
      )}
    </>
  );
};

export default DataManagement;
