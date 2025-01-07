import { useEffect, useState } from "react";
import Dialog from "../../../components/Dialog";
import { useToast } from "../../../state/ToastContext";
import {
  useCreateDomain,
  useUpdateDomain,
} from "../../domains/hooks/useDomains";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Alert } from "../../../components/Alert";

const UpdateDomainDialog = ({ isOpen, onClose, domain }) => {
  const [domainId, setDomainId] = useState("");
  const [domainName, setDomainName] = useState("");
  const [validateError, setValidateError] = useState("");
  const [updateDomainError, setUpdateDomainError] = useState("");

  const { addToast } = useToast();
  const { mutate: updateDomain, isLoading } = useUpdateDomain(addToast);

  useEffect(() => {
    if (domain) {
      setDomainName(domain.domain);
      setDomainId(domain._id);
    }
  }, [domain]);

  const validateDomain = (domain) => {
    const regex =
      /^(https?:\/\/)?([\w-]+(\.[\w-]+)*|localhost)(:\d+)?([/?].*)?\/?$/;
    return regex.test(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (domain.domain.trim() === "") {
      setValidateError("Domain name is required.");
      return;
    }

    if (!validateDomain(domain.domain)) {
      setValidateError("Invalid domain. Please enter a valid domain.");
      return;
    }
    setValidateError("");
    updateDomain(
      { domainId, domainName },
      {
        onError: (err) => {
          setUpdateDomainError(
            err.response?.data?.message ||
              "Failed to create domain. Please try again."
          );
        },
        onSettled: (_, err) => {
          if (!err) {
            handleClose();
          }
        },
      }
    );
  };
  const handleClose = () => {
    setDomainName("");
    setValidateError("");
    setUpdateDomainError("");
    onClose();
  };
  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Domain"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {updateDomainError && (
          <Alert variant="error" className="mb-6">
            {updateDomainError}
          </Alert>
        )}
        <Input
          value={domainId}
          placeholder="Enter domain name"
          label="Domain Id"
          disabled
        />
        <Input
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          placeholder="Enter domain name"
          label="Domain"
          required
          error={validateError}
        />
        <div className="flex gap-2 justify-center">
          <Button type="button" variant="danger" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Updating" : "Update Domain"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default UpdateDomainDialog;
