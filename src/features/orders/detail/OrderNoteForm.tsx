import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function OrderNoteForm({
  note,
  onChange,
  onSubmit,
}: {
  note: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <label className="field-label">
        Add a note
        <textarea
          value={note}
          onChange={(event) => onChange(event.target.value)}
          placeholder="What should the next person know?"
          maxLength={1000}
        />
      </label>
      <Button size="sm" disabled={!note.trim()}>
        Add note
      </Button>
    </form>
  );
}
