"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck } from "lucide-react";
import { Doctor } from "@/types/clinic";

interface BookingModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  clinicName: string;
}

export default function BookingModal({
  doctor,
  isOpen,
  onClose,
  whatsappNumber,
  clinicName,
}: BookingModalProps) {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [mrNumber, setMrNumber] = useState(""); // Optional Hospital / Patient File ID
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");

  if (!isOpen || !doctor) return null;

  const timeSlots = [
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM",
    "07:00 PM - 08:00 PM",
    "08:00 PM - 09:00 PM",
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim() || !patientPhone.trim() || !preferredDate || !preferredSlot) {
      alert("Please fill in your name, contact phone, preferred date, and time slot.");
      return;
    }

    // Structured WhatsApp Triage Dispatch
    const message = `🏥 *NEW APPOINTMENT BOOKING REQUEST*
---------------------------------------
*Clinic:* ${clinicName}
*Doctor:* ${doctor.name} (${doctor.specialization})
*Consultation Fee:* Rs. ${doctor.fee}

👤 *PATIENT INFORMATION:*
• *Full Name:* ${patientName.trim()}
• *Phone:* ${patientPhone.trim()}
• *Age/Gender:* ${patientAge ? patientAge + " yrs" : "Not specified"} | ${gender}
• *Hospital / MR ID:* ${mrNumber.trim() ? mrNumber.trim() : "First-time Walk-in"}

🗓 *APPOINTMENT PREFERENCE:*
• *Date:* ${preferredDate}
• *Preferred Slot:* ${preferredSlot}
• *Doctor Schedule:* ${doctor.timingDisplay || doctor.timing || "Contact reception for slots"}

🩺 *SYMPTOMS / REASON FOR VISIT:*
${symptoms.trim() ? symptoms.trim() : "Routine consultation / Check-up"}
---------------------------------------
_Sent via Helpex Clinic Digital Booking System_`;

    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 dark:bg-black/85 backdrop-blur-sm overflow-y-auto">
      {/* 1. Modal Shell: bg-[#1C1917] border-stone-800 */}
      <div className="bg-[#FAF8F5] border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative my-8 text-stone-900 dark:text-stone-100 transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-100/70 dark:bg-stone-900/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Direct Reception Booking
            </span>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              Appointment with {doctor.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/80 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Doctor Quick Snapshot: #292524 with avatar border border-amber-600/40 */}
        <div className="p-4 bg-amber-50/60 border-b border-amber-100 dark:bg-[#292524] dark:border-stone-800/80 flex items-center gap-3">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-12 h-12 rounded-xl object-cover border border-amber-600/40"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{doctor.name}</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">{doctor.specialization}</p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{doctor.timingDisplay || doctor.timing}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">Fee</span>
            <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">Rs. {doctor.fee}</span>
          </div>
        </div>

        {/* 3. Booking Form & Input Styles */}
        <form onSubmit={handleBookingSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arslan Tiwana"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 0300 1234567"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Age</label>
              <input
                type="number"
                placeholder="e.g. 28"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Child">Child</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                MR / File # <span className="text-stone-400 dark:text-stone-500">(Opt)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MR-1042"
                value={mrNumber}
                onChange={(e) => setMrNumber(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Preferred Time Slot *
              </label>
              <select
                required
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 transition-colors"
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot, idx) => (
                  <option key={idx} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Symptoms / Reason for Visit (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Severe toothache on lower left side, bleeding gums..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500 resize-none transition-colors"
            />
          </div>

          {/* 4. Confirmation Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-extrabold text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Confirm &amp; Dispatch via WhatsApp</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] text-stone-500 dark:text-stone-400 mt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Instant confirmation sent directly to clinic reception desk</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
