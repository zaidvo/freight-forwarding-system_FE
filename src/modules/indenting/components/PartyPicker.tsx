// src/modules/indenting/components/PartyPicker.tsx

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Check, Building2, User, Loader2 } from "lucide-react";
import { indentingService } from "../services/indentingService";
import type { IndentingParty, IndentingPartySuggest } from "../types";
import { PartyFormDialog } from "./PartyFormDialog";

type PartyPickerProps = {
  label: string;
  value: number | null;
  selectedParty?: IndentingParty | IndentingPartySuggest | null;
  onChange: (partyId: number, party: IndentingPartySuggest | IndentingParty) => void;
  excludePartyId?: number | null;
  required?: boolean;
  disabled?: boolean;
};

export function PartyPicker({
  label,
  value,
  selectedParty,
  onChange,
  excludePartyId,
  required = false,
  disabled = false,
}: PartyPickerProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<IndentingPartySuggest[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const margin = 8;
      const gap = 4;
      const below = window.innerHeight - rect.bottom - gap;
      const above = rect.top - gap;
      const placeAbove = menuRect.height > below && above > below;
      const top = placeAbove
        ? Math.max(margin, rect.top - Math.min(menuRect.height, above) - gap)
        : Math.max(margin, Math.min(rect.bottom + gap, window.innerHeight - menuRect.height - margin));
      const width = Math.min(rect.width, window.innerWidth - margin * 2);
      const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
      setMenuPosition({ top, left, width });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, loading, suggestions.length]);

  // Fetch suggestions when query changes or dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const results = await indentingService.suggestParties(query);
        if (active) {
          // Filter out excluded party if any
          const filtered = excludePartyId
            ? results.filter((p) => p.id !== excludePartyId)
            : results;
          setSuggestions(filtered);
        }
      } catch (err) {
        console.error("Failed to suggest parties:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, isOpen, excludePartyId]);

  const handleSelect = (party: IndentingPartySuggest) => {
    onChange(party.id, party);
    setIsOpen(false);
    setQuery("");
  };

  const handleCreated = (newParty: IndentingParty) => {
    onChange(newParty.id, newParty);
    setIsAddPartyOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={() => setIsAddPartyOpen(true)}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> New Party
          </button>
        )}
      </div>

      {selectedParty && value ? (
        <div ref={(node) => { triggerRef.current = node; }} className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50/80 rounded-lg text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-slate-800 truncate">
                {selectedParty.name}
              </div>
              <div className="text-xs text-slate-500 truncate flex items-center gap-2">
                <span className="font-mono text-slate-600">{selectedParty.code}</span>
                {selectedParty.contact_person && (
                  <span>• {selectedParty.contact_person}</span>
                )}
                {selectedParty.phone && <span>• {selectedParty.phone}</span>}
              </div>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(true)}
              className="text-xs font-medium text-slate-500 hover:text-amber-600 px-2 py-1 hover:bg-white rounded transition-colors"
            >
              Change
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          ref={(node) => { triggerRef.current = node; }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg text-sm flex items-center justify-between cursor-pointer text-left transition-colors ${
            disabled
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : isOpen
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-white"
              : "border-slate-200 hover:border-slate-300 bg-white text-slate-500"
          }`}
        >
          <span>Select {label.toLowerCase()}...</span>
          <Search className="w-4 h-4 text-slate-400" />
        </button>
      )}

      {/* Dropdown Popover */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left, width: menuPosition.width || undefined, zIndex: "var(--z-dropdown)", visibility: menuPosition.top === 0 ? "hidden" : "visible" }}
          className="max-h-[calc(100dvh-16px)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search party by name, code, contact..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-50">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                Loading parties...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-500 mb-2">No parties found</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsAddPartyOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Create &ldquo;{query || "New Party"}&rdquo;
                </button>
              </div>
            ) : (
              suggestions.map((party) => (
                <button
                  key={party.id}
                  type="button"
                  role="option"
                  aria-selected={value === party.id}
                  onClick={() => handleSelect(party)}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left hover:bg-amber-50/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 ${
                    value === party.id ? "bg-amber-50/80" : ""
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {party.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.2 rounded text-[10px]">
                        {party.code}
                      </span>
                      {party.contact_person && (
                        <span className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3" /> {party.contact_person}
                        </span>
                      )}
                      {party.city && <span>• {party.city}</span>}
                    </div>
                  </div>
                  {value === party.id && (
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body,
      )}

      {/* Inline Create Party Dialog */}
      <PartyFormDialog
        isOpen={isAddPartyOpen}
        onClose={() => setIsAddPartyOpen(false)}
        onSuccess={handleCreated}
      />
    </div>
  );
}
