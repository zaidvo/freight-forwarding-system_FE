// src/shared/lib/useUnsavedChanges.ts
//
// Global dirty-state registry.
//
// Any page that holds unsaved form data registers itself here.  The workspace
// switcher reads `isDirty` before navigating so it can prompt the user.
//
// Usage in a page/form component:
//
//   const { markDirty, markClean } = useUnsavedChanges();
//
//   // When the user edits any field:
//   markDirty();
//
//   // After a successful save or on unmount:
//   useEffect(() => markClean, [markClean]);
//
// The store is intentionally NOT persisted to localStorage — it reflects
// transient in-session form state only.

import { create } from "zustand";

interface UnsavedChangesState {
  isDirty: boolean;
  markDirty: () => void;
  markClean: () => void;
}

export const useUnsavedChanges = create<UnsavedChangesState>((set) => ({
  isDirty: false,
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
}));
