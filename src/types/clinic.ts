export interface DoctorSchedule {
  days: string[];          // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
  startTime: string;       // 24-hour format: "16:00"
  endTime: string;         // 24-hour format: "21:00"
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  categoryId: string;
  experience: string;
  fee: string;
  gender?: "male" | "female" | string;
  onlyAvailableInSlot?: boolean; // When true: strictly unavailable outside day & time slot
  schedule?: DoctorSchedule;
  timingDisplay?: string;  // Human-readable: "Mon - Fri (4:00 PM - 9:00 PM)"
  timing?: string;         // Fallback legacy field
  avatar: string;
  isAvailable: boolean;    // Manual emergency toggle: false = forced Off Duty
}

export interface ClinicService {
  id: string;
  title: string;
  category: string;
  priceEstimate: string;
  description: string;
  duration: string;
}

export interface DoctorCategory {
  id: string;
  name: string;
}

export interface ClinicData {
  shopId: string;
  clinicName: string;
  tagline: string;
  hotline: string;
  whatsappNumber: string;
  address: string;
  emergencyNotice: string;
  consultationFee: string;
  categories: DoctorCategory[];
  doctors: Doctor[];
  services: ClinicService[];
}
