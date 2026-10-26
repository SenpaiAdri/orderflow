import { useRef, useState } from "react";
import { Download, FileText, LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, total, type Order, type Attachment } from "@/lib/workflow";

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
    const data =
      a.data ||
      `data:text/plain;charset=utf-8,${encodeURIComponent(`ORDERFLOW SAMPLE ATTACHMENT\n${a.name}\nOrder: ${order.id}\nCustomer: ${order.customer}\nAmount: ${money(total(order))}\nThis is a placeholder for seeded demo evidence.`)}`;
    const link = document.createElement("a");
    link.href = data;
    link.download = a.data ? a.name : `${a.name}.sample.txt`;
    link.click();
  }

  return (
    <section className="detail-section attachment-section" hidden={!active}>
      <h3>
        Order attachments <span>{order.attachments.length} files</span>
      </h3>
      <p className="muted">
        Keep payment evidence and delivery documents with the order.
      </p>
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
                  : "Supporting document"}{" "}
              ·{" "}
              {!a.data
                ? "Sample placeholder"
                : a.name.startsWith("Demo")
                  ? "Demo file"
                  : "Uploaded file"}
            </small>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Download ${a.name}`}
            onClick={() => download(a)}
          >
            <Download size={16} />
          </Button>
        </div>
      ))}
      {!order.attachments.length && (
        <div className="empty-attachments">
          <FileText size={28} />
          <p>No files attached yet.</p>
        </div>
      )}
      <div className="upload-box">
        <Upload size={22} />
        <strong>Add a document</strong>
        <p>PDF, JPG, PNG, or text · Up to 2 MB per file</p>
        <select
          aria-label="Attachment type"
          value={uploadType}
          onChange={(e) => onUploadTypeChange(e.target.value as Attachment["type"])}
        >
          <option value="receipt">Payment receipt</option>
          <option value="delivery">Proof of delivery</option>
          <option value="other">Other document</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          Choose file
        </Button>
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
