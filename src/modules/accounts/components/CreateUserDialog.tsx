import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { Group, UserInput, UserStatus } from "../types";

type CreateUserDialogProps = {
  open: boolean;
  groups: Group[];
  departments: string[];
  onClose: () => void;
  onCreate: (values: UserInput) => void;
};

const emptyDraft: UserInput = {
  name: "",
  email: "",
  department: "Operations",
  role: "Team Member",
  status: "pending",
  groups: [],
};

export default function CreateUserDialog({
  open,
  groups,
  departments,
  onClose,
  onCreate,
}: CreateUserDialogProps) {
  const [draft, setDraft] = useState<UserInput>(emptyDraft);

  useEffect(() => {
    if (open) {
      setDraft(emptyDraft);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} panelClassName="max-w-[760px]">
      <div className="border-b border-slate-200 px-6 py-5 pr-14">
        <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-600">
          Invite user
        </div>
        <h2 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-900">
          New team member
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Invite a FreightOS user and optionally assign access groups.
        </p>
      </div>

      <form
        className="grid gap-4 px-6 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(draft);
          onClose();
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="create-name">Full name</Label>
            <Input
              id="create-name"
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              value={draft.email}
              onChange={(event) =>
                setDraft({ ...draft, email: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-department">Department</Label>
            <Select
              id="create-department"
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
            <Label htmlFor="create-role">Job role</Label>
            <Input
              id="create-role"
              value={draft.role}
              onChange={(event) =>
                setDraft({ ...draft, role: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-status">Status</Label>
            <Select
              id="create-status"
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as UserStatus })
              }
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Initial groups
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {groups.map((group) => {
              const selected = draft.groups.includes(group.id);
              return (
                <label
                  key={group.id}
                  className="flex items-start gap-3 rounded-[14px] border border-slate-200 bg-white p-3"
                >
                  <Checkbox
                    checked={selected}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        groups: selected
                          ? draft.groups.filter(
                              (groupId) => groupId !== group.id,
                            )
                          : [...draft.groups, group.id],
                      })
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
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">Send invite</Button>
        </div>
      </form>
    </Dialog>
  );
}
