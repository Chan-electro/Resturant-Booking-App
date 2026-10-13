"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileUp, Plus, Trash2, X } from "lucide-react";
import { ordersApi } from "@/lib/api";
import {
  createOrderImportTemplate,
  parseOrderCsv,
  type ImportedOrderInput,
} from "@/lib/order-import";
import type { MenuItem, Order } from "@/lib/types";
import { getTomorrowDateKey } from "@/lib/utils";

type DraftOrder = Omit<ImportedOrderInput, "items"> & {
  items: Array<{ menuItemId: string; quantity: number }>;
};

const emptyOrder = (menuItemId = ""): DraftOrder => ({
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  deliveryDate: "",
  street: "",
  city: "Bengaluru",
  state: "Karnataka",
  zip: "",
  paymentMethod: "COD",
  paymentStatus: "PENDING",
  status: "PLACED",
  specialInstructions: "",
  items: [{ menuItemId, quantity: 1 }],
});

type Props = {
  menuItems: MenuItem[];
  onClose: () => void;
  onImported: (orders: Order[]) => void;
};

export default function OrderImportDialog({ menuItems, onClose, onImported }: Props) {
  const [mode, setMode] = useState<"manual" | "csv">("manual");
  const [drafts, setDrafts] = useState<DraftOrder[]>([emptyOrder(menuItems[0]?.id)]);
  const [csvOrders, setCsvOrders] = useState<ImportedOrderInput[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedOrders = mode === "manual" ? drafts : csvOrders;
  const validManualOrders = useMemo(
    () => drafts.every((order) =>
      order.customerName.trim() && order.customerEmail.trim() && order.deliveryDate &&
      order.street.trim() && order.city.trim() && /^\d{6}$/.test(order.zip) &&
      order.items.length > 0 && order.items.every((item) => item.menuItemId && item.quantity > 0)),
    [drafts],
  );

  const updateDraft = <K extends keyof DraftOrder>(index: number, key: K, value: DraftOrder[K]) => {
    setDrafts((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, [key]: value } : draft));
  };

  const handleCsv = async (file?: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setCsvOrders([]);
      setErrors(["CSV file must be smaller than 2 MB"]);
      return;
    }
    try {
      const result = parseOrderCsv(await file.text(), menuItems);
      setCsvOrders(result.orders);
      setErrors(result.errors);
    } catch (error) {
      setCsvOrders([]);
      setErrors([error instanceof Error ? error.message : "Unable to read CSV file"]);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([createOrderImportTemplate(getTomorrowDateKey())], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "order-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const submit = async () => {
    setErrors([]);
    if (selectedOrders.length === 0) return setErrors(["Add at least one order"]);
    if (selectedOrders.length > 100) return setErrors(["A batch can contain at most 100 orders"]);
    if (mode === "manual" && !validManualOrders) return setErrors(["Complete all required customer, delivery, address and item fields"]);

    setSubmitting(true);
    try {
      const response = await ordersApi.importOrders(selectedOrders);
      if (!response.success || !response.data) {
        setErrors([response.error || "Order import failed"]);
        return;
      }
      onImported(response.data as Order[]);
      onClose();
    } catch (error) {
      console.error(error);
      setErrors(["Order import failed. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[260] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-5xl overflow-hidden rounded-3xl border border-ivory bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-maroon px-6 py-5 text-cream">
          <div>
            <h3 className="font-display text-xl font-bold text-gold">Add or import orders</h3>
            <p className="mt-1 text-xs text-cream/70">Create one order, enter a batch manually, or upload up to 100 CSV rows.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close order import"><X className="h-5 w-5" /></button>
        </div>

        <div className="border-b border-ivory px-6 pt-5">
          <div className="flex gap-2">
            {(["manual", "csv"] as const).map((value) => (
              <button key={value} type="button" onClick={() => { setMode(value); setErrors([]); }} className={`rounded-t-xl px-5 py-3 text-sm font-bold ${mode === value ? "bg-maroon text-cream" : "bg-cream text-maroon/60"}`}>
                {value === "manual" ? "Manual entry" : "CSV import"}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {errors.length > 0 && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-bold">Please fix the following:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">{errors.slice(0, 20).map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          )}

          {mode === "csv" ? (
            <div className="space-y-5">
              <div className="rounded-2xl border-2 border-dashed border-gold/30 bg-cream/40 p-10 text-center">
                <FileUp className="mx-auto h-10 w-10 text-gold" />
                <p className="mt-3 font-bold text-maroon">Choose a CSV order file</p>
                <p className="mt-1 text-xs text-maroon/55">Items format: Menu item name*2|Another item*1</p>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void handleCsv(event.target.files?.[0])} />
                <div className="mt-5 flex justify-center gap-3">
                  <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl bg-maroon px-4 py-2 text-sm font-bold text-cream">Select CSV</button>
                  <button type="button" onClick={downloadTemplate} className="flex items-center gap-2 rounded-xl border border-ivory bg-white px-4 py-2 text-sm font-bold text-maroon"><Download className="h-4 w-4" /> Template</button>
                </div>
              </div>
              {csvOrders.length > 0 && <p className="rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">{csvOrders.length} valid order{csvOrders.length === 1 ? "" : "s"} ready to import.</p>}
            </div>
          ) : (
            <div className="space-y-5">
              {drafts.map((draft, orderIndex) => (
                <section key={orderIndex} className="rounded-2xl border border-ivory bg-cream/25 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-bold text-maroon">Order {orderIndex + 1}</h4>
                    {drafts.length > 1 && <button type="button" onClick={() => setDrafts((current) => current.filter((_, index) => index !== orderIndex))} className="text-red-500" aria-label={`Remove order ${orderIndex + 1}`}><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <input required placeholder="Customer name *" value={draft.customerName} onChange={(event) => updateDraft(orderIndex, "customerName", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm" />
                    <input required type="email" placeholder="Customer email *" value={draft.customerEmail} onChange={(event) => updateDraft(orderIndex, "customerEmail", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm" />
                    <input placeholder="Phone" value={draft.customerPhone} onChange={(event) => updateDraft(orderIndex, "customerPhone", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm" />
                    <input required type="date" aria-label="Delivery date" value={draft.deliveryDate} onChange={(event) => updateDraft(orderIndex, "deliveryDate", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm" />
                    <input required placeholder="Street address *" value={draft.street} onChange={(event) => updateDraft(orderIndex, "street", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm md:col-span-2" />
                    <input required placeholder="City *" value={draft.city} onChange={(event) => updateDraft(orderIndex, "city", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm" />
                    <input required placeholder="State *" value={draft.state} onChange={(event) => updateDraft(orderIndex, "state", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm" />
                    <input required inputMode="numeric" placeholder="6-digit PIN *" value={draft.zip} onChange={(event) => updateDraft(orderIndex, "zip", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm" />
                    <select value={draft.paymentMethod} onChange={(event) => updateDraft(orderIndex, "paymentMethod", event.target.value as DraftOrder["paymentMethod"])} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm"><option value="COD">Cash on delivery</option><option value="ONLINE">Online</option></select>
                    <select value={draft.paymentStatus} onChange={(event) => updateDraft(orderIndex, "paymentStatus", event.target.value as DraftOrder["paymentStatus"])} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm"><option value="PENDING">Payment pending</option><option value="PAID">Paid</option></select>
                    <select value={draft.status} onChange={(event) => updateDraft(orderIndex, "status", event.target.value as DraftOrder["status"])} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm"><option value="PLACED">Placed</option><option value="CONFIRMED">Confirmed</option></select>
                    <input placeholder="Special instructions" value={draft.specialInstructions} onChange={(event) => updateDraft(orderIndex, "specialInstructions", event.target.value)} className="rounded-xl border border-ivory bg-white px-3 py-2 text-sm md:col-span-3" />
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-maroon/55">Items</p>
                    {draft.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2">
                        <select value={item.menuItemId} onChange={(event) => updateDraft(orderIndex, "items", draft.items.map((entry, index) => index === itemIndex ? { ...entry, menuItemId: event.target.value } : entry))} className="min-w-0 flex-1 rounded-xl border border-ivory bg-white px-3 py-2 text-sm">
                          <option value="">Select menu item</option>
                          {menuItems.filter((menuItem) => menuItem.isActive !== false).map((menuItem) => <option key={menuItem.id} value={menuItem.id}>{menuItem.name}</option>)}
                        </select>
                        <input type="number" min={1} max={100} aria-label="Quantity" value={item.quantity} onChange={(event) => updateDraft(orderIndex, "items", draft.items.map((entry, index) => index === itemIndex ? { ...entry, quantity: Number(event.target.value) } : entry))} className="w-24 rounded-xl border border-ivory bg-white px-3 py-2 text-sm" />
                        {draft.items.length > 1 && <button type="button" onClick={() => updateDraft(orderIndex, "items", draft.items.filter((_, index) => index !== itemIndex))} className="rounded-xl px-3 text-red-500"><Trash2 className="h-4 w-4" /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => updateDraft(orderIndex, "items", [...draft.items, { menuItemId: menuItems[0]?.id || "", quantity: 1 }])} className="text-xs font-bold text-gold">+ Add item</button>
                  </div>
                </section>
              ))}
              <button type="button" disabled={drafts.length >= 100} onClick={() => setDrafts((current) => [...current, emptyOrder(menuItems[0]?.id)])} className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm font-bold text-maroon disabled:opacity-40"><Plus className="h-4 w-4" /> Add another order</button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-ivory bg-cream/30 px-6 py-4">
          <p className="text-xs font-medium text-maroon/55">{selectedOrders.length} order{selectedOrders.length === 1 ? "" : "s"} selected</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-ivory bg-white px-5 py-2.5 text-sm font-bold text-maroon">Cancel</button>
            <button type="button" onClick={() => void submit()} disabled={submitting || selectedOrders.length === 0 || errors.length > 0} className="rounded-xl bg-maroon px-5 py-2.5 text-sm font-bold text-cream disabled:opacity-50">{submitting ? "Importing…" : selectedOrders.length === 1 ? "Create order" : `Import ${selectedOrders.length} orders`}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
