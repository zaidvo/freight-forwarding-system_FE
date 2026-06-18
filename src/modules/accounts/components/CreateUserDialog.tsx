import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Eye, EyeOff } from "lucide-react";
import type { UserInput } from "../types";

type CreateUserDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (values: UserInput) => Promise<void>;
};

const emptyDraft: UserInput = {
  full_name: "",
  email: "",
  password: "",
  groups: [],
};

export default function CreateUserDialog({
  open,
  onClose,
  onCreate,
}: CreateUserDialogProps) {
  const [draft, setDraft] = useState<UserInput>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form state every time the create dialog is opened.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(emptyDraft);
      setError(null);
      setSaving(false);
      setShowPassword(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} panelClassName="max-w-[760px]">
      <div className="border-b border-slate-200 px-6 py-5 pr-14">
        <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-600">
          Add user
        </div>
        <h2 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-900">
          New user
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Add a FreightOS user using the backend user fields.
        </p>
      </div>

      <form
        autoComplete="off"
        className="grid gap-4 px-6 py-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setSaving(true);
          try {
            await onCreate(draft);
            onClose();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Unable to create user.",
            );
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="create-name">Full name</Label>
            <Input
              id="create-name"
              required
              value={draft.full_name}
              onChange={(event) =>
                setDraft({ ...draft, full_name: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              required
              value={draft.email}
              onChange={(event) =>
                setDraft({ ...draft, email: event.target.value })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="create-password">Password</Label>
            <div className="relative">
              <Input
                id="create-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                name="account-create-password"
                required
                minLength={8}
                maxLength={128}
                value={draft.password ?? ""}
                onChange={(event) =>
                  setDraft({ ...draft, password: event.target.value })
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create user"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
