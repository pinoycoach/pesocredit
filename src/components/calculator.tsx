import { useMemo, useState } from "react";
import { Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { MoneyField, NumberField } from "@/components/field";
import { LoanTimeline } from "@/components/loan-timeline";
import { CeilingComparison, Headline, HowComputed } from "@/components/result";
import { BasisLine, CapSegments, SourceLink } from "@/components/source-link";
import {
  analyzeLoan,
  FREQUENCY_LABEL,
  INTERVAL_DAYS,
  PRESETS,
  type Frequency,
  type LenderKind,
  type LoanInput,
  type PresetId,
} from "@/lib/loan-math";
import {
  CANNOT_COMPUTE_TEXT,
  DATE_HINT,
  FEE_HINT,
  FEE_LABEL,
  LEGAL_FOOT,
  LEGAL_FOOT_TITLE,
  NO_STORAGE_NOTE,
  PENALTY_HINT,
} from "@/lib/copy";
import { cn, formatPeso } from "@/lib/utils";

function parseMoney(s: string): number {
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function todayISO() {
  const d = new Date();
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

export function Calculator() {
  const [preset, setPreset] = useState<PresetId>("7d");
  const [principal, setPrincipal] = useState("5000");
  const [upfrontFee, setUpfrontFee] = useState("0");
  const [payment, setPayment] = useState("6500");
  const [paymentCount, setPaymentCount] = useState("1");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [firstDueDays, setFirstDueDays] = useState("7");
  const [penalty, setPenalty] = useState("0");
  const [followUp, setFollowUp] = useState("4");
  const [useFollowUp, setUseFollowUp] = useState(true);
  const [unsecured, setUnsecured] = useState(true);
  const [generalPurpose, setGeneralPurpose] = useState(true);
  const [lenderKind, setLenderKind] = useState<LenderKind>("lending_or_financing");
  const [bookedOn, setBookedOn] = useState(todayISO());

  const input: LoanInput = useMemo(
    () => ({
      principal: parseMoney(principal),
      upfrontFee: parseMoney(upfrontFee) || 0,
      payment: parseMoney(payment),
      paymentCount: Math.max(1, Math.floor(parseMoney(paymentCount) || 1)),
      frequency,
      firstDueDays: Math.max(1, Math.floor(parseMoney(firstDueDays) || INTERVAL_DAYS[frequency])),
      penalty: parseMoney(penalty) || 0,
      unsecured,
      generalPurpose,
      lenderKind,
      bookedOn,
      followUpDay:
        useFollowUp && parseMoney(followUp) > 0 ? Math.floor(parseMoney(followUp)) : null,
    }),
    [
      principal,
      upfrontFee,
      payment,
      paymentCount,
      frequency,
      firstDueDays,
      penalty,
      unsecured,
      generalPurpose,
      lenderKind,
      bookedOn,
      followUp,
      useFollowUp,
    ],
  );

  const analysis = useMemo(() => analyzeLoan(input), [input]);

  function applyPreset(id: PresetId) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    if (p.patch.frequency) setFrequency(p.patch.frequency);
    if (p.patch.paymentCount != null) setPaymentCount(String(p.patch.paymentCount));
    if (p.patch.firstDueDays != null) setFirstDueDays(String(p.patch.firstDueDays));
    if (p.patch.followUpDay == null) {
      setUseFollowUp(false);
      setFollowUp("");
    } else {
      setUseFollowUp(true);
      setFollowUp(String(p.patch.followUpDay));
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
      <div className="grid gap-3 lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Mga numero ng loan mo</CardTitle>
            <CardDescription>
              Kunin sa disclosure statement, resibo, o app screen — hindi sa advertisement.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  data-preset={p.id}
                  variant={preset === p.id ? "default" : "outline"}
                  className="h-auto min-h-11 flex-col items-start gap-0.5 py-2 text-left"
                  onClick={() => applyPreset(p.id)}
                >
                  <span>{p.label}</span>
                  <span
                    className={cn(
                      "text-[11px] font-normal",
                      preset === p.id ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {p.hint}
                  </span>
                </Button>
              ))}
            </div>

            <MoneyField
              id="principal"
              label="Inutang (principal)"
              hint="Face amount sa kontrata — hindi ang natanggap kung may binawas."
              value={principal}
              onChange={setPrincipal}
            />
            <MoneyField
              id="fee"
              label={FEE_LABEL}
              hint={FEE_HINT}
              value={upfrontFee}
              onChange={setUpfrontFee}
            />
            <MoneyField
              id="payment"
              label="Hulog bawat bayad"
              hint="Ang sinusulat sa schedule — isang numero lang kung isang bayad sa dulo."
              value={payment}
              onChange={setPayment}
            />

            <div className="grid grid-cols-2 gap-3">
              <NumberField
                id="count"
                label="Ilang hulog"
                value={paymentCount}
                onChange={setPaymentCount}
                min={1}
              />
              <NumberField
                id="first"
                label="Unang due (araw)"
                hint="7 = due sa ika-7 araw"
                value={firstDueDays}
                onChange={setFirstDueDays}
                min={1}
              />
            </div>

            <div className="grid gap-2">
              <Label>Dalas ng hulog</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FREQUENCY_LABEL) as Frequency[]).map((f) => (
                  <Button
                    key={f}
                    type="button"
                    size="sm"
                    variant={frequency === f ? "default" : "outline"}
                    onClick={() => {
                      setFrequency(f);
                      setPreset(
                        f === "weekly" && paymentCount === "1" && firstDueDays === "7"
                          ? "7d"
                          : (preset as PresetId),
                      );
                    }}
                  >
                    {FREQUENCY_LABEL[f]}
                  </Button>
                ))}
              </div>
            </div>

            <MoneyField
              id="penalty"
              label="Late penalty na siningil (kung meron)"
              hint={<CapSegments segments={PENALTY_HINT} />}
              value={penalty}
              onChange={setPenalty}
            />

            <div className="grid gap-3 rounded-lg bg-surface-2 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="follow">Tala: unang follow-up</Label>
                  <p className="mt-1 text-xs text-muted-foreground text-pretty">
                    Opsyonal. Ilagay kung kailan unang tumawag o nag-message — hal. araw 4 sa 7-araw
                    na loan. Hindi ito interes at hindi paratang sa sinuman.
                  </p>
                </div>
                <Switch id="follow-on" checked={useFollowUp} onCheckedChange={setUseFollowUp} />
              </div>
              {useFollowUp ? (
                <NumberField
                  id="follow"
                  label="Araw ng unang follow-up"
                  value={followUp}
                  onChange={setFollowUp}
                  min={1}
                />
              ) : null}
            </div>

            <Separator />

            <div className="grid gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Saklaw ng ceiling
              </p>
              <ToggleRow
                id="lender"
                label="Lending / financing company (hindi bangko)"
                checked={lenderKind === "lending_or_financing"}
                onCheckedChange={(v) => setLenderKind(v ? "lending_or_financing" : "bank")}
              />
              <ToggleRow
                id="unsecured"
                label="Unsecured, general-purpose"
                checked={unsecured && generalPurpose}
                onCheckedChange={(v) => {
                  setUnsecured(v);
                  setGeneralPurpose(v);
                }}
              />
              <div className="grid gap-1.5">
                <Label htmlFor="booked">Petsa ng kontrata / renewal</Label>
                <input
                  id="booked"
                  type="date"
                  value={bookedOn}
                  onChange={(e) => setBookedOn(e.target.value)}
                  className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">{DATE_HINT}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ok" strokeWidth={1.75} />
          {NO_STORAGE_NOTE}
        </p>
      </div>

      <div className="grid gap-4">
        {analysis.status === "cannot_compute" ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {CANNOT_COMPUTE_TEXT[analysis.reason]}
            </CardContent>
          </Card>
        ) : (
          <>
            <Headline analysis={analysis} />
            <CeilingComparison analysis={analysis} />
            <HowComputed analysis={analysis} />
            <Card>
              <CardHeader>
                <CardTitle>Kalendaryo ng loan</CardTitle>
                <CardDescription>
                  {analysis.numbers.tenorDays}-araw na tenor · {analysis.numbers.schedule.length}{" "}
                  hulog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoanTimeline input={input} numbers={analysis.numbers} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Iskedyul</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="px-5 py-2 font-medium">#</th>
                      <th className="px-5 py-2 font-medium">Araw</th>
                      <th className="px-5 py-2 font-medium">Bayad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-5 py-2.5 text-muted-foreground">0</td>
                      <td className="px-5 py-2.5">Release</td>
                      <td className="px-5 py-2.5 tabular-nums">
                        {formatPeso(analysis.numbers.netProceeds)}
                      </td>
                    </tr>
                    {analysis.numbers.schedule.map((p) => (
                      <tr key={p.n} className="border-b border-border last:border-0">
                        <td className="px-5 py-2.5 tabular-nums">{p.n}</td>
                        <td className="px-5 py-2.5 tabular-nums">{p.day}</td>
                        <td className="px-5 py-2.5 tabular-nums">{formatPeso(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <LegalFoot />
          </>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-sm font-normal leading-snug">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function LegalFoot() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="size-4" strokeWidth={1.75} />
          {LEGAL_FOOT_TITLE}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm leading-relaxed text-muted-foreground text-pretty">
        {LEGAL_FOOT.map(({ term, termIsSource, segments }) => (
          <p key={term}>
            <span className="font-medium text-foreground">
              {termIsSource ? <SourceLink>{term}</SourceLink> : term}
            </span>{" "}
            <CapSegments segments={segments} />
          </p>
        ))}
        <p className="text-xs">
          <BasisLine />
        </p>
      </CardContent>
    </Card>
  );
}
