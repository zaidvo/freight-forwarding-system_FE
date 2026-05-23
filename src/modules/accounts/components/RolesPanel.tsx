import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { MODULE_ACCESS_OPTIONS } from "../data/permissions";
import type { Group, ModuleKey } from "../types";

type RolesPanelProps = {
  groups: Group[];
  membersByGroup: Record<string, number>;
  onAddGroup: (name: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onToggleModule: (groupId: string, module: ModuleKey) => void;
  onDeleteGroup: (groupId: string) => void;
};

export default function RolesPanel({
  groups,
  membersByGroup,
  onAddGroup,
  onRenameGroup,
  onToggleModule,
  onDeleteGroup,
}: RolesPanelProps) {
  const [draftName, setDraftName] = useState("");

  const createDisabled = draftName.trim().length === 0;
  const moduleLookup = useMemo(
    () => new Map(MODULE_ACCESS_OPTIONS.map((option) => [option.key, option])),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Create group
            </div>
            <Input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Enter a new group name"
              className="mt-2"
            />
          </div>
          <Button
            onClick={() => {
              onAddGroup(draftName.trim());
              setDraftName("");
            }}
            disabled={createDisabled}
          >
            Create group
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Group name
                </div>
                <Input
                  value={group.name}
                  onChange={(event) =>
                    onRenameGroup(group.id, event.target.value)
                  }
                  className="mt-2"
                />
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-600">
                {membersByGroup[group.id] ?? 0} members
              </div>
            </div>

            <p className="mt-3 text-[13px] leading-6 text-slate-500">
              {group.description}
            </p>

            <div className="mt-4 space-y-3 rounded-[16px] bg-slate-50 p-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Module access
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODULE_ACCESS_OPTIONS.map((option) => {
                  const active = group.modules.includes(option.key);
                  return (
                    <label
                      key={option.key}
                      className="flex items-start gap-3 rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-[0_4px_14px_rgba(22,31,54,0.03)]"
                    >
                      <Checkbox
                        checked={active}
                        onChange={() => onToggleModule(group.id, option.key)}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="text-[13px] font-semibold text-slate-900">
                          {option.label}
                        </div>
                        <div className="mt-1 text-[12px] leading-5 text-slate-400">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {group.modules.map((moduleKey) => {
                  const module = moduleLookup.get(moduleKey);
                  return (
                    <span
                      key={moduleKey}
                      className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
                    >
                      {module?.label ?? moduleKey}
                    </span>
                  );
                })}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDeleteGroup(group.id)}
              >
                Delete group
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
