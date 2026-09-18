import { cn } from "@/lib/utils";
import type { LoanInput, LoanResult } from "@/lib/loan-math";

export function LoanTimeline({
  input,
  result,
}: {
  input: LoanInput;
  result: LoanResult;
}) {
  const days = Math.max(result.tenorDays, input.followUpDay ?? 0, 1);
  const showDays = days <= 16;
  if (!showDays) {
    return (
      <ol className="grid gap-2 text-sm">
        <li className="flex justify-between gap-4 border-b border-border py-2">
          <span className="text-muted-foreground">Araw 0</span>
          <span>Natanggap · {peso(result.netProceeds)}</span>
        </li>
        {result.schedule.map((p) => (
          <li
            key={p.n}
            className="flex justify-between gap-4 border-b border-border py-2 last:border-0"
          >
            <span className="text-muted-foreground">Araw {p.day}</span>
            <span>
              Hulog {p.n} · {peso(p.amount)}
            </span>
          </li>
        ))}
        {input.followUpDay != null && input.followUpDay > 0 ? (
          <li className="flex justify-between gap-4 py-2 text-muted-foreground">
            <span>Araw {input.followUpDay}</span>
            <span>Unang follow-up (tala mo)</span>
          </li>
        ) : null}
      </ol>
    );
  }

  const cells = Array.from({ length: days + 1 }, (_, day) => {
    const isStart = day === 0;
    const due = result.schedule.filter((p) => p.day === day);
    const follow = input.followUpDay === day && day > 0;
    return { day, isStart, due, follow };
  });

  return (
    <div className="grid gap-3">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${Math.min(days + 1, 8)}, minmax(0, 1fr))` }}
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
              Araw
            </span>
            <span className="font-display text-lg tabular-nums leading-none">{c.day}</span>
            <span className="mt-1 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
              {c.isStart
                ? "Pera"
                : c.due.length
                  ? "Due"
                  : c.follow
                    ? "Follow-up"
                    : "—"}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
        Araw 0 = natanggap ang pera. Due = araw ng hulog ayon sa inilagay mo.
        {input.followUpDay != null && input.followUpDay > 0
          ? ` Follow-up = araw ${input.followUpDay} (opsyonal na tala — hindi charge, hindi hatol sa lender).`
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
