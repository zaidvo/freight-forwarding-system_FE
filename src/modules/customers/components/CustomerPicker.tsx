import { Check, ChevronDown, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CustomerSuggestion } from "../types";
import { suggestCustomers } from "../services/customerService";
import RoleBadge from "./RoleBadge";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (customer: CustomerSuggestion) => void;
  onCreateNew: (name: string) => void;
  placeholder?: string;
  error?: boolean;
};

export default function CustomerPicker({
  value,
  onChange,
  onSelect,
  onCreateNew,
  placeholder = "Search customers...",
  error = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<CustomerSuggestion[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const selectedValueRef = useRef<string | null>(null);

  useEffect(() => {
    const query = value.trim();

    // Selecting a result updates the input value from the parent. Do not
    // immediately search again and reopen the picker on that controlled update.
    if (selectedValueRef.current === query) {
      setMatches([]);
      setLoading(false);
      setRequestError(null);
      setOpen(false);
      return;
    }

    if (query.length < 2) {
      setMatches([]);
      setLoading(false);
      setRequestError(null);
      setOpen(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setRequestError(null);
      try {
        const results = await suggestCustomers(query);
        if (!cancelled) {
          setMatches(results);
          setOpen(true);
        }
      } catch (requestFailure) {
        if (!cancelled) {
          setRequestError(
            requestFailure instanceof Error
              ? requestFailure.message
              : "Could not search customers.",
          );
          setMatches([]);
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  const selectCustomer = (customer: CustomerSuggestion) => {
    selectedValueRef.current = customer.name.trim();
    onSelect(customer);
    setMatches([]);
    setRequestError(null);
    setOpen(false);
  };

  const handleChange = (nextValue: string) => {
    selectedValueRef.current = null;
    onChange(nextValue);
  };

  const canCreate = value.trim().length >= 2 && matches.length === 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            if (selectedValueRef.current !== value.trim() && value.trim().length >= 2) {
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-9 text-[13px] text-slate-800 outline-none transition focus:ring-2 ${
            error
              ? "border-red-400 focus:border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
          }`}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />
        ) : (
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
      </div>

      {open && (
        <div className="relative z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_36px_rgba(15,23,42,0.16)]">
          {requestError ? (
            <p className="px-2.5 py-2 text-[12px] text-rose-600">{requestError}</p>
          ) : matches.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {matches.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => selectCustomer(customer)}
                  className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-slate-800">
                      {customer.name}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      {customer.code} {customer.city ? `• ${customer.city}` : ""}
                      {customer.roles.slice(0, 2).map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-2.5 py-2 text-[12px] text-slate-500">
              No matching active customers.
            </p>
          )}

          {/* Only offer creation when the search found nothing. */}
          {canCreate && (
            <button
              type="button"
              onClick={() => {
                onCreateNew(value.trim());
                setOpen(false);
              }}
              className="mt-1 flex w-full items-center gap-2 border-t border-slate-100 px-2.5 py-2 text-left text-[12px] font-semibold text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Create new customer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
