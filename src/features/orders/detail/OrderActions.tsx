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
}: {
  order: Order;
  update: (order: Order) => void;
  notify: (message: string) => void;
  onError: (message: string) => void;
  onEdit: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    setConfirm(false);
  }, [order.id, order.stage]);
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

  if (order.stage > 0 && order.stage < 5 && !check.ready) return null;

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
          {!check.ready && <p className="stage-validation" role="status">{check.reason}</p>}
          {order.stage === 0 && <Button variant="outline" onClick={onEdit}>Edit order details</Button>}
          <Button
            disabled={!check.ready}
            onClick={() => setConfirm(true)}
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
