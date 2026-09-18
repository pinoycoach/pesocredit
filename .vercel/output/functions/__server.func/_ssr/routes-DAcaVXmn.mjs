import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Scale, r as Info } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as Slot } from "../_libs/@radix-ui/react-primitive+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DAcaVXmn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatPeso(n) {
	if (!Number.isFinite(n)) return "—";
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		maximumFractionDigits: 2
	}).format(n);
}
function formatPct(n, digits = 2) {
	if (!Number.isFinite(n)) return "—";
	return `${(n * 100).toLocaleString("en-PH", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	})}%`;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-92",
			outline: "border border-border bg-transparent text-foreground hover:bg-surface-2",
			ghost: "text-foreground hover:bg-surface-2",
			subtle: "bg-surface-2 text-foreground hover:bg-border/60"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-md px-5 text-base",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
var badgeVariants = cva("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground",
		outline: "border-border text-muted-foreground",
		ok: "border-transparent bg-ok-soft text-ok",
		warn: "border-transparent bg-warn-soft text-warn",
		danger: "border-transparent bg-danger-soft text-danger"
	} },
	defaultVariants: { variant: "outline" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({
			variant,
			className
		})),
		...props
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl border border-border bg-surface text-foreground", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 p-5 pb-0", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: cn("font-display text-lg font-medium tracking-tight text-balance", className),
		...props
	});
}
function CardDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-sm text-muted-foreground text-pretty", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("p-5", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className),
		...props
	});
}
function Separator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "separator",
		className: cn("h-px w-full bg-border", className),
		...props
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", "data-[state=checked]:bg-primary data-[state=unchecked]:bg-border", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block size-5 rounded-full bg-surface shadow-sm transition-transform", "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5") })
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-[var(--motion-quick)] placeholder:text-muted-foreground", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary", "disabled:cursor-not-allowed disabled:opacity-50", "tabular-nums", className),
		...props
	});
}
function MoneyField({ id, label, hint, value, onChange, prefix = "₱" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: id,
				children: label
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground text-pretty",
				children: hint
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground",
					children: prefix
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id,
					inputMode: "decimal",
					autoComplete: "off",
					className: "pl-8",
					value,
					onChange: (e) => onChange(e.target.value)
				})]
			})
		]
	});
}
function NumberField({ id, label, hint, value, onChange, min, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid gap-1.5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: id,
				children: label
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground text-pretty",
				children: hint
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id,
				inputMode: "numeric",
				autoComplete: "off",
				min,
				value,
				onChange: (e) => onChange(e.target.value)
			})
		]
	});
}
function LoanTimeline({ input, result }) {
	const days = Math.max(result.tenorDays, input.followUpDay ?? 0, 1);
	if (!(days <= 16)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
		className: "grid gap-2 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex justify-between gap-4 border-b border-border py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Araw 0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Natanggap · ", peso(result.netProceeds)] })]
			}),
			result.schedule.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex justify-between gap-4 border-b border-border py-2 last:border-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: ["Araw ", p.day]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Hulog ",
					p.n,
					" · ",
					peso(p.amount)
				] })]
			}, p.n)),
			input.followUpDay != null && input.followUpDay > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex justify-between gap-4 py-2 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Araw ", input.followUpDay] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unang follow-up (tala mo)" })]
			}) : null
		]
	});
	const cells = Array.from({ length: days + 1 }, (_, day) => {
		return {
			day,
			isStart: day === 0,
			due: result.schedule.filter((p) => p.day === day),
			follow: input.followUpDay === day && day > 0
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-1",
			style: { gridTemplateColumns: `repeat(${Math.min(days + 1, 8)}, minmax(0, 1fr))` },
			children: cells.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-h-16 flex-col items-center justify-center rounded-md border px-1 py-2 text-center", c.isStart && "border-primary/40 bg-ok-soft", c.due.length > 0 && "border-danger/40 bg-danger-soft", c.follow && c.due.length === 0 && !c.isStart && "border-warn/40 bg-warn-soft", !c.isStart && c.due.length === 0 && !c.follow && "border-border bg-surface-2"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase tracking-wider text-muted-foreground",
						children: "Araw"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg tabular-nums leading-none",
						children: c.day
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 line-clamp-2 text-[10px] leading-tight text-muted-foreground",
						children: c.isStart ? "Pera" : c.due.length ? "Due" : c.follow ? "Follow-up" : "—"
					})
				]
			}, c.day))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs leading-relaxed text-muted-foreground text-pretty",
			children: ["Araw 0 = natanggap ang pera. Due = araw ng hulog ayon sa inilagay mo.", input.followUpDay != null && input.followUpDay > 0 ? ` Follow-up = araw ${input.followUpDay} (opsyonal na tala — hindi charge, hindi hatol sa lender).` : null]
		})]
	});
}
function peso(n) {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		maximumFractionDigits: 0
	}).format(n);
}
var INTERVAL_DAYS = {
	daily: 1,
	weekly: 7,
	biweekly: 14,
	monthly: 30
};
var FREQUENCY_LABEL = {
	daily: "Araw-araw",
	weekly: "Bawat 7 araw",
	biweekly: "Bawat 14 araw",
	monthly: "Buwanan (~30 araw)"
};
var NOMINAL_CAP_PER_MONTH = .06;
var EIR_CAP_PER_MONTH_MC14 = .12;
var EIR_CAP_PER_MONTH_MC3 = .15;
var PENALTY_CAP_PER_MONTH = .05;
var MC14_EFFECTIVE = /* @__PURE__ */ new Date("2026-04-01T00:00:00+08:00");
function npv(ratePerDay, flows) {
	let s = 0;
	for (const f of flows) s += f.amount / Math.pow(1 + ratePerDay, f.day);
	return s;
}
/** Daily IRR. Borrower sign: +in at t0, −payments later. */
function irrDaily(flows) {
	if (flows.length < 2) return null;
	const f = (r) => npv(r, flows);
	let lo = -.85;
	let hi = 2;
	let nLo = f(lo);
	let nHi = f(hi);
	if (!Number.isFinite(nLo) || !Number.isFinite(nHi)) return null;
	if (nLo * nHi > 0) for (const trial of [
		5,
		10,
		25,
		80,
		200
	]) {
		hi = trial;
		nHi = f(hi);
		if (Number.isFinite(nHi) && nLo * nHi <= 0) break;
	}
	if (!Number.isFinite(nHi) || nLo * nHi > 0) return null;
	for (let i = 0; i < 90; i++) {
		const mid = (lo + hi) / 2;
		const n = f(mid);
		if (!Number.isFinite(n)) return null;
		if (nLo * n <= 0) hi = mid;
		else {
			lo = mid;
			nLo = n;
		}
	}
	return (lo + hi) / 2;
}
function buildSchedule(input) {
	const interval = INTERVAL_DAYS[input.frequency];
	const first = Math.max(1, Math.round(input.firstDueDays) || interval);
	const n = Math.max(1, Math.floor(input.paymentCount));
	const schedule = Array.from({ length: n }, (_, i) => ({
		n: i + 1,
		day: first + i * interval,
		amount: input.payment
	}));
	return {
		schedule,
		tenorDays: schedule[schedule.length - 1]?.day ?? first
	};
}
function analyzeLoan(input) {
	if (!(input.principal > 0) || !(input.payment >= 0) || !(input.paymentCount >= 1)) return null;
	const upfront = Math.max(0, input.upfrontFee);
	const netProceeds = input.principal - upfront;
	if (netProceeds <= 0) return null;
	const { schedule, tenorDays } = buildSchedule(input);
	const penalty = Math.max(0, input.penalty);
	const totalPayments = schedule.reduce((s, p) => s + p.amount, 0) + penalty;
	const financeCharge = totalPayments - netProceeds;
	totalPayments - input.principal + (upfront > 0 ? upfront : 0);
	const statutoryCost = totalPayments + (netProceeds < input.principal ? input.principal - netProceeds : 0) - input.principal;
	const totalCostRatio = statutoryCost / input.principal;
	const cashflows = [{
		day: 0,
		amount: netProceeds,
		label: "Natanggap"
	}, ...schedule.map((p) => ({
		day: p.day,
		amount: -p.amount,
		label: `Hulog ${p.n}`
	}))];
	if (penalty > 0) cashflows.push({
		day: tenorDays,
		amount: -penalty,
		label: "Penalty"
	});
	const rDay = irrDaily([{
		day: 0,
		amount: netProceeds,
		label: "Natanggap"
	}, ...schedule.map((p) => ({
		day: p.day,
		amount: -p.amount,
		label: `Hulog ${p.n}`
	}))]);
	const irrOk = rDay !== null && Number.isFinite(rDay);
	const eirPerDay = irrOk ? rDay : NaN;
	const eirPerMonth = irrOk ? Math.pow(1 + eirPerDay, 30) - 1 : NaN;
	const periodRate = irrOk ? Math.pow(1 + eirPerDay, tenorDays) - 1 : NaN;
	const interestOnFace = Math.max(0, schedule.reduce((s, p) => s + p.amount, 0) - input.principal);
	const months = tenorDays / 30;
	const nominalPerMonth = months > 0 ? interestOnFace / input.principal / months : NaN;
	const coverageReasons = [];
	if (input.lenderKind !== "lending_or_financing") coverageReasons.push("Ang ceiling ay para sa lending/financing companies at online lending platforms — hindi sa bangko.");
	if (!input.unsecured) coverageReasons.push("Ang ceiling ay para sa unsecured loans.");
	if (!input.generalPurpose) coverageReasons.push("Ang ceiling ay para sa general-purpose loans.");
	if (input.principal > 1e4) coverageReasons.push(`Principal na ₱${input.principal.toLocaleString("en-PH")} ay lampas sa ₱10,000 na sakop.`);
	if (tenorDays > 120) coverageReasons.push(`Tenor na ${tenorDays} araw ay lampas sa 4 na buwan (≤120 araw sa 30-araw na buwan).`);
	const covered = coverageReasons.length === 0;
	const booked = input.bookedOn ? /* @__PURE__ */ new Date(input.bookedOn + "T12:00:00") : /* @__PURE__ */ new Date();
	const useMc14 = !Number.isNaN(booked.getTime()) && booked >= MC14_EFFECTIVE;
	const eirCap = useMc14 ? EIR_CAP_PER_MONTH_MC14 : EIR_CAP_PER_MONTH_MC3;
	const eirCapLabel = useMc14 ? "12% / buwan (SEC MC 14, s. 2025; simula 1 Abril 2026)" : "15% / buwan (BSP Circ. 1133 / SEC MC 3; covered loan bago 1 Abril 2026)";
	const hits = [
		{
			id: "nominal",
			label: "Nominal interest",
			cap: NOMINAL_CAP_PER_MONTH,
			actual: nominalPerMonth,
			over: covered && Number.isFinite(nominalPerMonth) && nominalPerMonth > .060001,
			unit: "pct-month",
			cite: "6% / buwan — BSP Circ. 1133, s. 2021; SEC MC 3, s. 2022; SEC MC 14, s. 2025"
		},
		{
			id: "eir",
			label: "Effective interest (EIR)",
			cap: eirCap,
			actual: eirPerMonth,
			over: covered && Number.isFinite(eirPerMonth) && eirPerMonth > eirCap + 1e-6,
			unit: "pct-month",
			cite: eirCapLabel
		},
		{
			id: "penalty",
			label: "Late penalty (sa hulog na overdue)",
			cap: PENALTY_CAP_PER_MONTH,
			actual: NaN,
			over: false,
			unit: "pct-month",
			cite: "5% / buwan sa outstanding scheduled amount due — Circ. 1133 / MC 3 / MC 14"
		},
		{
			id: "totalCost",
			label: "Kabuuang gastos vs. inutang",
			cap: 1,
			actual: totalCostRatio,
			over: covered && Number.isFinite(totalCostRatio) && totalCostRatio > 1.000001,
			unit: "ratio",
			cite: "100% ng amount borrowed (interest + fees + penalties) — Circ. 1133 / MC 3 / MC 14"
		}
	];
	return {
		netProceeds,
		tenorDays,
		totalPayments,
		financeCharge,
		totalCostVsPrincipal: statutoryCost,
		totalCostRatio,
		nominalPerMonth,
		eirPerMonth,
		eirPerDay,
		periodRate,
		cashflows,
		schedule,
		covered,
		coverageReasons,
		eirCap,
		eirCapLabel,
		hits,
		anyOver: hits.some((h) => h.over),
		irrOk
	};
}
var PRESETS = [
	{
		id: "7d",
		label: "7 araw",
		hint: "Isang bayad sa ika-7 araw",
		patch: {
			frequency: "weekly",
			paymentCount: 1,
			firstDueDays: 7,
			followUpDay: 4
		}
	},
	{
		id: "14d",
		label: "14 araw",
		hint: "Isang bayad sa ika-14",
		patch: {
			frequency: "biweekly",
			paymentCount: 1,
			firstDueDays: 14,
			followUpDay: 7
		}
	},
	{
		id: "30d",
		label: "30 araw · 1 bayad",
		hint: "Isang bayad sa dulo ng buwan",
		patch: {
			frequency: "monthly",
			paymentCount: 1,
			firstDueDays: 30,
			followUpDay: null
		}
	},
	{
		id: "4w",
		label: "4 na hulog",
		hint: "Lingguhan, apat na bayad",
		patch: {
			frequency: "weekly",
			paymentCount: 4,
			firstDueDays: 7,
			followUpDay: 4
		}
	}
];
function parseMoney(s) {
	const n = Number(String(s).replace(/,/g, "").trim());
	return Number.isFinite(n) ? n : NaN;
}
function todayISO() {
	const d = /* @__PURE__ */ new Date();
	return (/* @__PURE__ */ new Date(d.getTime() - d.getTimezoneOffset() * 6e4)).toISOString().slice(0, 10);
}
function Calculator() {
	const [preset, setPreset] = (0, import_react.useState)("7d");
	const [principal, setPrincipal] = (0, import_react.useState)("5000");
	const [upfrontFee, setUpfrontFee] = (0, import_react.useState)("0");
	const [payment, setPayment] = (0, import_react.useState)("6500");
	const [paymentCount, setPaymentCount] = (0, import_react.useState)("1");
	const [frequency, setFrequency] = (0, import_react.useState)("weekly");
	const [firstDueDays, setFirstDueDays] = (0, import_react.useState)("7");
	const [penalty, setPenalty] = (0, import_react.useState)("0");
	const [followUp, setFollowUp] = (0, import_react.useState)("4");
	const [useFollowUp, setUseFollowUp] = (0, import_react.useState)(true);
	const [unsecured, setUnsecured] = (0, import_react.useState)(true);
	const [generalPurpose, setGeneralPurpose] = (0, import_react.useState)(true);
	const [lenderKind, setLenderKind] = (0, import_react.useState)("lending_or_financing");
	const [bookedOn, setBookedOn] = (0, import_react.useState)(todayISO());
	const input = (0, import_react.useMemo)(() => ({
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
		followUpDay: useFollowUp && parseMoney(followUp) > 0 ? Math.floor(parseMoney(followUp)) : null
	}), [
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
		useFollowUp
	]);
	const result = (0, import_react.useMemo)(() => analyzeLoan(input), [input]);
	function applyPreset(id) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "lg:sticky lg:top-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Mga numero ng loan mo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Kunin sa disclosure statement, resibo, o app screen — hindi sa advertisement." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							"data-preset": p.id,
							variant: preset === p.id ? "default" : "outline",
							className: "h-auto min-h-11 flex-col items-start gap-0.5 py-2 text-left",
							onClick: () => applyPreset(p.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-[11px] font-normal", preset === p.id ? "text-primary-foreground/80" : "text-muted-foreground"),
								children: p.hint
							})]
						}, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						id: "principal",
						label: "Inutang (principal)",
						hint: "Face amount sa kontrata — hindi ang natanggap kung may binawas.",
						value: principal,
						onChange: setPrincipal
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						id: "fee",
						label: "Processing / service fee na binawas",
						hint: "0 kung buo ang natanggap. Kasama sa EIR.",
						value: upfrontFee,
						onChange: setUpfrontFee
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						id: "payment",
						label: "Hulog bawat bayad",
						hint: "Ang sinusulat sa schedule — isang numero lang kung isang bayad sa dulo.",
						value: payment,
						onChange: setPayment
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
							id: "count",
							label: "Ilang hulog",
							value: paymentCount,
							onChange: setPaymentCount,
							min: 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
							id: "first",
							label: "Unang due (araw)",
							hint: "7 = due sa ika-7 araw",
							value: firstDueDays,
							onChange: setFirstDueDays,
							min: 1
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Dalas ng hulog" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-2",
							children: Object.keys(FREQUENCY_LABEL).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: frequency === f ? "default" : "outline",
								onClick: () => {
									setFrequency(f);
									setPreset(f === "weekly" && paymentCount === "1" && firstDueDays === "7" ? "7d" : preset);
								},
								children: FREQUENCY_LABEL[f]
							}, f))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						id: "penalty",
						label: "Late penalty na siningil (kung meron)",
						hint: "Hindi kasama sa EIR; kasama sa 100% total-cost cap.",
						value: penalty,
						onChange: setPenalty
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 rounded-lg bg-surface-2 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "follow",
								children: "Tala: unang follow-up"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground text-pretty",
								children: "Opsyonal. Ilagay kung kailan unang tumawag o nag-message — hal. araw 4 sa 7-araw na loan. Hindi ito interes at hindi paratang sa sinuman."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								id: "follow-on",
								checked: useFollowUp,
								onCheckedChange: setUseFollowUp
							})]
						}), useFollowUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
							id: "follow",
							label: "Araw ng unang follow-up",
							value: followUp,
							onChange: setFollowUp,
							min: 1
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
								children: "Saklaw ng ceiling"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
								id: "lender",
								label: "Lending / financing company (hindi bangko)",
								checked: lenderKind === "lending_or_financing",
								onCheckedChange: (v) => setLenderKind(v ? "lending_or_financing" : "bank")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
								id: "unsecured",
								label: "Unsecured, general-purpose",
								checked: unsecured && generalPurpose,
								onCheckedChange: (v) => {
									setUnsecured(v);
									setGeneralPurpose(v);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "booked",
										children: "Petsa ng kontrata / renewal"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "booked",
										type: "date",
										value: bookedOn,
										onChange: (e) => setBookedOn(e.target.value),
										className: "h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Simula 1 Abril 2026, EIR cap ng sakop na loan ay 12%/buwan (SEC MC 14). Bago noon, 15% (Circ. 1133 / MC 3)."
									})
								]
							})
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4",
			children: !result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "Maglagay ng principal at hulog para makita ang totoong gastos."
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Verdict, { result }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatGrid, { result }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Kalendaryo ng loan" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
					result.tenorDays,
					"-araw na tenor · ",
					result.schedule.length,
					" hulog"
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoanTimeline, {
					input,
					result
				}) })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Iskedyul" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "overflow-x-auto p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-left text-xs uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-5 py-2 font-medium",
										children: "#"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-5 py-2 font-medium",
										children: "Araw"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-5 py-2 font-medium",
										children: "Bayad"
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-2.5 text-muted-foreground",
									children: "0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-2.5",
									children: "Release"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-2.5 tabular-nums",
									children: formatPeso(result.netProceeds)
								})
							]
						}), result.schedule.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-2.5 tabular-nums",
									children: p.n
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-2.5 tabular-nums",
									children: p.day
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-2.5 tabular-nums",
									children: formatPeso(p.amount)
								})
							]
						}, p.n))] })]
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegalFoot, {})
			] })
		})]
	});
}
function ToggleRow({ id, label, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			className: "text-sm font-normal leading-snug",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id,
			checked,
			onCheckedChange
		})]
	});
}
function Verdict({ result }) {
	const over = result.anyOver;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: cn(over ? "border-danger/40" : result.covered ? "border-primary/30" : ""),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col gap-4 p-5 sm:flex-row sm:items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("flex size-12 shrink-0 items-center justify-center rounded-lg", over ? "bg-danger-soft text-danger" : "bg-ok-soft text-ok"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, {
					className: "size-6",
					strokeWidth: 1.75
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-w-0 flex-1 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [result.covered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: over ? "danger" : "ok",
							children: over ? "Lampas sa naka-publish na ceiling" : "Nasa loob ng naka-publish na ceiling"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "warn",
							children: "Walang percentage ceiling sa box na ito"
						}), result.covered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Sakop · ≤₱10,000 · ≤4 buwan · LC/FC" }) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl leading-snug text-balance",
						children: result.covered ? over ? "Ang EIR o gastos na kinala sa iyong numero ay lampas sa ceiling para sa sakop na small loan." : "Sa mga numerong inilagay mo, hindi lumampas ang sakop na ceiling." : "Walang naka-publish na porsyentong cap para sa loan na lampas ₱10,000, lampas 4 na buwan, o sa bangko."
					}),
					!result.covered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "list-disc space-y-1 pl-4 text-sm text-muted-foreground",
						children: result.coverageReasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, r))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground text-pretty",
						children: "Illustration lang. Ang institusyon ang magbibigay ng opisyal na EIR sa disclosure statement (RA 3765 / BSP Circ. 730). Hindi ito legal advice at hindi tumutukoy sa anumang lender."
					})
				]
			})]
		})
	});
}
function StatGrid({ result }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Natanggap (net proceeds)",
				value: formatPeso(result.netProceeds)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Kabuuang babayaran",
				value: formatPeso(result.totalPayments)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Finance charge (cash out − cash in)",
				value: formatPeso(result.financeCharge)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Gastos vs. principal",
				value: `${formatPeso(result.totalCostVsPrincipal)} · ${formatPct(result.totalCostRatio)}`,
				mark: result.hits.find((h) => h.id === "totalCost")?.over ? "over" : result.covered ? "ok" : "off"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Nominal / buwan",
				value: formatPct(result.nominalPerMonth),
				hint: "Interest sa face amount ÷ tenor sa 30-araw na buwan. Cap kung sakop: 6%/buwan.",
				mark: result.hits.find((h) => h.id === "nominal")?.over ? "over" : result.covered ? "ok" : "off"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "EIR / buwan",
				value: result.irrOk ? formatPct(result.eirPerMonth) : "Hindi makalkula",
				hint: `Discounted cash flow (M-2011-040). ${result.eirCapLabel}. Daily EIR: ${result.irrOk ? formatPct(result.eirPerDay, 3) : "—"}.`,
				mark: result.hits.find((h) => h.id === "eir")?.over ? "over" : result.covered ? "ok" : "off"
			})
		]
	});
}
function Stat({ label, value, hint, mark = "off" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
						children: label
					}),
					mark === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "danger",
						children: "Lampas"
					}) : null,
					mark === "ok" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "ok",
						children: "OK"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl tabular-nums tracking-tight",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-relaxed text-muted-foreground text-pretty",
				children: hint
			}) : null
		]
	});
}
function LegalFoot() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
		className: "flex items-center gap-2 text-base",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
			className: "size-4",
			strokeWidth: 1.75
		}), "Batayan"]
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "grid gap-3 text-sm leading-relaxed text-muted-foreground text-pretty",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: "RA No. 3765"
			}), " (Truth in Lending Act) — written disclosure of finance charges at total cost bago ang transaksyon."] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-foreground",
					children: "BSP Circular No. 1133, s. 2021"
				}),
				" at",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-foreground",
					children: "SEC MC No. 3, s. 2022"
				}),
				" — para sa unsecured general-purpose loans ng lending/financing companies at OLP, ≤₱10,000, tenor ≤4 buwan: nominal 6%/buwan, EIR 15%/buwan, late penalty 5%/buwan, total cost 100% ng inutang. Hindi sakop ang bangko."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: "SEC MC No. 14, s. 2025"
			}), " — parehong box; EIR cap 12%/buwan para sa loan na entered/restructured/renewed simula 1 Abril 2026."] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: "BSP Memorandum M-2011-040"
			}), " / Circ. 730 — EIR = rate na nagdi-discount ng future cash flows sa net proceeds (nominal + processing / service / handling / verification fees; hindi late penalty)."] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: "CB Circular No. 905, s. 1982"
			}), " — suspended ang Usury Law ceilings. Labas sa small-loan box, walang published percentage cap; nananatili ang disclosure at ang husgado kung unconscionable."] })
		]
	})] });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-background px-4 py-8 sm:px-6 sm:py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mx-auto mb-8 max-w-6xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
					children: "Philippines · RA 3765 · Circ. 1133 · SEC MC 3 / MC 14"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl",
					children: "Tunay na Interes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty",
					children: "Ilagay ang inutang, ang hulog, at ilang beses magbabayad. Kasama ang 7-araw na loan. Ang tool ay nagkukuwenta ng effective interest (EIR) at tinitingnan kung sakop ka ng naka-publish na ceiling — hindi nagnangalan ng lender, hindi nagpapayo kung paano magbayad."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, {})]
	});
}
//#endregion
export { Home as component };
