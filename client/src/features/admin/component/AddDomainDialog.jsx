import { useState } from "react";
import Dialog from "../../../components/Dialog";
import { useToast } from "../../../state/ToastContext";
import { useCreateDomain } from "../../domains/hooks/useDomains";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Alert } from "../../../components/Alert";

const AddDomainDialog = ({ isOpen, onClose }) => {
  const [domain, setDomain] = useState("");
  const [validateError, setValidateError] = useState("");
  const [createDomainError, setCreateDomainError] = useState("");

  const { addToast } = useToast();
  const { mutate: createDomain, isLoading } = useCreateDomain(addToast);

  const validateDomain = (domain) => {
    const regex =
      /^(https?:\/\/)?([\w-]+(\.[\w-]+)*|localhost)(:\d+)?([/?].*)?\/?$/;
    return regex.test(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (domain.trim() === "") {
      setValidateError("Domain name is required.");
      return;
    }

    if (!validateDomain(domain)) {
      setValidateError("Invalid domain. Please enter a valid domain.");
      return;
    }
    setValidateError("");
    createDomain(domain, {
      onSettled: (_, err) => {
        if (err) {
          setCreateDomainError(
            err.response?.data?.message ||
              "Failed to create domain. Please try again."
          );
        } else {
          handleClose();
        }
      },
    });
  };
  const handleClose = () => {
    setDomain("");
    setValidateError("");
    setCreateDomainError("");
    onClose();
  };
  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Domain"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {createDomainError && (
          <Alert variant="error" className="mb-6">
            {createDomainError}
          </Alert>
        )}
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain name"
          label="Domain"
          error={validateError}
        />
        <div className="flex gap-2 justify-center">
          <Button type="button" variant="danger" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Creating" : "Create Domain"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddDomainDialog;
