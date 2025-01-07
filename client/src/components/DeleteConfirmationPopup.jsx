import { Trash2 } from "lucide-react";
import { Button } from "./Button";
import Dialog from "./Dialog";

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  confirmText,
  items = [],
}) => {
  const isMultipleDelete = Array.isArray(items) && items.length > 1;

  confirmText =
    confirmText ||
    (isMultipleDelete
      ? `Are you sure you want to delete these ${items.length} items?`
      : "Are you sure you want to delete this item?");
  return (
    <Dialog isOpen={isOpen} onClose={() => onClose()} title={title}>
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <Trash2 size={60} className="text-gray-800" />
          {isMultipleDelete && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {items.length}
            </div>
          )}
        </div>
        <p className="text-gray-800 mb-6">{confirmText}</p>
        <div className="flex justify-center gap-2">
          <Button variant="light" onClick={onClose}>
            No, cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm(items);
              onClose();
            }}
          >
            {isMultipleDelete ? `Yes, delete ${items.length}` : "Yes, I'm sure"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
