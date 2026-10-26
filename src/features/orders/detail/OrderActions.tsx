import { useEffect, useState } from "react";
import { ArrowRight, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/format";
import {
  ACTIONS,
  STAGES,
  advanceOrder,
  money,
  readiness,
  total,
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


  return (
    <div className="detail-footer">
      {order.stage === 5 ? (
        <>
          <Button
            onClick={() => {
              const blob = new Blob(
                [
                  `${order.id} — Order summary\n${order.customer} · ${order.company}\nTotal: ${money(total(order))}\nStatus: Completed\n\n${order.activity.map((a) => `${formatTime(a.at)} — ${a.text}`).join("\n")}`,
                ],
                { type: "text/plain" },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${order.id}-summary.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={14} />
            Download summary
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
