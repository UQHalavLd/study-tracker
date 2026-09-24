import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    month: "short",
    day: "numeric",
  });
}

export function calculateNet(correct: number, wrong: number): number {
  return Math.round((correct - wrong / 4) * 100) / 100;
}

export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function getRemainingDays(targetDate: string): number | null {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDailyPageTarget(
  remainingPages: number,
  remainingDays: number | null
): number | null {
  if (!remainingDays || remainingDays <= 0 || remainingPages <= 0) return null;
  return Math.ceil(remainingPages / remainingDays);
}

export function getExamTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    tyt: "TYT",
    ayt: "AYT",
    custom: "Özel",
  };
  return labels[type] || type;
}

export function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
  };
  return labels[severity] || severity;
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "text-yellow-500",
    medium: "text-orange-500",
    high: "text-red-500",
  };
  return colors[severity] || "text-gray-500";
}

export function getBookStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Aktif",
    completed: "Tamamlandı",
    paused: "Duraklatıldı",
  };
  return labels[status] || status;
}

export function getBookStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    paused: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}
