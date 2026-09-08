import { Doctor } from "@/types/clinic";

export interface StatusResult {
  isOpenNow: boolean;
  badgeText: string;
  badgeClass: string;
  canBook: boolean;
}

const dayMap: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function getDoctorLiveStatus(doctor: Doctor): StatusResult {
  // 1. Emergency or Manual Override (Priority 1)
  if (!doctor.isAvailable) {
    return {
      isOpenNow: false,
      badgeText: "Emergency Off Duty",
      badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
      canBook: false,
    };
  }

  // If no structured schedule exists, fall back to isAvailable
  if (!doctor.schedule || !doctor.schedule.days || doctor.schedule.days.length === 0) {
    return {
      isOpenNow: true,
      badgeText: "Available",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
      canBook: true,
    };
  }

  const now = new Date();
  const currentDay = dayMap[now.getDay()]; // "Mon", "Tue", etc.
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 2. Check if doctor works today
  const worksToday = doctor.schedule.days.includes(currentDay);

  if (!worksToday) {
    return {
      isOpenNow: false,
      badgeText: `Next: ${doctor.schedule.days.join(", ")}`,
      badgeClass: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700/60",
      canBook: true, // Patient can still request an appointment for a scheduled day
    };
  }

  // 3. Check time window
  const [startHour, startMin] = doctor.schedule.startTime.split(":").map(Number);
  const [endHour, endMin] = doctor.schedule.endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + (startMin || 0);
  const endTotalMinutes = endHour * 60 + (endMin || 0);

  if (currentMinutes >= startTotalMinutes && currentMinutes <= endTotalMinutes) {
    return {
      isOpenNow: true,
      badgeText: "In Clinic Now",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse",
      canBook: true,
    };
  } else if (currentMinutes < startTotalMinutes) {
    return {
      isOpenNow: false,
      badgeText: `Starts at ${formatTime12h(doctor.schedule.startTime)}`,
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
      canBook: true,
    };
  } else {
    return {
      isOpenNow: false,
      badgeText: "Shift Ended for Today",
      badgeClass: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700/60",
      canBook: true,
    };
  }
}

export function formatTime12h(time24: string): string {
  if (!time24) return "";
  const [hourStr, minStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return time24;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minStr || "00"} ${ampm}`;
}
