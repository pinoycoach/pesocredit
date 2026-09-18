import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MoneyField({
  id,
  label,
  hint,
  value,
  onChange,
  prefix = "₱",
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-xs text-muted-foreground text-pretty">{hint}</p> : null}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
          {prefix}
        </span>
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          className="pl-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  min,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-xs text-muted-foreground text-pretty">{hint}</p> : null}
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
