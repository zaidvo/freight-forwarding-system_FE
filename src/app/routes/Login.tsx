// src/routes/Login.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Ship } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { useAuth } from "@/app/providers/AuthProvider";

type LocationState = { from?: { pathname: string } };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef3f8] px-4 py-8 text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.18),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(15,23,42,0.10),transparent_34%)]" />

      <section className="relative w-full max-w-[440px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
            <Ship className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.045em] text-slate-950">
            FreightOS
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your operations workspace.
          </p>
        </div>

        <div className="rounded-[24px] border border-white bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your work email and password to continue.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-[14px] border-slate-200 bg-slate-50 pl-10 shadow-none transition focus:bg-white"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-[14px] border-slate-200 bg-slate-50 pl-10 pr-11 shadow-none transition focus:bg-white"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full gap-2 rounded-[14px] border-0 bg-slate-950 text-white shadow-[0_16px_30px_rgba(15,23,42,0.22)] transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-80"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}