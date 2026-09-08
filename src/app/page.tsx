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
  MessageCircle,
  Navigation,
} from "lucide-react";
import { ClinicData, Doctor } from "@/types/clinic";
import { defaultClinicData } from "@/data/defaultClinicData";
import { getDoctorLiveStatus } from "@/utils/doctorStatus";
import BookingModal from "@/components/BookingModal";
import ThemeToggle from "@/components/ThemeToggle";

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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://helpexai.muhammadarslan0111.workers.dev/api/shop/clinic-islamabad";

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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 dark:bg-[#0C0A09] dark:text-stone-100 selection:bg-amber-600 selection:text-white transition-colors duration-200">
      {/* Sample Clinic Showcase Top Banner */}
      <div className="bg-stone-900 text-stone-200 border-b border-stone-800 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
              Demo Showcase
            </span>
            <span>
              Sample Clinic &amp; Doctor Appointment Portal by Helpex Solutions — Want a high-speed booking website like this for your clinic?
            </span>
          </p>
          <a
            href="https://wa.me/923146517960?text=Hi%20Helpex%20Solutions!%20I%20saw%20your%20Clinic%20demo%20and%20want%20to%20build%20a%20website%20for%20my%20clinic."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-[11px] shadow-sm transition-all whitespace-nowrap"
          >
            <span>Build Your Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 1. Top Emergency / Triage Notice Banner */}
      {clinic.emergencyNotice && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200/80 text-amber-900 dark:bg-gradient-to-r dark:from-stone-900 dark:via-amber-950/40 dark:to-stone-900 dark:border-b dark:border-amber-500/20 dark:text-amber-300 py-2.5 px-4 text-center">
          <p className="text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-ping" />
            <span>{clinic.emergencyNotice}</span>
          </p>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0C0A09]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                {clinic.clinicName}
              </h1>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                {clinic.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href={`tel:${clinic.hotline}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-xs font-semibold text-stone-700 hover:text-stone-900 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{clinic.hotline}</span>
            </a>

            <Link
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-xs font-semibold text-stone-700 hover:text-stone-900 dark:bg-stone-900 dark:hover:bg-stone-800 dark:border-stone-800 dark:text-stone-300 dark:hover:text-white transition-colors"
              href="/admin"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Staff Login</span>
            </Link>

            {/* Theme Toggle Icon Button */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Verified Medical Specialists</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight max-w-3xl mx-auto">
          Book Specialist Consultations &amp; Treatments on{" "}
          <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 dark:from-amber-400 dark:via-orange-300 dark:to-amber-500 bg-clip-text text-transparent">
            WhatsApp
          </span>
        </h2>

        <p className="mt-4 text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
          No waiting on hold. Select your consultant, view consultation schedules, and book direct reception confirmation in under 30 seconds.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {clinic.address}
          </span>
          <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            PMDC &amp; Healthcare Commission Compliant
          </span>
        </div>
      </section>

      {/* 2. Search & Specialty Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500 dark:text-stone-950 dark:shadow-md dark:shadow-amber-900/40"
                  : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200 shadow-sm dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100 dark:border-stone-800 dark:shadow-none"
              }`}
            >
              All Specialists ({clinic.doctors.length})
            </button>
            {clinic.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500 dark:text-stone-950 dark:shadow-md dark:shadow-amber-900/40"
                    : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200 shadow-sm dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100 dark:border-stone-800 dark:shadow-none"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 shadow-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500 dark:shadow-none transition-colors"
            />
          </div>
        </div>
      </section>

      {/* 3. Doctors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            const status = getDoctorLiveStatus(doc);
            return (
              <div
                key={doc.id}
                className={`rounded-3xl p-6 transition-all flex flex-col justify-between ${
                  status.canBook
                    ? "bg-white border border-stone-200 shadow-sm hover:shadow-lg hover:border-amber-500/40 dark:bg-[#1C1917] dark:border-stone-800 dark:hover:border-amber-500/40 dark:shadow-black/40"
                    : "bg-stone-100/70 border border-stone-200/60 opacity-75 dark:bg-[#1C1917] dark:border-stone-800/60 dark:opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-stone-200 dark:border-stone-700/80 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            {doc.specialization}
                          </span>
                          {doc.gender && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 capitalize">
                              {doc.gender}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate">
                          {doc.qualification}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${status.badgeClass}`}
                    >
                      {status.badgeText}
                    </span>
                  </div>

                  <div className="space-y-2 py-3 px-3.5 rounded-2xl bg-stone-50 border border-stone-100 dark:bg-transparent dark:border-stone-800/80 dark:border-y dark:rounded-none dark:px-0 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 dark:text-stone-400">Experience:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{doc.experience}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 dark:text-stone-400">Consultation Fee:</span>
                      <span className="font-black text-amber-700 dark:text-amber-400">Rs. {doc.fee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 dark:text-stone-400">Timing:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200 text-right">
                        {doc.timingDisplay || doc.timing || (doc.schedule ? `${doc.schedule.days.join(", ")} (${doc.schedule.startTime} - ${doc.schedule.endTime})` : "Schedule not specified")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {status.canBook ? (
                    <button
                      onClick={() => handleOpenBooking(doc)}
                      className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 font-bold text-xs shadow-md shadow-amber-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-500 font-bold text-xs cursor-not-allowed border border-stone-300 dark:border-stone-700/50 flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{!doc.isAvailable ? "Unavailable (Emergency Off Duty)" : "Unavailable (Outside Shift Hours)"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl dark:bg-[#1C1917] dark:border-stone-800 shadow-sm">
            <AlertCircle className="w-10 h-10 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-300">No consultants found</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Try selecting another specialty category or clear your search.</p>
          </div>
        )}
      </section>

      {/* Clinical Services & Treatments Catalog */}
      {clinic.services && clinic.services.length > 0 && (
        <section className="py-16 bg-stone-100/70 dark:bg-[#0C0A09] border-t border-stone-200 dark:border-stone-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Transparent Care
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                Clinical Procedures &amp; Treatments
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2">
                Clear treatment estimates with zero hidden procedural charges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinic.services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 dark:bg-[#1C1917] dark:border-stone-800 dark:hover:border-stone-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {srv.category}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {srv.duration}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">{srv.title}</h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block uppercase font-medium">Estimate</span>
                      <span className="text-sm font-black text-amber-700 dark:text-amber-400">
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors"
                    >
                      <span>Inquire</span>
                      <ExternalLink className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clinic Branch Location & Interactive Google Maps Embed */}
      <section id="location" className="py-16 border-t border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#0C0A09] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Branch Location &amp; Directions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Visit Our Clinic
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                Centrally located with easy parking, walk-in reception, and direct road connectivity.
              </p>
            </div>

            <a
              href={
                clinic.mapDirectionsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${clinic.clinicName} ${clinic.address}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-xs shadow-md shadow-amber-900/20 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Branch Details Card */}
            <div className="lg:col-span-1 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Address block */}
                <div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                    Clinic Address
                  </span>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {clinic.address}
                  </p>
                </div>

                {/* Contact numbers */}
                <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800/80">
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                      Reception Desk
                    </span>
                    <a
                      href={`tel:${clinic.hotline}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-stone-900 hover:text-amber-600 dark:text-stone-100 dark:hover:text-amber-400 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{clinic.hotline}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                      WhatsApp Helpdesk
                    </span>
                    <a
                      href={`https://wa.me/${clinic.whatsappNumber.replace(
                        /[^0-9]/g,
                        ""
                      )}?text=${encodeURIComponent(
                        `Hi ${clinic.clinicName}, I need directions or help reaching your clinic.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>+{clinic.whatsappNumber}</span>
                    </a>
                  </div>
                </div>

                {/* Emergency / Walk-in note */}
                {clinic.emergencyNotice && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 dark:bg-amber-950/20 dark:border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Walk-in Notice
                        </p>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                          {clinic.emergencyNotice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action button */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80">
                <a
                  href={
                    clinic.mapDirectionsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${clinic.clinicName} ${clinic.address}`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-100 border border-stone-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open in Google Maps App</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="lg:col-span-2 h-[380px] sm:h-[450px] lg:h-auto min-h-[380px] rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm relative bg-stone-100 dark:bg-stone-900">
              {clinic.mapEmbedUrl ? (
                <iframe
                  title={`${clinic.clinicName} Google Maps Location`}
                  src={clinic.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <MapPin className="w-10 h-10 text-stone-400 dark:text-stone-600 mb-3" />
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                    Map Location Not Configured
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 max-w-sm">
                    Configure your Google Maps embed code in Staff Admin settings to display the interactive map here.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${clinic.clinicName} ${clinic.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200"
                  >
                    <span>Search on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Showcase by Helpex Solutions CTA Section */}
      <section className="py-16 bg-white dark:bg-[#1C1917] border-t border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Showcase by Helpex Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Ready to streamline your clinic&apos;s patient appointments &amp; consultations?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Get an ultra-fast, modern clinic website with automated WhatsApp appointment booking, real-time doctor schedule &amp; duty tracking, transparent procedure pricing, and custom cloud sync.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/923146517960?text=Hi%20Helpex%20Solutions!%20I%20want%20to%20order%20a%20clinic%20website%20system."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-amber-900/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Talk with Us on WhatsApp</span>
            </a>
            <a
              href="https://helpexai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              <span>Visit Helpex Solutions</span>
              <ExternalLink className="w-4 h-4 text-stone-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0C0A09] text-center text-xs text-stone-500 dark:text-stone-400 transition-colors">
        <p>© {new Date().getFullYear()} {clinic.clinicName}. All rights reserved.</p>
        <p className="mt-1">
          Powered by{" "}
          <a
            href="https://helpexai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
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
