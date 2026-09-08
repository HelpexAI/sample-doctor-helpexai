export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  categoryId: string;
  experience: string;
  fee: string;
  timing: string;
  avatar: string;
  isAvailable: boolean;
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
