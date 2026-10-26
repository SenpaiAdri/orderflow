import { useRef, useState } from "react";
import { attachStageEvidence, stageEvidenceType, type Order } from "@/lib/workflow";

export function useEvidenceUpload({ order, update, notify, onError, onUploaded }: {
  order: Order;
  update: (order: Order) => void;
  notify: (message: string) => void;
  onError: (message: string) => void;
  onUploaded: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const latestOrder = useRef(order);
  latestOrder.current = order;
  const [uploading, setUploading] = useState(false);
  const pending = useRef(false);
  const selection = useRef<{ id: string; stage: Order["stage"] } | null>(null);

  function chooseFile() {
    if (pending.current || !stageEvidenceType(order.stage)) return;
    selection.current = { id: order.id, stage: order.stage };
    onError("");
    fileRef.current?.click();
  }

  async function upload(file: File | undefined) {
    const selected = selection.current;
    if (fileRef.current) fileRef.current.value = "";
    if (!file || !selected || pending.current) return;
    onError("");
    if (file.size > 2 * 1024 * 1024) {
      onError("Choose a file smaller than 2 MB.");
      return;
    }
    if (!["application/pdf", "image/png", "image/jpeg", "text/plain"].includes(file.type)) {
      onError("Use a PDF, PNG, JPG, or text file.");
      return;
    }
    pending.current = true;
    setUploading(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read that file. Please try again."));
        reader.readAsDataURL(file);
      });
      const current = latestOrder.current;
      if (selected.id !== current.id || selected.stage !== current.stage)
        throw new Error("The order stage changed. Choose the file again at the current stage.");
      const type = stageEvidenceType(current.stage);
      if (!type) throw new Error("Documents cannot be added at this stage.");
      update(attachStageEvidence(current, { name: file.name, type, data }));
      notify(type === "receipt" ? "Payment receipt attached" : "Delivery proof attached");
      onUploaded();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to attach that file.");
    } finally {
      pending.current = false;
      setUploading(false);
    }
  }

  return { fileRef, chooseFile, upload, uploading };
}
