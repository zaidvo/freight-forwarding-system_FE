import { useCallback, useState } from "react";
import type { User, UserInput } from "../types";
import { SEED_USERS } from "../data/seed";

export function useUsers() {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const add = useCallback(
    (u: UserInput) =>
      setUsers((prev) => [
        ...prev,
        {
          ...u,
          id: crypto.randomUUID(),
          avatar: u.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
          lastActive: "Just invited",
        },
      ]),
    [],
  );
  const update = useCallback(
    (id: string, patch: Partial<User>) =>
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
      ),
    [],
  );
  const remove = useCallback(
    (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id)),
    [],
  );
  const updateGroups = useCallback(
    (id: string, groups: string[]) =>
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, groups } : u))),
    [],
  );
  return { users, add, update, remove, updateGroups };
}
