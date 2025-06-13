import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount?: number | null) {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return safeAmount.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
}
