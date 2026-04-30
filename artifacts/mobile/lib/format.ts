export function fmt(n: number | string | null | undefined): string {
  const num = typeof n === "number" ? n : Number(n ?? 0);
  if (!isFinite(num)) return "0";
  try {
    return num.toLocaleString("bn-BD", { maximumFractionDigits: 0 });
  } catch {
    return Math.round(num).toString();
  }
}

export function tk(n: number | string | null | undefined): string {
  return "৳" + fmt(n);
}

export function bnDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date.toDateString();
  }
}

export function bnLongDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return date.toLocaleDateString("bn-BD", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date.toDateString();
  }
}

export function bnMonth(monthKey: string): string {
  const [y, m] = monthKey.split("-");
  if (!y || !m) return monthKey;
  const date = new Date(Number(y), Number(m) - 1, 1);
  try {
    return date.toLocaleDateString("bn-BD", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return monthKey;
  }
}

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
