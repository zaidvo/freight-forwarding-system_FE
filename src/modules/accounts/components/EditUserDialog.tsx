import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Dialog } from "@/shared/components/ui/Dialog";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Select } from "@/shared/components/ui/Select";
import { Eye, EyeOff } from "lucide-react";
import type { User, UserInput, UserStatus } from "../types";

type EditUserDialogProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: number, values: UserInput) => Promise<void>;
};

export default function EditUserDialog({
  open,
  user,
  onClose,
  onSave,
}: EditUserDialogProps) {
  const [draft, setDraft] = useState<UserInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open && user) {
      setDraft({
        full_name: user.full_name,
        email: user.email,
        password: "",
        status: user.status,
        groups: user.groups,
      });
      setError(null);
      setSaving(false);
      setShowPassword(false);
    }
  }, [open, user]);

  return (
    <Dialog
      open={open && Boolean(user && draft)}
      onClose={onClose}
      panelClassName="max-w-[700px]"
    >
      {user && draft && (
        <form
          autoComplete="off"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            setSaving(true);
            try {
              await onSave(user.id, draft);
              onClose();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Unable to update user.",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="border-b border-slate-200 px-6 py-5 pr-14">
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-600">
              Edit user
            </div>
            <h2 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-900">
              {user.full_name}
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Update the basic profile details for this user.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full name</Label>
              <Input
                id="edit-name"
                required
                value={draft.full_name}
                onChange={(event) =>
                  setDraft({ ...draft, full_name: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={draft.email}
                onChange={(event) =>
                  setDraft({ ...draft, email: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                id="edit-status"
                value={draft.status}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    status: event.target.value as UserStatus,
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  name="account-edit-password"
                  minLength={8}
                  maxLength={128}
                  value={draft.password ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, password: event.target.value })
                  }
                  className="pr-10"
                  placeholder="Leave blank to keep current password"
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
            <div className="mx-6 mb-5 rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
