"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Lock,
  Search,
} from "lucide-react";
import { ClinicData, Doctor } from "@/types/clinic";
import { defaultClinicData } from "@/data/defaultClinicData";
import BookingModal from "@/components/BookingModal";

export default function ClinicStorefront() {
  const [clinic, setClinic] = useState<ClinicData>(defaultClinicData);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch live clinic data from Cloudflare Worker KV
  useEffect(() => {
    const fetchClinicData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiUrl}?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (res.ok) {
          const remoteData: ClinicData = await res.json();
          setClinic(remoteData);
        }
      } catch (err) {
        console.warn("Using fallback clinic data due to network error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinicData();
  }, []);

  // Filter Doctors by Category and Search Term
  const filteredDoctors = clinic.doctors.filter((doc) => {
    const matchesCategory =
      selectedCategory === "all" || doc.categoryId === selectedCategory;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenBooking = (doc: Doctor) => {
    if (!doc.isAvailable) return;
    setSelectedDoctor(doc);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-slate-100 selection:bg-teal-500 selection:text-black">
      {/* Top Emergency / Triage Banner */}
      {clinic.emergencyNotice && (
        <div className="bg-gradient-to-r from-teal-950/80 via-zinc-900 to-teal-950/80 border-b border-teal-500/20 py-2.5 px-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-teal-300 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>{clinic.emergencyNotice}</span>
          </p>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0A0D14]/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                {clinic.clinicName}
              </h1>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {clinic.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${clinic.hotline}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              <span>{clinic.hotline}</span>
            </a>

            <Link
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
              href="/admin"
            >
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Medical Specialists</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Book Specialist Consultations &amp; Treatments on{" "}
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
            WhatsApp
          </span>
        </h2>

        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
          No waiting on hold. Select your consultant, view consultation schedules, and book direct reception confirmation in under 30 seconds.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            {clinic.address}
          </span>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            PMDC &amp; Healthcare Commission Compliant
          </span>
        </div>
      </section>

      {/* Search & Specialty Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              All Specialists ({clinic.doctors.length})
            </button>
            {clinic.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className={`rounded-3xl p-6 bg-[#0E121A] border transition-all flex flex-col justify-between ${
                doc.isAvailable
                  ? "border-zinc-800 hover:border-teal-500/40 shadow-lg shadow-black/40"
                  : "border-zinc-800/60 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-zinc-700/80 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      {doc.specialization}
                    </span>
                    <h3 className="text-lg font-bold text-white truncate mt-0.5">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      {doc.qualification}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-zinc-800/80 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Experience:</span>
                    <span className="font-semibold text-zinc-200">{doc.experience}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Consultation Fee:</span>
                    <span className="font-bold text-teal-300">Rs. {doc.fee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Timing:</span>
                    <span className="font-medium text-zinc-200 text-right">{doc.timing}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {doc.isAvailable ? (
                  <button
                    onClick={() => handleOpenBooking(doc)}
                    className="w-full py-3 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/15 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Appointment</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-xs cursor-not-allowed"
                  >
                    Currently Off Duty
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-16 bg-[#0E121A] border border-zinc-800/80 rounded-3xl">
            <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-300">No consultants found</p>
            <p className="text-xs text-zinc-500 mt-1">Try selecting another specialty category or clear your search.</p>
          </div>
        )}
      </section>

      {/* Clinical Services & Treatments Catalog */}
      {clinic.services && clinic.services.length > 0 && (
        <section className="py-16 bg-[#0A0D14] border-t border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Transparent Care
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Clinical Procedures &amp; Treatments
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Clear treatment estimates with zero hidden procedural charges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinic.services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-6 rounded-3xl bg-[#0E121A] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {srv.category}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {srv.duration}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{srv.title}</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Estimate</span>
                      <span className="text-sm font-extrabold text-teal-300">
                        {srv.priceEstimate}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${clinic.whatsappNumber.replace(
                        /[^0-9]/g,
                        ""
                      )}?text=${encodeURIComponent(
                        `Hello, I would like to inquire about "${srv.title}" at ${clinic.clinicName}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <span>Inquire</span>
                      <ExternalLink className="w-3 h-3 text-teal-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-10 border-t border-zinc-800/80 bg-[#07080B] text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} {clinic.clinicName}. All rights reserved.</p>
        <p className="mt-1">
          Powered by{" "}
          <a
            href="https://helpexai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:underline font-semibold"
          >
            Helpex Solutions
          </a>
        </p>
      </footer>

      {/* Interactive Booking Modal */}
      <BookingModal
        doctor={selectedDoctor}
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedDoctor(null);
        }}
        whatsappNumber={clinic.whatsappNumber}
        clinicName={clinic.clinicName}
      />
    </div>
  );
}
