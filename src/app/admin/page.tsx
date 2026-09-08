"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  LogOut,
  Save,
  Plus,
  Trash2,
  Stethoscope,
  Building2,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  UserX,
  ExternalLink,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import { ClinicData, Doctor, ClinicService, DoctorCategory } from "@/types/clinic";
import { defaultClinicData } from "@/data/defaultClinicData";
import ThemeToggle from "@/components/ThemeToggle";
import ClinicQRModal from "@/components/admin/ClinicQRModal";

export default function ClinicAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Management Tab
  const [activeTab, setActiveTab] = useState<"profile" | "categories" | "doctors" | "services">("doctors");

  // Clinic Content State
  const [clinic, setClinic] = useState<ClinicData>(defaultClinicData);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // QR Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  // Modal State for New Doctor
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState<boolean>(false);
  const [newDoc, setNewDoc] = useState<Doctor>({
    id: "",
    name: "",
    qualification: "",
    specialization: "",
    categoryId: "",
    experience: "",
    fee: "",
    timing: "",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
    isAvailable: true,
  });

  // Modal State for New Service
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState<boolean>(false);
  const [newService, setNewService] = useState<ClinicService>({
    id: "",
    title: "",
    category: "",
    priceEstimate: "",
    description: "",
    duration: "30 Mins",
  });

  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://helpexai.muhammadarslan0111.workers.dev/api/shop/clinic-islamabad";

  // Check existing session token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem("helpex_clinic_token");
    const savedUser = sessionStorage.getItem("helpex_clinic_user");
    if (savedToken) {
      setSessionToken(savedToken);
      setUsername(savedUser || "Admin");
      setIsAuthenticated(true);
    }
    fetchLatestClinicData();
  }, []);

  const fetchLatestClinicData = async () => {
    try {
      const res = await fetch(`${apiUrl}?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (res.ok) {
        const data: ClinicData = await res.json();
        setClinic(data);
      }
    } catch (err) {
      console.warn("Could not fetch remote KV, falling back to local state.", err);
    }
  };

  // --- AUTHENTICATION HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        sessionStorage.setItem("helpex_clinic_token", data.token);
        sessionStorage.setItem("helpex_clinic_user", username);
        setSessionToken(data.token);
        setIsAuthenticated(true);
        setPassword("");
        setStatusMessage({ type: "success", text: "Session authenticated successfully!" });
      } else {
        setAuthError(data.error || "Invalid username or password");
      }
    } catch (err: any) {
      setAuthError("Could not reach Cloudflare Worker: " + (err.message || "Network Error"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("helpex_clinic_token");
    sessionStorage.removeItem("helpex_clinic_user");
    setSessionToken("");
    setIsAuthenticated(false);
    setStatusMessage(null);
  };

  // --- SAVE TO CLOUDFLARE EDGE KV ---
  const handleSaveToEdge = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${apiUrl}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(clinic),
      });

      const data = await res.json();

      if (res.status === 401) {
        handleLogout();
        setAuthError("Session expired or invalid. Please sign in again.");
        return;
      }

      if (res.ok) {
        setStatusMessage({ type: "success", text: "Changes published live to Cloudflare Edge!" });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to update KV database." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Network failure: " + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // --- CMS STATE MUTATIONS ---
  const handleToggleDoctorAvailability = (docId: string) => {
    setClinic((prev) => ({
      ...prev,
      doctors: prev.doctors.map((d) =>
        d.id === docId ? { ...d, isAvailable: !d.isAvailable } : d
      ),
    }));
  };

  const handleDoctorFeeChange = (docId: string, newFee: string) => {
    setClinic((prev) => ({
      ...prev,
      doctors: prev.doctors.map((d) =>
        d.id === docId ? { ...d, fee: newFee } : d
      ),
    }));
  };

  const handleDeleteDoctor = (docId: string) => {
    if (!confirm("Are you sure you want to remove this doctor from the portal?")) return;
    setClinic((prev) => ({
      ...prev,
      doctors: prev.doctors.filter((d) => d.id !== docId),
    }));
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.specialization || !newDoc.fee) {
      alert("Please fill required fields (Name, Specialization, Fee).");
      return;
    }
    const createdDoc: Doctor = {
      ...newDoc,
      id: "doc-" + Date.now(),
      categoryId: newDoc.categoryId || (clinic.categories[0]?.id || "general"),
    };
    setClinic((prev) => ({
      ...prev,
      doctors: [createdDoc, ...prev.doctors],
    }));
    setIsNewDocModalOpen(false);
    setNewDoc({
      id: "",
      name: "",
      qualification: "",
      specialization: "",
      categoryId: clinic.categories[0]?.id || "",
      experience: "",
      fee: "",
      timing: "",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
      isAvailable: true,
    });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat: DoctorCategory = {
      id: newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: newCategoryName.trim(),
    };
    setClinic((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
    setNewCategoryName("");
  };

  const handleDeleteCategory = (catId: string) => {
    if (!confirm("Delete category? Doctors in this category will remain, but won't be grouped under it.")) return;
    setClinic((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== catId),
    }));
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title || !newService.priceEstimate) {
      alert("Please enter service title and price estimate.");
      return;
    }
    const createdService: ClinicService = {
      ...newService,
      id: "srv-" + Date.now(),
      category: newService.category || (clinic.categories[0]?.name || "Clinical Care"),
    };
    setClinic((prev) => ({
      ...prev,
      services: [...(prev.services || []), createdService],
    }));
    setIsNewServiceModalOpen(false);
    setNewService({
      id: "",
      title: "",
      category: "",
      priceEstimate: "",
      description: "",
      duration: "30 Mins",
    });
  };

  const handleDeleteService = (srvId: string) => {
    if (!confirm("Are you sure you want to delete this clinical service?")) return;
    setClinic((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== srvId),
    }));
  };

  // ==========================================
  // VIEW 1: LOGIN FORM (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 dark:bg-[#0C0A09] dark:text-stone-100 flex items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-md bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="text-center mb-8 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Staff Reception Portal</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Sign in to manage doctors, fees &amp; clinic settings</p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-extrabold text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <span>Verifying Handshake...</span> : <span>Sign In to Dashboard</span>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 text-center">
            <Link className="text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors" href="/">
              ← Return to Public Clinic Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 dark:bg-[#0C0A09] dark:text-stone-100 pb-28 transition-colors">
      {/* 1. Header & Navigation: bg-stone-950/90 border-stone-800 in dark mode */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{clinic.clinicName}</span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Live Sync Active
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Signed in as {username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-300 transition-colors"
              title="Generate Reception QR Standee"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Reception QR</span>
            </button>

            <Link
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-xs font-semibold text-stone-700 hover:text-stone-900 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:text-white transition-colors"
              href="/"
              target="_blank"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </Link>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Status Toast Alert */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between ${
              statusMessage.type === "success"
                ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-stone-200 dark:border-stone-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "doctors"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500 dark:text-stone-950 dark:shadow-sm dark:shadow-amber-900/30"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200 shadow-sm dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100 dark:border-stone-800 dark:shadow-none"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Doctor Profiles &amp; Fees ({clinic.doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "services"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500 dark:text-stone-950 dark:shadow-sm dark:shadow-amber-900/30"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200 shadow-sm dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100 dark:border-stone-800 dark:shadow-none"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Procedures &amp; Services ({clinic.services?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "categories"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500 dark:text-stone-950 dark:shadow-sm dark:shadow-amber-900/30"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200 shadow-sm dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100 dark:border-stone-800 dark:shadow-none"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Specialty Categories ({clinic.categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500 dark:text-stone-950 dark:shadow-sm dark:shadow-amber-900/30"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200 shadow-sm dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100 dark:border-stone-800 dark:shadow-none"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Clinic Settings &amp; Emergency</span>
          </button>
        </div>

        {/* TAB 1: DOCTORS DIRECTORY */}
        {activeTab === "doctors" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Doctors &amp; Consultants</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Toggle daily on-duty status or adjust consultation charges</p>
              </div>
              <button
                onClick={() => setIsNewDocModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 font-bold text-xs shadow-md shadow-amber-900/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Doctor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinic.doctors.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between shadow-sm dark:bg-[#1C1917] ${
                    doc.isAvailable ? "border-stone-200 dark:border-stone-800" : "border-red-300 bg-red-50/20 dark:border-red-500/30 dark:bg-red-950/5"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{doc.name}</h3>
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">{doc.specialization}</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">{doc.qualification}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteDoctor(doc.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-stone-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 py-3 border-y border-stone-100 dark:border-stone-800/80 text-xs">
                      <div>
                        <span className="text-stone-500 dark:text-stone-400 block mb-1">Consultation Fee (PKR):</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">Rs.</span>
                          <input
                            type="text"
                            value={doc.fee}
                            onChange={(e) => handleDoctorFeeChange(doc.id, e.target.value)}
                            className="w-full pl-10 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-bold focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-500 dark:text-stone-400 block">Schedule:</span>
                        <p className="text-xs text-stone-800 dark:text-stone-300 font-medium">{doc.timing}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      onClick={() => handleToggleDoctorAvailability(doc.id)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        doc.isAvailable
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/25"
                          : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/80 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/25"
                      }`}
                    >
                      {doc.isAvailable ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>On Duty (Accepting Bookings)</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4" />
                          <span>Off Duty (Booking Blocked)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROCEDURES & SERVICES */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Clinical Procedures &amp; Services</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Manage treatment estimates and procedural information</p>
              </div>
              <button
                onClick={() => setIsNewServiceModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 font-bold text-xs shadow-md shadow-amber-900/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Procedure</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(clinic.services || []).map((srv) => (
                <div
                  key={srv.id}
                  className="p-5 rounded-3xl bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {srv.category}
                      </span>
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-stone-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{srv.title}</h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">{srv.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-500 dark:text-stone-400">Est: <strong className="text-amber-700 dark:text-amber-400">{srv.priceEstimate}</strong></span>
                    <span className="text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {srv.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Specialty Departments</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Categorize doctors on your patient booking storefront</p>
            </div>

            <form onSubmit={handleCreateCategory} className="flex gap-3">
              <input
                type="text"
                required
                placeholder="e.g. Orthodontics, Physiotherapy"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 shadow-sm focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </form>

            <div className="bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 rounded-2xl divide-y divide-stone-100 dark:divide-stone-800 shadow-sm">
              {clinic.categories.map((cat) => (
                <div key={cat.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{cat.name}</h4>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">ID: {cat.id}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-stone-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CLINIC SETTINGS */}
        {activeTab === "profile" && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Clinic Details &amp; Emergency Banner</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Update reception contact channels, address, and alert notices</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 shadow-sm space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Clinic Name</label>
                  <input
                    type="text"
                    value={clinic.clinicName}
                    onChange={(e) => setClinic({ ...clinic, clinicName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={clinic.tagline}
                    onChange={(e) => setClinic({ ...clinic, tagline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Hotline / Landline Phone</label>
                  <input
                    type="text"
                    value={clinic.hotline}
                    onChange={(e) => setClinic({ ...clinic, hotline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">WhatsApp Booking Number (with country code)</label>
                  <input
                    type="text"
                    value={clinic.whatsappNumber}
                    onChange={(e) => setClinic({ ...clinic, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Physical Address &amp; Sector</label>
                <input
                  type="text"
                  value={clinic.address}
                  onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Emergency / Triage Top Banner Notice (Leave empty to hide)
                </label>
                <input
                  type="text"
                  value={clinic.emergencyNotice}
                  onChange={(e) => setClinic({ ...clinic, emergencyNotice: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. Sticky Bottom Save Bar: bg-stone-950/95 border-t border-stone-800 */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>All changes are cached locally until published to Cloudflare Edge.</span>
          </div>

          <button
            onClick={handleSaveToEdge}
            disabled={isSaving}
            className="w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:bg-stone-300 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-900/40 transition-all hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Synchronizing with Cloudflare..." : "Push Changes Live to Cloudflare"}</span>
          </button>
        </div>
      </div>

      {/* MODAL: RECEPTION QR STANDEE */}
      <ClinicQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        clinicName={clinic.clinicName}
        tagline={clinic.tagline}
        hotline={clinic.hotline}
      />

      {/* MODAL: ADD DOCTOR */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-stone-900 dark:text-stone-100">
            <h3 className="text-base font-bold mb-4">Add New Consultant / Doctor</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Usman Khalid"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Consultant Orthodontist"
                  value={newDoc.specialization}
                  onChange={(e) => setNewDoc({ ...newDoc, specialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Department</label>
                  <select
                    value={newDoc.categoryId}
                    onChange={(e) => setNewDoc({ ...newDoc, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  >
                    {clinic.categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Fee (PKR) *</label>
                  <input
                    type="text"
                    required
                    placeholder="2500"
                    value={newDoc.fee}
                    onChange={(e) => setNewDoc({ ...newDoc, fee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">Qualifications</label>
                <input
                  type="text"
                  placeholder="e.g. BDS, FCPS, RDS"
                  value={newDoc.qualification}
                  onChange={(e) => setNewDoc({ ...newDoc, qualification: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">Clinic Timings</label>
                <input
                  type="text"
                  placeholder="e.g. 5:00 PM - 9:00 PM (Mon - Fri)"
                  value={newDoc.timing}
                  onChange={(e) => setNewDoc({ ...newDoc, timing: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400 font-bold transition-colors"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-stone-900 dark:text-stone-100">
            <h3 className="text-base font-bold mb-4">Add Clinical Procedure / Service</h3>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">Procedure Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Root Canal Treatment (Molar)"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Category Tag</label>
                  <input
                    type="text"
                    placeholder="Dental Surgery"
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Price Estimate *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rs. 18,000"
                    value={newService.priceEstimate}
                    onChange={(e) => setNewService({ ...newService, priceEstimate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief explanation of procedure..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400 font-bold transition-colors"
                >
                  Save Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
