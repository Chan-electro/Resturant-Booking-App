import type { MenuItem } from "@/lib/types";

export type ImportedOrderItem = {
  menuItemId: string;
  quantity: number;
};

export type ImportedOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryDate: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID";
  status: "PLACED" | "CONFIRMED";
  specialInstructions?: string;
  items: ImportedOrderItem[];
};

export const ORDER_IMPORT_HEADERS = [
  "customer_name",
  "customer_email",
  "customer_phone",
  "delivery_date",
  "street",
  "city",
  "state",
  "pincode",
  "payment_method",
  "payment_status",
  "status",
  "special_instructions",
  "items",
] as const;

export function createOrderImportTemplate(deliveryDate: string) {
  return `${ORDER_IMPORT_HEADERS.join(",")}\n"Anita Rao",anita@example.com,+919876543210,${deliveryDate},"12 Temple Road",Bengaluru,Karnataka,560003,COD,PENDING,PLACED,"Less spicy","Menu item name*2|Another item*1"\n`;
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted value");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function parseOrderCsv(text: string, menuItems: MenuItem[]) {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) return { orders: [] as ImportedOrderInput[], errors: ["CSV has no order rows"] };

  const headers = rows[0].map(normalizeHeader);
  const missingHeaders = ORDER_IMPORT_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    return { orders: [] as ImportedOrderInput[], errors: [`Missing columns: ${missingHeaders.join(", ")}`] };
  }

  const menuLookup = new Map<string, MenuItem>();
  menuItems.forEach((item) => {
    menuLookup.set(item.id.toLowerCase(), item);
    menuLookup.set(item.name.trim().toLowerCase(), item);
  });

  const orders: ImportedOrderInput[] = [];
  const errors: string[] = [];

  rows.slice(1).forEach((values, rowIndex) => {
    const rowNumber = rowIndex + 2;
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
    const rowErrors: string[] = [];
    const required = ["customer_name", "customer_email", "delivery_date", "street", "city", "state", "pincode", "items"];
    required.forEach((field) => {
      if (!record[field]) rowErrors.push(`${field} is required`);
    });

    const parsedItems: ImportedOrderItem[] = [];
    record.items.split("|").filter(Boolean).forEach((entry) => {
      const [identifier, rawQuantity = "1"] = entry.split("*").map((value) => value.trim());
      const menuItem = menuLookup.get(identifier.toLowerCase());
      const quantity = Number(rawQuantity);
      if (!menuItem) rowErrors.push(`unknown menu item “${identifier}”`);
      else if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) rowErrors.push(`invalid quantity for “${identifier}”`);
      else parsedItems.push({ menuItemId: menuItem.id, quantity });
    });

    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.delivery_date)) rowErrors.push("delivery_date must be YYYY-MM-DD");
    if (!/^\d{6}$/.test(record.pincode)) rowErrors.push("pincode must contain 6 digits");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.customer_email)) rowErrors.push("customer_email is invalid");

    const paymentMethod = record.payment_method.toUpperCase() || "COD";
    const paymentStatus = record.payment_status.toUpperCase() || "PENDING";
    const status = record.status.toUpperCase() || "PLACED";
    if (!['COD', 'ONLINE'].includes(paymentMethod)) rowErrors.push("payment_method must be COD or ONLINE");
    if (!['PENDING', 'PAID'].includes(paymentStatus)) rowErrors.push("payment_status must be PENDING or PAID");
    if (!['PLACED', 'CONFIRMED'].includes(status)) rowErrors.push("status must be PLACED or CONFIRMED");

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNumber}: ${rowErrors.join("; ")}`);
      return;
    }

    orders.push({
      customerName: record.customer_name,
      customerEmail: record.customer_email.toLowerCase(),
      customerPhone: record.customer_phone || undefined,
      deliveryDate: record.delivery_date,
      street: record.street,
      city: record.city,
      state: record.state,
      zip: record.pincode,
      paymentMethod: paymentMethod as ImportedOrderInput["paymentMethod"],
      paymentStatus: paymentStatus as ImportedOrderInput["paymentStatus"],
      status: status as ImportedOrderInput["status"],
      specialInstructions: record.special_instructions || undefined,
      items: parsedItems,
    });
  });

  return { orders, errors };
}
