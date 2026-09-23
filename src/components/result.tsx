import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CEILING_CAP_TEXT,
  CEILING_LABEL,
  COMPARISON_TITLE,
  COVERAGE_TEXT,
  DISCLAIMER,
  GRAY_EIR_TEXT,
  HEADLINE_METHOD_NOTE,
  headline,
  HOW_METHOD_TEXT,
  HOW_TITLE,
  howComputedRows,
  OLD_LOAN_NOTICE,
  ROW_CEILING_LABEL,
  ROW_NUMBER_LABEL,
  STATE_TEXT,
  UNSURE_COVERAGE_BADGE,
  UNSURE_COVERAGE_TEXT,
} from "@/lib/copy";
import { BasisLine, CapSegments } from "@/components/source-link";
import type { CheckId, LoanAnalysis } from "@/lib/loan-math";
import { plainText } from "@/lib/segments";
import { formatPct } from "@/lib/utils";

/** Any analysis that has numbers to show. */
export type Computed = Exclude<LoanAnalysis, { status: "cannot_compute" }>;

const BADGE = { WITHIN: "ok", GRAY: "warn", OVER: "danger" } as const;
const ROW_ORDER: CheckId[] = ["eir", "nominal", "totalCost"];

export function Headline({ analysis }: { analysis: Computed }) {
  return (
    <Card>
      <CardContent className="grid gap-2 p-5 sm:p-6">
        <h2 className="font-display text-2xl leading-snug text-balance sm:text-3xl">
          {headline(analysis.numbers)}
        </h2>
        <p className="text-sm text-muted-foreground text-pretty">{HEADLINE_METHOD_NOTE}</p>
      </CardContent>
    </Card>
  );
}

export function CeilingComparison({ analysis }: { analysis: Computed }) {
  if (analysis.status === "before_effective_date") {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-base leading-relaxed text-pretty">{OLD_LOAN_NOTICE}</p>
        </CardContent>
      </Card>
    );
  }

  const { coverage, checks } = analysis;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{COMPARISON_TITLE}</CardTitle>
        <CardDescription>
          <BasisLine />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <div>
            <Badge variant={coverage.state === "COVERED" ? "outline" : "warn"}>
              {COVERAGE_TEXT[coverage.state]}
            </Badge>
          </div>
          {coverage.reasons.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {coverage.reasons.map((reason) => (
                <li key={plainText(reason)}>
                  <CapSegments segments={reason} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {coverage.state !== "NOT_COVERED" ? (
          <ul className="grid gap-3">
            {ROW_ORDER.map((id) => {
              const check = checks[id];
              // GRAY means two different things: the law is unclear about the monthly
              // rate (raw GRAY), or the number is over but coverage is uncertain (raw OVER).
              const softened = check.state === "GRAY" && check.raw === "OVER";
              const note =
                id === "eir" && check.raw === "GRAY"
                  ? GRAY_EIR_TEXT
                  : softened
                    ? UNSURE_COVERAGE_TEXT
                    : null;
              return (
                <li
                  key={id}
                  className="grid gap-1.5 rounded-lg border border-border bg-surface-2 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium">{CEILING_LABEL[id]}</p>
                    {check.state ? (
                      <Badge variant={BADGE[check.state]}>
                        {softened ? UNSURE_COVERAGE_BADGE : STATE_TEXT[check.state]}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ROW_NUMBER_LABEL}{" "}
                    <span className="font-display text-base tabular-nums text-foreground">
                      {formatPct(check.actual)}
                    </span>{" "}
                    · {ROW_CEILING_LABEL} <CapSegments segments={CEILING_CAP_TEXT[id]} />
                  </p>
                  {note ? <p className="text-sm text-pretty">{note}</p> : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        <p className="text-xs text-muted-foreground text-pretty">{DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}

export function HowComputed({ analysis }: { analysis: Computed }) {
  return (
    <details className="group rounded-xl border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">
        {HOW_TITLE}
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
          strokeWidth={1.75}
        />
      </summary>
      <div className="grid gap-4 border-t border-border p-4">
        <dl className="grid gap-2 text-sm">
          {howComputedRows(analysis.numbers).map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {HOW_METHOD_TEXT}
        </p>
      </div>
    </details>
  );
}
