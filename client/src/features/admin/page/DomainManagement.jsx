import { Helmet } from "react-helmet-async";
import { Button } from "../../../components/Button";
import { Table } from "../../../components/Table";
import { useDomains, useDeleteDomain } from "../../domains/hooks/useDomains";
import UpdateDomainDialog from "../component/UpdateDomainDialog";
import Loading from "../../../components/Loading";
import { Alert } from "../../../components/Alert";
import { useState } from "react";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationPopup";
import { useToast } from "../../../state/ToastContext";
import AddDomainDialog from "../component/AddDomainDialog";
import dayjs from "dayjs";

const DomainManagement = () => {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const columns = [
    { key: "_id", title: "ID" },
    {
      key: "domain",
      title: "Domain",
    },
    {
      key: "createdAt",
      title: "Created At",
      // sortable: true,
      render: (value) => {
        return dayjs(value).format("YYYY-MM-DD HH:mm");
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setItemToUpdate(row);
              setIsUpdateDialogOpen(true);
            }}
          >
            Update
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setItemToDelete(row._id);
              setIsDeleteDialogOpen(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
  const { addToast } = useToast();
  const deleteDomain = useDeleteDomain(addToast);

  const { data, isLoading, error } = useDomains();

  const getRowClassName = (row, index) => {
    return `${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`;
  };

  const handleConfirmDelete = (id) => {
    deleteDomain.mutate(id);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  return (
    <>
      <Helmet>
        <title>Domain Management | Shorten URLs</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-full mx-auto overflow-x-hidden">
          <h1 className="text-lg font-semibold text-gray-900 mb-6">
            Domain Management
          </h1>
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

                <div className=" flex justify-end mb-4">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setIsAddDialogOpen(true);
                    }}
                  >
                    Add Domain
                  </Button>
                </div>

                <Table
                  columns={columns}
                  data={data}
                  loading={isLoading}
                  emptyMessage="No Domain found"
                  className="shadow-sm rounded-lg border"
                  headerClassName="bg-gray-200"
                  rowClassName={getRowClassName}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <AddDomainDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
        }}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        items={itemToDelete}
        onConfirm={handleConfirmDelete}
      />
      <UpdateDomainDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => {
          setIsUpdateDialogOpen(false);
          setItemToUpdate(null);
        }}
        domain={itemToUpdate}
      />
    </>
  );
};

export default DomainManagement;
