import { CheckCircle2, X } from "lucide-react";

export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} />
      {message}
      <button onClick={() => onDismiss()} aria-label="Dismiss notification">
        <X size={15} />
      </button>
    </div>
  );
}
