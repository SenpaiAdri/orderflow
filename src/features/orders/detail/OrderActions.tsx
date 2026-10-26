import { useEffect, useState } from "react";
import { ArrowRight, Download, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACTIONS,
  STAGES,
  advanceOrder,
  readiness,
  type Order,
} from "@/lib/workflow";

export function OrderActions({
  order,
  update,
  notify,
  onError,
  onEdit,
  onResolve,
  uploading,
  viewingCurrent,
  onReturn,
}: {
  order: Order;
  update: (order: Order) => void;
  notify: (message: string) => void;
  onError: (message: string) => void;
  onEdit: () => void;
  onResolve: () => void;
  uploading: boolean;
  viewingCurrent: boolean;
  onReturn: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  useEffect(() => {
    setConfirm(false);
  }, [order.id, order.stage, viewingCurrent]);
  const check = readiness(order);
  function next() {
    try {
      update(advanceOrder(order));
      setConfirm(false);
      notify(`${order.id} moved to ${STAGES[order.stage + 1]}`);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Unable to advance order");
    }
  }

  async function downloadSummary() {
    if (downloading) return;
    setSummaryError("");
    setDownloading(true);
    try {
      const { downloadOrderSummary } = await import("./download-order-summary");
      await downloadOrderSummary(order);
    } catch {
      setSummaryError("Unable to create the PDF. Try downloading again.");
    } finally {
      setDownloading(false);
    }
  }


  return (
    <div className="detail-footer">
      {order.stage === 5 ? (
        <>
          {summaryError && <p className="inline-error w-full" role="alert">{summaryError}</p>}
          <Button disabled={downloading} onClick={() => void downloadSummary()}>
            {downloading ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? "Preparing PDF…" : "Download summary (PDF)"}
          </Button>
        </>
      ) : confirm ? (
        <div className="confirm-action">
          <p>
            <ShieldCheck size={17} />
            {ACTIONS[order.stage]} and move to {STAGES[order.stage + 1]}?
          </p>
          <div>
            <Button autoFocus variant="outline" onClick={() => setConfirm(false)}>
              Go back
            </Button>
            <Button onClick={next}>
              {ACTIONS[order.stage]} <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <>
          {(!check.ready || !viewingCurrent) && <p id="stage-requirement" className="stage-validation" role="status">
            {!viewingCurrent ? `Return to ${STAGES[order.stage]} to continue.` : check.reason}
          </p>}
          {order.stage === 0 && viewingCurrent && <Button variant="outline" onClick={onEdit}>Edit order details</Button>}
          <Button
            disabled={uploading}
            aria-disabled={!check.ready || !viewingCurrent || uploading}
            aria-describedby={!check.ready || !viewingCurrent ? "stage-requirement" : undefined}
            data-blocked={!check.ready || !viewingCurrent || undefined}
            onClick={() => {
              if (!viewingCurrent) { onReturn(); return; }
              if (!check.ready) { onResolve(); return; }
              setConfirm(true);
            }}
            title={check.reason || ACTIONS[order.stage]}
          >
            {ACTIONS[order.stage]}
            <ArrowRight size={15} />
          </Button>
        </>
      )}
    </div>
  );
}
