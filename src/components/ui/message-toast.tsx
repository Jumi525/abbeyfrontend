import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";
type ErrorProps = {
  error?: string;
  success?: string;
  className?: string;
};
const MessageToast = ({ error, success, className }: ErrorProps) => {
  return (
    <div>
      {success && (
        <div
          className={cn(
            "flex items-center text-sm gap-2 p-3 bg-green-50 text-green-700 space-x-2 text--600 font-medium rounded-lg border border-green-200",
            className
          )}
        >
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div
          className={cn(
            "flex items-center text-sm space-x-2 text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200",
            className
          )}
        >
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default MessageToast;
