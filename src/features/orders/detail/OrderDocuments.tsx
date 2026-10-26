import { useRef, useState } from "react";
import { Download, FileText, LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order, Attachment } from "@/lib/workflow";

export function OrderDocuments({
  order,
  active,
  logChange,
  notify,
  onError,
  uploadType,
  onUploadTypeChange,
}: {
  order: Order;
  active: boolean;
  logChange: (patch: Partial<Order>, text: string) => void;
  notify: (message: string) => void;
  onError: (message: string) => void;
  uploadType: Attachment["type"];
  onUploadTypeChange: (type: Attachment["type"]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  async function upload(file: File | undefined) {
    if (!file) return;
    onError("");
    if (file.size > 2 * 1024 * 1024) {
      onError("Please choose a file smaller than 2 MB.");
      return;
    }
    if (
      !["application/pdf", "image/png", "image/jpeg", "text/plain"].includes(
        file.type,
      )
    ) {
      onError("Use a PDF, PNG, JPG, or text file.");
      return;
    }
    setUploading(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("File could not be read."));
        r.readAsDataURL(file);
      });
      logChange(
        {
          attachments: [
            ...order.attachments,
            { name: file.name, type: uploadType, data },
          ],
        },
        `${file.name} attached by Alex Morgan`,
      );
      notify("Attachment added");
    } catch {
      onError("Unable to read that file. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  function download(a: Attachment) {
    if (!a.data) return;
    const link = document.createElement("a");
    link.href = a.data;
    link.download = a.name;
    link.click();
  }

  return (
    <section className="detail-section attachment-section" hidden={!active}>
      <h3>
        Documents {order.attachments.length > 0 && <span>{order.attachments.length} {order.attachments.length === 1 ? "file" : "files"}</span>}
      </h3>

      {order.attachments.map((a, i) => (
        <div className="attachment" key={`${a.name}-${i}`}>
          <span className="file-icon">
            <FileText size={19} />
          </span>
          <div>
            <strong>{a.name}</strong>
            <small>
              {a.type === "receipt"
                ? "Payment evidence"
                : a.type === "delivery"
                  ? "Proof of delivery"
                  : "Supporting document"}
              {!a.data && " · Original file unavailable"}
            </small>
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={!a.data}
            aria-label={a.data ? `Download ${a.name}` : `Original file unavailable: ${a.name}`}
            onClick={() => download(a)}
          >
            <Download size={16} />
          </Button>
        </div>
      ))}
      {!order.attachments.length && (
        <div className="empty-attachments">
          <p>No documents attached.</p>
        </div>
      )}
      <div className="upload-box">
        <label className="field-label w-full">
          Document type
          <select
            value={uploadType}
            onChange={(e) => onUploadTypeChange(e.target.value as Attachment["type"])}
          >
            <option value="receipt">Payment receipt</option>
            <option value="delivery">Proof of delivery</option>
            <option value="other">Other document</option>
          </select>
        </label>
        <Button
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? "Uploading…" : "Choose file"}
        </Button>
        <p>PDF, JPG, PNG, or text · Up to 2 MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.txt"
          hidden
          onChange={(e) => void upload(e.target.files?.[0])}
        />
      </div>
    </section>
  );
}
