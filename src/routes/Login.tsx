import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Ship,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { SEED_USERS } from "@/modules/accounts/data/seed";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex@freightos.com");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const user = SEED_USERS.find(
        (entry) => entry.email.toLowerCase() === email.trim().toLowerCase(),
      );

      if (!user) {
        setLoading(false);
        setError("No account was found for this email.");
        return;
      }

      if (user.status !== "active") {
        setLoading(false);
        setError(
          "This account is inactive. Contact an administrator to regain access.",
        );
        return;
      }

      navigate("/");
    }, 600);
  };

  const onResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(false);
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const user = SEED_USERS.find(
        (entry) => entry.email.toLowerCase() === email.trim().toLowerCase(),
      );

      if (!user) {
        setLoading(false);
        setError("No account was found for this email.");
        return;
      }

      setLoading(false);
      setResetSent(true);
    }, 700);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#3b82f6]/28 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 h-[560px] w-[560px] rounded-full bg-[#06b6d4]/28 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/3 h-[480px] w-[480px] rounded-full bg-[#10b981]/20 blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-background)_82%)]" />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.18]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-foreground/20"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-8 lg:px-8">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-[12px] font-semibold text-slate-600 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-sky-500" />
              FreightERP access portal
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-bold tracking-[-0.05em] text-slate-900">
              A calm, secure way to enter your logistics workspace.
            </h1>
            <p className="mt-4 max-w-lg text-[16px] leading-7 text-slate-600">
              Sign in to manage operations, finance, sales, and marketing from a
              single FreightERP control surface built for fast daily work.
            </p>

            <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
              {[
                ["Fast access", "One-screen entry to the dashboard"],
                ["Role aware", "Inactive users stay blocked"],
                ["Theme matched", "Blue, cyan, and emerald system palette"],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[20px] border border-white/70 bg-white/70 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl"
                >
                  <div className="text-[13px] font-semibold text-slate-900">
                    {title}
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-slate-500">
                    {copy}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-[13px] text-slate-500">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-white/70">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  Protected workspace access
                </div>
                <div>Inactive accounts cannot sign in.</div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-sky-500 to-cyan-400 shadow-[0_12px_30px_rgba(56,189,248,0.3)]">
                <Ship className="h-6 w-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                  Welcome to FreightOS
                </h1>
                <p className="text-sm text-slate-500">
                  Sign in to your global logistics dashboard.
                </p>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-start gap-4 pb-5 text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-500 to-cyan-400 shadow-[0_14px_34px_rgba(56,189,248,0.32)] ring-1 ring-white/50">
                <Ship className="h-7 w-7 text-white" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                  Welcome to FreightOS
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Sign in to your global logistics dashboard.
                </p>
              </div>
            </div>

            <div className="relative rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-7">
              <div className="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-white/85 via-white/55 to-cyan-50/80" />
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />

              {!resetMode ? (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Work email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-[14px] border-slate-200 bg-white/85 pl-9 shadow-inner shadow-slate-100"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setResetMode(true)}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                      >
                        Reset password
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 rounded-[14px] border-slate-200 bg-white/85 pl-9 pr-10 shadow-inner shadow-slate-100"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
                      <Checkbox id="remember" defaultChecked />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full gap-2 rounded-[16px] border-0 text-white shadow-[0_16px_30px_rgba(37,99,235,0.28)]"
                    style={{
                      background:
                        "linear-gradient(135deg, #0ea5e9 0%, #14b8a6 55%, #2563eb 100%)",
                    }}
                  >
                    {loading ? "Signing in…" : "Sign in"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </Button>

                  <div className="flex items-center justify-center gap-2 pt-1 text-[12px] text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Secure sign in for active accounts only.
                  </div>
                </form>
              ) : (
                <form onSubmit={onResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sky-600">
                          Reset password
                        </div>
                        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
                          Recover access
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResetMode(false);
                          setResetSent(false);
                          setError(null);
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      >
                        Back to sign in
                      </button>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">
                      Enter your work email and we’ll prepare a reset link for
                      your account.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email">Work email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-[14px] border-slate-200 bg-white/85 pl-9 shadow-inner shadow-slate-100"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                      {error}
                    </div>
                  )}

                  {resetSent && (
                    <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
                      Reset link prepared for {email}. Check your inbox to
                      continue.
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full gap-2 rounded-[16px] border-0 text-white shadow-[0_16px_30px_rgba(37,99,235,0.28)]"
                    style={{
                      background:
                        "linear-gradient(135deg, #0ea5e9 0%, #14b8a6 55%, #2563eb 100%)",
                    }}
                  >
                    {loading ? "Preparing reset…" : "Send reset link"}
                    {!loading && <RefreshCw className="h-4 w-4" />}
                  </Button>
                </form>
              )}
            </div>

            <div className="mt-6 rounded-[22px] border border-white/60 bg-white/70 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-[13px] text-slate-500">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Active FreightERP workspace
                  </div>
                  <div>Only active users can access the dashboard.</div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-sky-600 hover:underline"
              >
                Request access
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
