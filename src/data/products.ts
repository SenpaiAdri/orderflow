import type { Item } from "@/lib/workflow";

export const seedProducts: Omit<Item, "qty">[] = [
  { name: "Everyday ceramic mug", sku: "CER-001", price: 480, stock: 42 },
  { name: "Linen table runner", sku: "LIN-024", price: 1250, stock: 18 },
  { name: "Cotton tea towel", sku: "TXT-012", price: 320, stock: 24 },
  { name: "Acacia serving tray", sku: "WOD-008", price: 890, stock: 0 },
];
