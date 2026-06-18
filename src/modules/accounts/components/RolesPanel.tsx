import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import type { AppModule, Group } from "../types";

type RolesPanelProps = {
  groups: Group[];
  modules: AppModule[];
  membersByGroup: Record<number, number>;
  onAddGroup: (name: string) => Promise<void>;
  onRenameGroup: (groupId: number, name: string) => Promise<void>;
  onToggleModule: (groupId: number, moduleId: number) => Promise<void>;
  onDeleteGroup: (groupId: number) => Promise<void>;
};

export default function RolesPanel({
  groups,
  modules,
  membersByGroup,
  onAddGroup,
  onRenameGroup,
  onToggleModule,
  onDeleteGroup,
}: RolesPanelProps) {
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDisabled = draftName.trim().length === 0 || saving;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
        <div className="flex flex-col gap-4">
          <div>
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
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                setSaving(true);
                setError(null);
                try {
                  await onAddGroup(draftName.trim());
                  setDraftName("");
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Unable to create group.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              disabled={createDisabled}
            >
              {saving ? "Creating..." : "Create group"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.length ? (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              modules={modules}
              members={membersByGroup[group.id] ?? 0}
              onRenameGroup={onRenameGroup}
              onToggleModule={onToggleModule}
              onDeleteGroup={onDeleteGroup}
              onError={setError}
            />
          ))
        ) : (
          <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-[0_8px_24px_rgba(22,31,54,0.05)] xl:col-span-2">
            No groups found.
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  modules,
  members,
  onRenameGroup,
  onToggleModule,
  onDeleteGroup,
  onError,
}: {
  group: Group;
  modules: AppModule[];
  members: number;
  onRenameGroup: (groupId: number, name: string) => Promise<void>;
  onToggleModule: (groupId: number, moduleId: number) => Promise<void>;
  onDeleteGroup: (groupId: number) => Promise<void>;
  onError: (error: string | null) => void;
}) {
  const [name, setName] = useState(group.name);
  const [savingModules, setSavingModules] = useState(false);

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Group name
          </div>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={async () => {
              if (name.trim() === group.name) return;
              try {
                await onRenameGroup(group.id, name.trim());
              } catch (err) {
                onError(err instanceof Error ? err.message : "Unable to rename group.");
                setName(group.name);
              }
            }}
            className="mt-2"
          />
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-600">
          {members} members
        </div>
      </div>

      {group.description && (
        <p className="mt-3 text-[13px] leading-6 text-slate-500">
          {group.description}
        </p>
      )}

      <div className="mt-4 space-y-3 rounded-[16px] bg-slate-50 p-4">
        <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Module access
        </div>
        <ModulePicker
          modules={modules}
          selectedIds={group.modules}
          disabled={savingModules}
          onToggle={async (moduleId) => {
            setSavingModules(true);
            try {
              await onToggleModule(group.id, moduleId);
            } catch (err) {
              onError(
                err instanceof Error ? err.message : "Unable to update modules.",
              );
            } finally {
              setSavingModules(false);
            }
          }}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={async () => {
            try {
              await onDeleteGroup(group.id);
            } catch (err) {
              onError(err instanceof Error ? err.message : "Unable to delete group.");
            }
          }}
        >
          Delete group
        </Button>
      </div>
    </div>
  );
}

function ModulePicker({
  modules,
  selectedIds,
  disabled,
  onToggle,
}: {
  modules: AppModule[];
  selectedIds: number[];
  disabled: boolean;
  onToggle: (moduleId: number) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {modules.map((module) => {
        const active = selectedIds.includes(module.id);
        return (
          <label
            key={module.id}
            className="flex items-start gap-3 rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-[0_4px_14px_rgba(22,31,54,0.03)]"
          >
            <Checkbox
              checked={active}
              disabled={disabled}
              onChange={() => onToggle(module.id)}
              className="mt-0.5"
            />
            <div>
              <div className="text-[13px] font-semibold text-slate-900">
                {module.name}
              </div>
              <div className="mt-1 text-[12px] leading-5 text-slate-400">
                {module.isActive ? "Active module" : "Coming soon"}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
