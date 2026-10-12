// src/modules/indenting/pages/IndentDealFormPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Calculator,
  Save,
  Building2,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/app/layout/AppLayout";
import { indentingService } from "../services/indentingService";
import type {
  IndentingCommissionPayer,
  IndentingCommissionType,
  IndentingParty,
  IndentingPartySuggest,
} from "../types";
import { PartyPicker } from "../components/PartyPicker";

const COMMON_CURRENCIES = ["USD", "EUR", "PKR", "GBP", "AED", "CNY"];
const COMMON_UNITS = ["MT", "KG", "LBS", "PCS", "CONTAINERS", "BARRELS", "METERS"];

export default function IndentDealFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Loading states
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [partyAId, setPartyAId] = useState<number | null>(null);
  const [partyBId, setPartyBId] = useState<number | null>(null);
  const [selectedPartyA, setSelectedPartyA] = useState<IndentingParty | IndentingPartySuggest | null>(null);
  const [selectedPartyB, setSelectedPartyB] = useState<IndentingParty | IndentingPartySuggest | null>(null);

  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState("MT");
  const [dealValue, setDealValue] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [dealDate, setDealDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  // Commission Fields
  const [commissionType, setCommissionType] = useState<IndentingCommissionType>("percent");
  const [commissionRate, setCommissionRate] = useState<string>("2.0");
  const [commissionAmount, setCommissionAmount] = useState<string>("");
  const [commissionCurrency, setCommissionCurrency] = useState("USD");
  const [commissionPayer, setCommissionPayer] = useState<IndentingCommissionPayer>("party_a");
  const [remarks, setRemarks] = useState("");

  // Load existing deal when editing
  useEffect(() => {
    if (!id) return;
    const fetchDeal = async () => {
      setLoading(true);
      try {
        const deal = await indentingService.getDeal(parseInt(id, 10));
        setPartyAId(deal.party_a_id);
        setPartyBId(deal.party_b_id);
        setSelectedPartyA(deal.party_a ?? null);
        setSelectedPartyB(deal.party_b ?? null);
        setProduct(deal.product);
        setQuantity(deal.quantity.toString());
        setUnit(deal.unit);
        setDealValue(deal.deal_value.toString());
        setCurrency(deal.currency);
        setDealDate(deal.deal_date);
        setCommissionType(deal.commission_type);
        setCommissionRate(deal.commission_rate?.toString() ?? "");
        setCommissionAmount(deal.commission_amount.toString());
        setCommissionCurrency(deal.commission_currency);
        setCommissionPayer(deal.commission_payer);
        setRemarks(deal.remarks ?? "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load deal");
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id]);

  // Synchronize commission currency with deal currency when user changes currency on new deal
  const handleDealCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    if (!isEdit) {
      setCommissionCurrency(newCurr);
    }
  };

  // Dynamic preview calculation
  const calculatedCommission = (() => {
    const val = parseFloat(dealValue) || 0;
    if (commissionType === "percent") {
      const rate = parseFloat(commissionRate) || 0;
      return (val * rate) / 100;
    } else {
      return parseFloat(commissionAmount) || 0;
    }
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyAId || !partyBId) {
      setError("Please select both Party A and Party B");
      return;
    }

    if (partyAId === partyBId) {
      setError("Party A and Party B must be different parties");
      return;
    }

    const numQuantity = parseFloat(quantity);
    const numDealValue = parseFloat(dealValue);

    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError("Quantity must be a positive number");
      return;
    }

    if (isNaN(numDealValue) || numDealValue <= 0) {
      setError("Deal value must be a positive number");
      return;
    }

    let numRate: number | undefined;
    let numAmount: number | undefined;

    if (commissionType === "percent") {
      numRate = parseFloat(commissionRate);
      if (isNaN(numRate) || numRate < 0) {
        setError("Please enter a valid commission percentage rate");
        return;
      }
    } else {
      numAmount = parseFloat(commissionAmount);
      if (isNaN(numAmount) || numAmount < 0) {
        setError("Please enter a valid fixed commission amount");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEdit && id) {
        const updated = await indentingService.updateDeal(parseInt(id, 10), {
          party_a_id: partyAId,
          party_b_id: partyBId,
          product: product.trim(),
          quantity: numQuantity,
          unit: unit.trim(),
          deal_value: numDealValue,
          currency,
          deal_date: dealDate,
          commission_type: commissionType,
          commission_rate: numRate,
          commission_amount: numAmount,
          commission_currency: commissionCurrency,
          commission_payer: commissionPayer,
          remarks: remarks.trim() || undefined,
        });
        navigate(`/indenting/deals/${updated.id}`);
      } else {
        const created = await indentingService.createDeal({
          party_a_id: partyAId,
          party_b_id: partyBId,
          product: product.trim(),
          quantity: numQuantity,
          unit: unit.trim(),
          deal_value: numDealValue,
          currency,
          deal_date: dealDate,
          commission_type: commissionType,
          commission_rate: numRate,
          commission_amount: numAmount,
          commission_currency: commissionCurrency,
          commission_payer: commissionPayer,
          remarks: remarks.trim() || undefined,
        });
        navigate(`/indenting/deals/${created.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save deal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/indenting"
              className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {isEdit ? "Edit Indenting Deal" : "New Indenting Deal"}
              </h1>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? "Update deal details and terms"
                  : "Establish a new brokered deal between Party A and Party B"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            Loading deal data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Parties Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-amber-600" />
                Involved Parties
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PartyPicker
                  label="Party A (Principal / Seller)"
                  required
                  value={partyAId}
                  selectedParty={selectedPartyA}
                  excludePartyId={partyBId}
                  onChange={(id, party) => {
                    setPartyAId(id);
                    setSelectedPartyA(party);
                  }}
                />

                <PartyPicker
                  label="Party B (Buyer / Offtaker)"
                  required
                  value={partyBId}
                  selectedParty={selectedPartyB}
                  excludePartyId={partyAId}
                  onChange={(id, party) => {
                    setPartyBId(id);
                    setSelectedPartyB(party);
                  }}
                />
              </div>
            </div>

            {/* 2. Deal Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">
                Commodity & Value
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Product Description <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g. Grade A Raw Cotton, Steel Billets, Urea 46%"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 500"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-28 px-2 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-amber-500 uppercase font-mono font-medium"
                    >
                      {COMMON_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Deal Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dealDate}
                    onChange={(e) => setDealDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Total Deal Value <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={currency}
                      onChange={(e) => handleDealCurrencyChange(e.target.value)}
                      className="w-28 px-2 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                    >
                      {COMMON_CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      placeholder="e.g. 250000.00"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Commission Terms */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Calculator className="w-4 h-4 text-amber-600" />
                Commission Structure & Payer
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Commission Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCommissionType("percent")}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        commissionType === "percent"
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommissionType("fixed")}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        commissionType === "fixed"
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Fixed Amount
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Commission Currency
                  </label>
                  <select
                    value={commissionCurrency}
                    onChange={(e) => setCommissionCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                  >
                    {COMMON_CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {commissionType === "percent" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Commission Rate (%) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        required
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        placeholder="e.g. 2.0000"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                        %
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Fixed Commission Amount <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={commissionAmount}
                      onChange={(e) => setCommissionAmount(e.target.value)}
                      placeholder="e.g. 5000.00"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Commission Payer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={commissionPayer}
                    onChange={(e) =>
                      setCommissionPayer(e.target.value as IndentingCommissionPayer)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="party_a">Party A (Seller)</option>
                    <option value="party_b">Party B (Buyer)</option>
                    <option value="both">Both Parties (Shared)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Remarks / Deal Terms
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Specific contract clauses, delivery terms, payment milestones..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Calculated Expected Commission:</span>
                  <div className="text-lg font-mono font-bold text-amber-700 mt-0.5">
                    {commissionCurrency}{" "}
                    {calculatedCommission.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="text-slate-500 text-[11px] sm:text-right">
                  <div>
                    Payer:{" "}
                    <span className="font-semibold text-slate-700">
                      {commissionPayer === "party_a"
                        ? "Party A"
                        : commissionPayer === "party_b"
                        ? "Party B"
                        : "Both Parties"}
                    </span>
                  </div>
                  <div>
                    Deal Total:{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      {currency} {(parseFloat(dealValue) || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link
                to="/indenting"
                className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isEdit ? "Update Deal" : "Create Deal"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
