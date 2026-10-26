import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Attachment } from "@/lib/workflow";

export function OrderDocuments({ attachments }: { attachments: Attachment[] }) {
  return (
    <div className="attachment-section">
      {attachments.map((file, index) => (
        <div className="attachment" key={`${file.name}-${index}`}>
          <span className="file-icon"><FileText size={19} /></span>
          <div>
            <strong title={file.name}>{file.name}</strong>
            <small>
              {file.type === "receipt" ? "Payment receipt" : file.type === "delivery" ? "Delivery proof" : "Supporting document"}
              {!file.data && " · Original file unavailable"}
            </small>
          </div>
          <Button variant="ghost" size="icon" disabled={!file.data}
            aria-label={file.data ? `Download ${file.name}` : `Original file unavailable: ${file.name}`}
            onClick={() => {
              if (!file.data) return;
              const link = document.createElement("a");
              link.href = file.data;
              link.download = file.name;
              link.click();
            }}>
            <Download size={16} />
          </Button>
        </div>
      ))}
      {!attachments.length && <p className="py-4 text-secondary">No documents attached.</p>}
    </div>
  );
}
