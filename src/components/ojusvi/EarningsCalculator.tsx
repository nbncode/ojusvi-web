import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import logoAsset from "@/assets/ojusvi-logo-round-256.webp";

const logoRound = logoAsset;

type ModelKey = "A" | "B" | "C";

const SLABS: Record<ModelKey, { fee: number; mg: number; label: string }> = {
  A: { fee: 0.1, mg: 0, label: "Higher fee share, no safety net" },
  B: { fee: 0.07, mg: 7000, label: "Balanced share with a floor" },
  C: { fee: 0.03, mg: 21000, label: "Lower share, strongest floor" },
};

const TDS_RATE = 0.1;

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(n || 0),
  );

export default function EarningsCalculator() {
  const [totalUsers, setTotalUsers] = useState(150000);
  const [yourUsers, setYourUsers] = useState(24000);
  const [feePerUser, setFeePerUser] = useState(115);
  const [model, setModel] = useState<ModelKey>("B");

  const over = yourUsers > totalUsers;
  const effYour = Math.min(yourUsers, totalUsers);

  const poolShare = feePerUser * effYour;

  const compute = (m: ModelKey) => {
    const { fee, mg } = SLABS[m];
    const revenueShare = poolShare * fee;
    const gross = Math.max(revenueShare, mg);
    const tds = gross * TDS_RATE;
    return { fee, mg, revenueShare, gross, tds, takeHome: gross - tds };
  };

  const r = useMemo(() => compute(model), [model, poolShare]);
  const mgBinds = r.mg > r.revenueShare;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        <header className="mb-8 flex items-start gap-4">
          <img
            src={logoRound}
            alt="Ojusvi logo"
            width={80}
            height={80}
            decoding="async"
            className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-full"
          />
          <div>
            <div className="text-sm font-medium tracking-wide text-primary">
              ओजस्वी · Ojusvi
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-semibold leading-tight tracking-tight">
              Instructor earnings calculator
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Estimate your tentative monthly take-home. Change the inputs and
              pick a model — the figures update as you go.
            </p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-5">
          {/* Inputs */}
          <section className="lg:col-span-2 rounded-2xl bg-card text-card-foreground p-6 shadow-sm ring-1 ring-border">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Your inputs
            </h2>

            <div className="grid gap-4">
              <Field
                id="total"
                label="Total active users on Ojusvi"
                value={totalUsers}
                onChange={setTotalUsers}
                min={0}
                step={1000}
              />
              <Field
                id="yours"
                label="Your active users"
                value={yourUsers}
                onChange={setYourUsers}
                min={0}
                step={500}
                warn={over}
              />
              <Field
                id="fee"
                label="Fee per active user (₹)"
                value={feePerUser}
                onChange={setFeePerUser}
                min={0}
                step={5}
                prefix="₹"
                info="Fee per active user is equal to Gross fees collected from users in the month (incl. monthly portion of annual plans) less GST, payment-gateway / processing charges, refunds / chargebacks, less promotional discounts / coupons / credits."
              />

            </div>

            {over && (
              <p className="mt-3 text-sm font-medium text-destructive">
                Your active users can't exceed the platform total — we've
                capped your share at 100%.
              </p>
            )}

          </section>

          {/* Result */}
          <section className="order-2 lg:order-none lg:col-span-3 rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              Your estimate · Model {model}
            </h2>
            <div className="mt-3 text-5xl font-semibold text-primary-foreground">
              ₹{inr(r.takeHome)}
            </div>
            <div className="mt-1 text-sm text-primary-foreground/70">
              estimated take-home / month
            </div>

            <dl className="mt-6 space-y-2.5 text-sm">
              <Row k="Revenue share" v={`₹${inr(r.revenueShare)}`} />
              <Row
                k="Minimum guarantee"
                v={r.mg ? `₹${inr(r.mg)}` : "—"}
              />
              <Row
                k="Gross payout"
                v={`₹${inr(r.gross)}`}
                hint={mgBinds ? "guarantee applies" : "revenue share applies"}
                strong
              />
              <Row
                k={`Less TDS (${(TDS_RATE * 100).toFixed(0)}%)`}
                v={`− ₹${inr(r.tds)}`}
              />
            </dl>
          </section>

          {/* Model cards */}
          <section className="order-1 lg:order-none lg:col-span-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Choose your model
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(Object.keys(SLABS) as ModelKey[]).map((m) => {
              const c = compute(m);
              const active = m === model;
              return (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  aria-pressed={active}
                  className={[
                    "group rounded-2xl p-5 text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "bg-accent text-accent-foreground ring-2 ring-ring shadow-sm"
                      : "bg-card text-card-foreground ring-1 ring-border hover:ring-foreground/30",
                  ].join(" ")}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-semibold">Model {m}</span>
                    <span
                      className={[
                        "text-xs font-semibold",
                        active ? "text-primary" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {active ? "Selected" : "Tap to select"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {SLABS[m].label}
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {(c.fee * 100).toFixed(0)}% fee share ·{" "}
                    {c.mg ? `₹${inr(c.mg)} min/month` : "no guarantee"}
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-primary">
                    ₹{inr(c.takeHome)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      take-home
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

        <details className="mt-6 rounded-xl bg-card text-card-foreground p-5 text-sm text-muted-foreground ring-1 ring-border">
          <summary className="cursor-pointer font-medium text-foreground">
            How this is calculated & assumptions
          </summary>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              Revenue share = fee per active user × your active users × your
              model's fee share %.
            </li>
            <li>
              Models B and C pay the higher of your revenue share or the
              minimum guarantee. Model A has no guarantee.
            </li>
            <li>
              The minimum guarantee assumes you deliver the full monthly quota
              of 25 videos; it is prorated if you deliver fewer.
            </li>
            <li>
              "Active user" means a viewer who completes a session, as defined
              in your Agreement.
            </li>
            <li>
              TDS is shown at 10% for illustration; the actual deduction
              follows applicable tax law. Guarantee amounts are gross
              (inclusive of taxes).
            </li>
            <li>
              These are indicative estimates only, not a guarantee of earnings
              — net fee and user counts vary each month.
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  min,
  step,
  prefix,
  warn,
  info,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  warn?: boolean;
  info?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        {info && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="More info"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                <p>{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div
        className={[
          "mt-1 flex items-center rounded-xl bg-background ring-1 transition-colors focus-within:ring-2 focus-within:ring-ring",
          warn ? "ring-destructive" : "ring-border",
        ].join(" ")}
      >
        {prefix && <span className="pl-3 text-muted-foreground">{prefix}</span>}
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full border-0 bg-transparent px-3 py-2.5 text-lg font-semibold tabular-nums shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  hint,
  strong,
}: {
  k: string;
  v: string;
  hint?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-2 last:border-0">
      <dt className="text-primary-foreground/75">
        {k}
        {hint && (
          <span className="ml-2 text-xs text-primary-foreground/45">
            {hint}
          </span>
        )}
      </dt>
      <dd
        className={[
          "tabular-nums",
          strong
            ? "font-semibold text-primary-foreground"
            : "text-primary-foreground/90",
        ].join(" ")}
      >
        {v}
      </dd>
    </div>
  );
}
