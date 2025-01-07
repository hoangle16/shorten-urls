import { ShieldAlert } from "lucide-react";
import { Button } from "../../../components/Button";

export const ErrorDisplay = ({ status, message, backMessage, onBack }) => {
  return (
    <div className="container mx-auto max-w-xl mt-20 bg-white p-6 min-h-52 rounded-lg shadow-lg">
      <div className="flex flex-col justify-center items-center gap-2">
        <ShieldAlert className="w-16 h-16 text-red-400" />
        <h2 className="text-2xl font-semibold text-gray-700">{message}</h2>
        <p>{backMessage}</p>
        <Button variant="primary" className="mt-2" onClick={onBack}>
          Go Back
        </Button>
      </div>
    </div>
  );
};