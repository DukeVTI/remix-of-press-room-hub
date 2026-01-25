import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const REASONS = [
  { value: "misleading", label: "Misleading" },
  { value: "falsehood", label: "Falsehood" },
  { value: "wrong_impression", label: "Wrong Impression" },
  { value: "cyber_bully", label: "Cyber Bully" },
  { value: "scam", label: "Scam" },
  { value: "cursing", label: "Cursing" },
  { value: "abuse", label: "Abuse" },
  { value: "discrimination", label: "Discrimination" },
  { value: "bad_profiling", label: "Bad Profiling" },
  { value: "propaganda", label: "Propaganda" },
  { value: "instigating", label: "Instigating" },
  { value: "miseducation", label: "Miseducation" },
  { value: "disrespectful", label: "Disrespectful" },
  { value: "intolerance", label: "Intolerance" },
  { value: "others", label: "Others" },
];


interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (reasons: string[], customReason?: string) => Promise<void>;
  itemType: "post" | "comment" | "blog" | "user";
  itemId: string;
}

export function ReportModal({ open, onClose, onSubmit, itemType, itemId }: ReportModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else if (selected.length < 5) {
      setSelected([...selected, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (selected.length === 0) {
      setError("Select at least one reason.");
      return;
    }
    if (selected.includes("others") && (!customReason.trim() || customReason.length > 250)) {
      setError("Please provide a custom reason (max 250 chars).");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(selected, selected.includes("others") ? customReason : undefined);
      setSelected([]);
      setCustomReason("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report {itemType.charAt(0).toUpperCase() + itemType.slice(1)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Report Form">
          <div className="text-sm mb-2">Help us keep Press Room Publisher safe. Select up to 5 reasons why you're reporting this content.</div>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((reason) => (
              <label key={reason.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selected.includes(reason.value)}
                  onCheckedChange={() => handleToggle(reason.value)}
                  aria-label={reason.label}
                  disabled={loading && !selected.includes(reason.value)}
                />
                {reason.label}
              </label>
            ))}
          </div>
          {selected.includes("others") && (
            <div>
              <Textarea
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                maxLength={250}
                required
                placeholder="Please explain (max 250 characters)"
                aria-label="Custom reason"
                className="mt-2"
                disabled={loading}
              />
              <div className="text-xs text-muted-foreground text-right">{customReason.length}/250</div>
            </div>
          )}
          {error && <div className="text-red-600 text-sm" aria-live="polite">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} aria-label="Cancel report">Cancel</Button>
            <Button type="submit" disabled={loading} aria-label="Submit report">
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
