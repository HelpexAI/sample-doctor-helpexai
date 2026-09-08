import { ClinicData } from "@/types/clinic";

export const defaultClinicData: ClinicData = {
  shopId: "clinic-islamabad",
  clinicName: "Al-Shifa Executive Dental & Medical Complex",
  tagline: "Advanced Dental, Aesthetic & Family Healthcare",
  hotline: "051-8899770",
  whatsappNumber: "923001234567",
  address: "Plaza 42, Sector F-10 Markaz, Islamabad",
  emergencyNotice: "Walk-in Triage & Dental Trauma Care open daily until 11:00 PM",
  consultationFee: "2000",
  categories: [
    { id: "dental", name: "Dental Surgery" },
    { id: "aesthetics", name: "Dermatology & Aesthetics" },
    { id: "general", name: "General Medicine" }
  ],
  doctors: [
    {
      id: "dr-ahmed",
      name: "Dr. Ahmed Bilal",
      qualification: "BDS, RDS, C-Implant (UK)",
      specialization: "Cosmetic Dental Surgeon",
      categoryId: "dental",
      experience: "12 Years",
      fee: "2500",
      timing: "4:00 PM - 9:00 PM (Mon - Sat)",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
      isAvailable: true
    },
    {
      id: "dr-sara",
      name: "Dr. Sara Tariq",
      qualification: "MBBS, FCPS (Dermatology)",
      specialization: "Consultant Dermatologist",
      categoryId: "aesthetics",
      experience: "8 Years",
      fee: "3000",
      timing: "2:00 PM - 7:00 PM (Mon - Fri)",
      avatar: "https://images.unsplash.com/photo-1594824813593-906560bc9f1c?w=400&q=80",
      isAvailable: true
    },
    {
      id: "dr-usman",
      name: "Dr. Usman Farooq",
      qualification: "MBBS, MCPS, MRCGP (Int)",
      specialization: "Consultant Family Physician",
      categoryId: "general",
      experience: "14 Years",
      fee: "2000",
      timing: "10:00 AM - 3:00 PM (Mon - Sat)",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80",
      isAvailable: true
    },
    {
      id: "dr-ayesha",
      name: "Dr. Ayesha Malik",
      qualification: "BDS, FCPS (Orthodontics)",
      specialization: "Orthodontist & Aligner Specialist",
      categoryId: "dental",
      experience: "9 Years",
      fee: "2800",
      timing: "5:00 PM - 9:00 PM (Tue - Sun)",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
      isAvailable: true
    }
  ],
  services: [
    {
      id: "srv-implants",
      title: "Titanium Dental Implants",
      category: "Dental Surgery",
      priceEstimate: "Rs. 65,000 / implant",
      description: "Permanent tooth replacement using biocompatible Swiss titanium fixtures.",
      duration: "45 Mins"
    },
    {
      id: "srv-hydrafacial",
      title: "Medical HydraFacial MD",
      category: "Dermatology & Aesthetics",
      priceEstimate: "Rs. 9,500 / session",
      description: "Deep-pore vortex vacuum cleansing, salicylic exfoliation, and peptide hydration.",
      duration: "60 Mins"
    },
    {
      id: "srv-scaling",
      title: "Ultrasonic Teeth Scaling & Polishing",
      category: "Dental Surgery",
      priceEstimate: "Rs. 5,000",
      description: "Removal of tartar, stains, and plaque followed by fluoride enamel polishing.",
      duration: "30 Mins"
    },
    {
      id: "srv-laser",
      title: "Triple Wavelength Laser Hair Reduction",
      category: "Dermatology & Aesthetics",
      priceEstimate: "Rs. 12,000 / session",
      description: "FDA-approved diode and Nd:YAG laser targeting deep follicles with cooling contact.",
      duration: "40 Mins"
    }
  ]
};
