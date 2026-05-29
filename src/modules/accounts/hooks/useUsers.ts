import { useCallback, useState } from "react";
import type { User } from "../types";

export function useUsers(initialUsers: User[] = []) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const update = useCallback(
    (id: number, patch: Partial<User>) =>
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ...patch } : user)),
      ),
    [],
  );
  const remove = useCallback(
    (id: number) =>
      setUsers((prev) => prev.filter((user) => user.id !== id)),
    [],
  );
  const updateGroups = useCallback(
    (id: number, groups: number[]) =>
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, groups } : user)),
      ),
    [],
  );
  return { users, setUsers, update, remove, updateGroups };
}
