import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { Dialog } from "@/shared/components/ui/Dialog";
import type { Group, User } from "../types";

type PermissionsDialogProps = {
  open: boolean;
  user: User | null;
  groups: Group[];
  onClose: () => void;
  onSave: (userId: number, groupIds: number[]) => Promise<void>;
};

export default function PermissionsDialog({
  open,
  user,
  groups,
  onClose,
  onSave,
}: PermissionsDialogProps) {
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setSelectedGroups(user.groups);
      setError(null);
      setSaving(false);
    }
  }, [open, user]);

  const selectedGroupNames = useMemo(
    () =>
      groups
        .filter((group) => selectedGroups.includes(group.id))
        .map((group) => group.name),
    [groups, selectedGroups],
  );

  return (
    <Dialog
      open={open && Boolean(user)}
      onClose={onClose}
      panelClassName="max-w-[720px]"
    >
      {user && (
        <div>
          <div className="border-b border-slate-200 px-6 py-5 pr-14">
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-600">
              Groups access
            </div>
            <h2 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-900">
              {user.full_name}
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Check the groups this user belongs to. Their module access is
              merged automatically.
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="grid gap-3">
              {groups.map((group) => {
                const checked = selectedGroups.includes(group.id);
                return (
                  <label
                    key={group.id}
                    className="flex items-start gap-3 rounded-[14px] border border-slate-200 bg-slate-50 p-3"
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() =>
                        setSelectedGroups((current) =>
                          checked
                            ? current.filter((groupId) => groupId !== group.id)
                            : [...current, group.id],
                        )
                      }
                    />
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">
                        {group.name}
                      </div>
                      <div className="mt-1 text-[12px] text-slate-400">
                        {group.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedGroupNames.length > 0 && (
              <div className="mt-4 rounded-[16px] bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
                Selected groups: {selectedGroupNames.join(", ")}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={async () => {
                if (!user) return;
                setSaving(true);
                setError(null);
                try {
                  await onSave(user.id, selectedGroups);
                  onClose();
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Unable to save groups.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving..." : "Save groups"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
