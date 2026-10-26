import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogContent className="help-dialog">
      <span className="help-dialog-icon">
        <Sparkles size={25} />
      </span>
      <DialogTitle>How to use Orderflow</DialogTitle>
      <DialogDescription>
        Follow each order from the first request to delivery.
      </DialogDescription>
      <ol>
        {[
          "Select Needs attention to find overdue orders or missing information.",
          "Open an order to see what to do next and who is responsible.",
          "Check the details and documents, then confirm the next step.",
          "Use Order history to see updates, and Stock checks to review shortages.",
        ].map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="demo-explainer">
        <strong>This is an interactive prototype.</strong>
        <p>
          Data and uploaded files stay in this browser. Team names are
          simulated; actions do not send messages, charge payments, reserve real
          inventory, or book deliveries.
        </p>
      </div>
      <Button onClick={() => onClose()}>
        Got it <ArrowRight size={15} />
      </Button>
    </DialogContent>
  );
}
