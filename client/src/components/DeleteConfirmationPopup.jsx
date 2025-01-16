import { Trash2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

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
  const btnConfirmText = isMultipleDelete
    ? `Yes, delete ${items.length}`
    : "Yes, I'm sure";
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={() => onClose()}
      onConfirm={onConfirm}
      title={title}
      ICON={
        <div className="relative mb-6">
          <Trash2 size={60} className="text-gray-800" />
          {isMultipleDelete && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {items.length}
            </div>
          )}
        </div>
      }
      confirmText={confirmText}
      btnConfirmText={btnConfirmText}
      items={items}
    />
  );
};

export default DeleteConfirmationDialog;
