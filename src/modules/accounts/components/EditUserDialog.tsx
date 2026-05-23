import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { User, UserInput, UserStatus } from "../types";

type EditUserDialogProps = {
  open: boolean;
  user: User | null;
  departments: string[];
  onClose: () => void;
  onSave: (userId: string, values: UserInput) => void;
};

export default function EditUserDialog({
  open,
  user,
  departments,
  onClose,
  onSave,
}: EditUserDialogProps) {
  const [draft, setDraft] = useState<UserInput | null>(null);

  useEffect(() => {
    if (open && user) {
      setDraft({
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        status: user.status,
        groups: user.groups,
      });
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
          onSubmit={(event) => {
            event.preventDefault();
            onSave(user.id, draft);
            onClose();
          }}
        >
          <div className="border-b border-slate-200 px-6 py-5 pr-14">
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-600">
              Edit user
            </div>
            <h2 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-900">
              {user.name}
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Update the basic profile details for this team member.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full name</Label>
              <Input
                id="edit-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={draft.email}
                onChange={(event) =>
                  setDraft({ ...draft, email: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select
                id="edit-department"
                value={draft.department}
                onChange={(event) =>
                  setDraft({ ...draft, department: event.target.value })
                }
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Job role</Label>
              <Input
                id="edit-role"
                value={draft.role}
                onChange={(event) =>
                  setDraft({ ...draft, role: event.target.value })
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
                <option value="pending">Pending</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
