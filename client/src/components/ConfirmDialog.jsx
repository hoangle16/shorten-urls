import { AlertOctagon } from "lucide-react";
import { Button } from "./Button";
import Dialog from "./Dialog";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  ICON = <AlertOctagon size={60} className="text-gray-800" />,
  confirmText,
  btnConfirmText = "Yes, I'm sure",
  btnCancelText = "No, cancel",
  closeOnClickOutSide = true,
  items = [],
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => onClose()}
      title={title}
      closeOnClickOutside={closeOnClickOutSide}
    >
      <div className="flex flex-col items-center">
        {ICON}
        <p className="text-gray-800 mb-6">{confirmText}</p>
        <div className="flex justify-center gap-2">
          <Button variant="light" onClick={onClose}>
            {btnCancelText}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm(items);
              onClose();
            }}
          >
            {btnConfirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
