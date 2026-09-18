import { useMemo, useState } from "react";
import { Scale, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { MoneyField, NumberField } from "@/components/field";
import { LoanTimeline } from "@/components/loan-timeline";
import {
  analyzeLoan,
  FREQUENCY_LABEL,
  INTERVAL_DAYS,
  PRESETS,
  type Frequency,
  type LenderKind,
  type LoanInput,
  type LoanResult,
  type PresetId,
} from "@/lib/loan-math";
import { cn, formatPct, formatPeso } from "@/lib/utils";

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
      followUpDay: useFollowUp && parseMoney(followUp) > 0 ? Math.floor(parseMoney(followUp)) : null,
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

  const result = useMemo(() => analyzeLoan(input), [input]);

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
      <Card className="lg:sticky lg:top-6">
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
            label="Processing / service fee na binawas"
            hint="0 kung buo ang natanggap. Kasama sa EIR."
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
            hint="Hindi kasama sa EIR; kasama sa 100% total-cost cap."
            value={penalty}
            onChange={setPenalty}
          />

          <div className="grid gap-3 rounded-lg bg-surface-2 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="follow">Tala: unang follow-up</Label>
                <p className="mt-1 text-xs text-muted-foreground text-pretty">
                  Opsyonal. Ilagay kung kailan unang tumawag o nag-message — hal. araw 4 sa 7-araw na loan.
                  Hindi ito interes at hindi paratang sa sinuman.
                </p>
              </div>
              <Switch
                id="follow-on"
                checked={useFollowUp}
                onCheckedChange={setUseFollowUp}
              />
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
              <p className="text-xs text-muted-foreground">
                Simula 1 Abril 2026, EIR cap ng sakop na loan ay 12%/buwan (SEC MC 14). Bago noon, 15%
                (Circ. 1133 / MC 3).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {!result ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Maglagay ng principal at hulog para makita ang totoong gastos.
            </CardContent>
          </Card>
        ) : (
          <>
            <Verdict result={result} />
            <StatGrid result={result} />
            <Card>
              <CardHeader>
                <CardTitle>Kalendaryo ng loan</CardTitle>
                <CardDescription>
                  {result.tenorDays}-araw na tenor · {result.schedule.length} hulog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoanTimeline input={input} result={result} />
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
                      <td className="px-5 py-2.5 tabular-nums">{formatPeso(result.netProceeds)}</td>
                    </tr>
                    {result.schedule.map((p) => (
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

function Verdict({ result }: { result: LoanResult }) {
  const over = result.anyOver;
  return (
    <Card className={cn(over ? "border-danger/40" : result.covered ? "border-primary/30" : "")}>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-lg",
            over ? "bg-danger-soft text-danger" : "bg-ok-soft text-ok",
          )}
        >
          <Scale className="size-6" strokeWidth={1.75} />
        </div>
        <div className="grid min-w-0 flex-1 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {result.covered ? (
              <Badge variant={over ? "danger" : "ok"}>
                {over ? "Lampas sa naka-publish na ceiling" : "Nasa loob ng naka-publish na ceiling"}
              </Badge>
            ) : (
              <Badge variant="warn">Walang percentage ceiling sa box na ito</Badge>
            )}
            {result.covered ? (
              <Badge>Sakop · ≤₱10,000 · ≤4 buwan · LC/FC</Badge>
            ) : null}
          </div>
          <p className="font-display text-xl leading-snug text-balance">
            {result.covered
              ? over
                ? "Ang EIR o gastos na kinala sa iyong numero ay lampas sa ceiling para sa sakop na small loan."
                : "Sa mga numerong inilagay mo, hindi lumampas ang sakop na ceiling."
              : "Walang naka-publish na porsyentong cap para sa loan na lampas ₱10,000, lampas 4 na buwan, o sa bangko."}
          </p>
          {!result.covered ? (
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {result.coverageReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : null}
          <p className="text-xs text-muted-foreground text-pretty">
            Illustration lang. Ang institusyon ang magbibigay ng opisyal na EIR sa disclosure statement
            (RA 3765 / BSP Circ. 730). Hindi ito legal advice at hindi tumutukoy sa anumang lender.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatGrid({ result }: { result: LoanResult }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Stat label="Natanggap (net proceeds)" value={formatPeso(result.netProceeds)} />
      <Stat label="Kabuuang babayaran" value={formatPeso(result.totalPayments)} />
      <Stat
        label="Finance charge (cash out − cash in)"
        value={formatPeso(result.financeCharge)}
      />
      <Stat
        label="Gastos vs. principal"
        value={`${formatPeso(result.totalCostVsPrincipal)} · ${formatPct(result.totalCostRatio)}`}
        mark={result.hits.find((h) => h.id === "totalCost")?.over ? "over" : result.covered ? "ok" : "off"}
      />
      <Stat
        label="Nominal / buwan"
        value={formatPct(result.nominalPerMonth)}
        hint="Interest sa face amount ÷ tenor sa 30-araw na buwan. Cap kung sakop: 6%/buwan."
        mark={result.hits.find((h) => h.id === "nominal")?.over ? "over" : result.covered ? "ok" : "off"}
      />
      <Stat
        label="EIR / buwan"
        value={result.irrOk ? formatPct(result.eirPerMonth) : "Hindi makalkula"}
        hint={`Discounted cash flow (M-2011-040). ${result.eirCapLabel}. Daily EIR: ${result.irrOk ? formatPct(result.eirPerDay, 3) : "—"}.`}
        mark={result.hits.find((h) => h.id === "eir")?.over ? "over" : result.covered ? "ok" : "off"}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  mark = "off",
}: {
  label: string;
  value: string;
  hint?: string;
  mark?: "ok" | "over" | "off";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {mark === "over" ? <Badge variant="danger">Lampas</Badge> : null}
        {mark === "ok" ? <Badge variant="ok">OK</Badge> : null}
      </div>
      <p className="mt-2 font-display text-2xl tabular-nums tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">{hint}</p> : null}
    </div>
  );
}

function LegalFoot() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="size-4" strokeWidth={1.75} />
          Batayan
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm leading-relaxed text-muted-foreground text-pretty">
        <p>
          <span className="font-medium text-foreground">RA No. 3765</span> (Truth in Lending Act) —
          written disclosure of finance charges at total cost bago ang transaksyon.
        </p>
        <p>
          <span className="font-medium text-foreground">BSP Circular No. 1133, s. 2021</span> at{" "}
          <span className="font-medium text-foreground">SEC MC No. 3, s. 2022</span> — para sa
          unsecured general-purpose loans ng lending/financing companies at OLP, ≤₱10,000, tenor ≤4
          buwan: nominal 6%/buwan, EIR 15%/buwan, late penalty 5%/buwan, total cost 100% ng inutang.
          Hindi sakop ang bangko.
        </p>
        <p>
          <span className="font-medium text-foreground">SEC MC No. 14, s. 2025</span> — parehong box;
          EIR cap 12%/buwan para sa loan na entered/restructured/renewed simula 1 Abril 2026.
        </p>
        <p>
          <span className="font-medium text-foreground">BSP Memorandum M-2011-040</span> / Circ. 730 —
          EIR = rate na nagdi-discount ng future cash flows sa net proceeds (nominal + processing /
          service / handling / verification fees; hindi late penalty).
        </p>
        <p>
          <span className="font-medium text-foreground">CB Circular No. 905, s. 1982</span> —
          suspended ang Usury Law ceilings. Labas sa small-loan box, walang published percentage cap;
          nananatili ang disclosure at ang husgado kung unconscionable.
        </p>
      </CardContent>
    </Card>
  );
}
