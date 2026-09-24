import type { CSSProperties } from "react";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { LoanInput, LoanNumbers } from "@/lib/loan-math";

export function LoanTimeline({
  input,
  numbers,
}: {
  input: LoanInput;
  numbers: LoanNumbers;
}) {
  const days = Math.max(numbers.tenorDays, input.followUpDay ?? 0, 1);
  const showDays = days <= 16;
  if (!showDays) {
    return (
      <ol className="grid gap-2 text-sm">
        <li className="flex justify-between gap-4 border-b border-border py-2">
          <span className="text-muted-foreground">{copy.timelineDay0}</span>
          <span>{copy.timelineReceived(peso(numbers.netProceeds))}</span>
        </li>
        {numbers.schedule.map((p) => (
          <li
            key={p.n}
            className="flex justify-between gap-4 border-b border-border py-2 last:border-0"
          >
            <span className="text-muted-foreground">{copy.timelineDay(p.day)}</span>
            <span>{copy.timelinePayment(p.n, peso(p.amount))}</span>
          </li>
        ))}
        {input.followUpDay != null && input.followUpDay > 0 ? (
          <li className="flex justify-between gap-4 py-2 text-muted-foreground">
            <span>{copy.timelineDay(input.followUpDay)}</span>
            <span>{copy.timelineFollowUp}</span>
          </li>
        ) : null}
      </ol>
    );
  }

  const cells = Array.from({ length: days + 1 }, (_, day) => {
    const isStart = day === 0;
    const due = numbers.schedule.filter((p) => p.day === day);
    const follow = input.followUpDay === day && day > 0;
    return { day, isStart, due, follow };
  });

  return (
    <div className="grid gap-3">
      {/* Up to 8 days a row; 4 below 414px wide, where a cell is too narrow for its label
          ("Received", "Follow-up") and a smaller type size would be unreadable (N31). */}
      <div
        className="grid grid-cols-[repeat(var(--cols-narrow),minmax(0,1fr))] gap-1 min-[414px]:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        style={
          { "--cols": Math.min(days + 1, 8), "--cols-narrow": Math.min(days + 1, 4) } as CSSProperties
        }
      >
        {cells.map((c) => (
          <div
            key={c.day}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center rounded-md border px-1 py-2 text-center",
              c.isStart && "border-primary/40 bg-ok-soft",
              c.due.length > 0 && "border-danger/40 bg-danger-soft",
              c.follow && c.due.length === 0 && !c.isStart && "border-warn/40 bg-warn-soft",
              !c.isStart && c.due.length === 0 && !c.follow && "border-border bg-surface-2",
            )}
          >
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {copy.timelineDayCell}
            </span>
            <span className="font-display text-lg tabular-nums leading-none">{c.day}</span>
            <span className="mt-1 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
              {c.isStart
                ? copy.timelineCellReceived
                : c.due.length
                  ? copy.timelineCellDue
                  : c.follow
                    ? copy.timelineCellFollowUp
                    : "—"}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
        {copy.timelineLegend}
        {input.followUpDay != null && input.followUpDay > 0
          ? copy.timelineLegendFollowUp(input.followUpDay)
          : null}
      </p>
    </div>
  );
}

function peso(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}
