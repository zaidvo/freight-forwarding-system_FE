import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { User } from "../types";

type DeleteUserDialogProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (userId: number) => Promise<void>;
};

export default function DeleteUserDialog({
  open,
  user,
  onClose,
  onConfirm,
}: DeleteUserDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog
      open={open && Boolean(user)}
      onClose={onClose}
      panelClassName="max-w-[560px]"
    >
      {user && (
        <div>
          <div className="border-b border-slate-200 px-6 py-5 pr-14">
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-rose-600">
              Delete user
            </div>
            <h2 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-900">
              {user.full_name}
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              This will remove the user from FreightOS. Their audit history is
              retained.
            </p>
          </div>

          <div className="px-6 py-5 text-[14px] text-slate-600">
            <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
              Deleting this user deactivates their account immediately.
            </div>
            {error && (
              <div className="mt-3 rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              disabled={deleting}
              onClick={async () => {
                if (!user) return;
                setError(null);
                setDeleting(true);
                try {
                  await onConfirm(user.id);
                  onClose();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Unable to delete user.",
                  );
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete user"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
