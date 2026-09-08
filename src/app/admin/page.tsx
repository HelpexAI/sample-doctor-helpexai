"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  LogOut,
  Save,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  X,
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
  MapPin,
  Navigation,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ClinicData, Doctor, ClinicService, DoctorCategory } from "@/types/clinic";
import { defaultClinicData } from "@/data/defaultClinicData";
import { formatTime12h } from "@/utils/doctorStatus";
import ThemeToggle from "@/components/ThemeToggle";
import ClinicQRModal from "@/components/admin/ClinicQRModal";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function extractMapEmbedUrl(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/<iframe.*?src=["'](.*?)["']/i);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

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
  const [showMapGuide, setShowMapGuide] = useState<boolean>(false);

  // QR Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  // Modal State for Doctor (Add or Edit)
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState<boolean>(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [startTime, setStartTime] = useState<string>("16:00");
  const [endTime, setEndTime] = useState<string>("21:00");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const [newDoc, setNewDoc] = useState<Doctor>({
    id: "",
    name: "",
    qualification: "",
    specialization: "",
    categoryId: "",
    experience: "",
    fee: "",
    gender: "male",
    onlyAvailableInSlot: false,
    timing: "",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
    isAvailable: true,
  });

  // Modal State for Service (Add or Edit)
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState<boolean>(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newService, setNewService] = useState<ClinicService>({
    id: "",
    title: "",
    category: "",
    priceEstimate: "",
    description: "",
    duration: "30 Mins",
  });

  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // Modal State for Themed Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "doctor" | "service" | "category";
    id: string;
    name: string;
    details?: string;
  } | null>(null);

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

  // --- SAVE TO CLOUDFLARE EDGE KV DIRECTLY ---
  const handleSaveToEdge = async (clinicToSave = clinic) => {
    setIsSaving(true);
    setStatusMessage(null);

    const token =
      sessionToken ||
      (typeof window !== "undefined" ? sessionStorage.getItem("helpex_clinic_token") : "") ||
      "";

    try {
      const res = await fetch(`${apiUrl}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clinicToSave),
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

  // --- DOCTOR MODAL HELPERS ---
  const handleOpenAddDoctor = () => {
    setEditingDoctorId(null);
    setNewDoc({
      id: "",
      name: "",
      qualification: "",
      specialization: "",
      categoryId: clinic.categories[0]?.id || "",
      experience: "",
      fee: "",
      gender: "male",
      onlyAvailableInSlot: false,
      timing: "",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
      isAvailable: true,
    });
    setSelectedDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    setStartTime("16:00");
    setEndTime("21:00");
    setIsNewDocModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setNewDoc({
      id: doc.id,
      name: doc.name,
      qualification: doc.qualification,
      specialization: doc.specialization,
      categoryId: doc.categoryId || clinic.categories[0]?.id || "",
      experience: doc.experience || "",
      fee: doc.fee,
      gender: doc.gender || "male",
      onlyAvailableInSlot: Boolean(doc.onlyAvailableInSlot),
      timing: doc.timing || "",
      avatar: doc.avatar || (doc.gender === "female" ? "https://images.unsplash.com/photo-1594824813593-906560bc9f1c?w=400&q=80" : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80"),
      isAvailable: doc.isAvailable,
    });
    setSelectedDays(
      doc.schedule?.days && doc.schedule.days.length > 0
        ? doc.schedule.days
        : ["Mon", "Tue", "Wed", "Thu", "Fri"]
    );
    setStartTime(doc.schedule?.startTime || "16:00");
    setEndTime(doc.schedule?.endTime || "21:00");
    setIsNewDocModalOpen(true);
  };

  // --- SERVICE MODAL HELPERS ---
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setNewService({
      id: "",
      title: "",
      category: clinic.categories[0]?.name || "Clinical Care",
      priceEstimate: "",
      description: "",
      duration: "30 Mins",
    });
    setIsNewServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ClinicService) => {
    setEditingServiceId(srv.id);
    setNewService({
      id: srv.id,
      title: srv.title,
      category: srv.category,
      priceEstimate: srv.priceEstimate,
      description: srv.description || "",
      duration: srv.duration || "30 Mins",
    });
    setIsNewServiceModalOpen(true);
  };

  // --- CMS STATE MUTATIONS ---
  const handleToggleDoctorAvailability = async (docId: string) => {
    const updated = {
      ...clinic,
      doctors: clinic.doctors.map((d) =>
        d.id === docId ? { ...d, isAvailable: !d.isAvailable } : d
      ),
    };
    setClinic(updated);
    await handleSaveToEdge(updated);
  };

  const handleDoctorFeeChange = (docId: string, newFee: string) => {
    setClinic((prev) => ({
      ...prev,
      doctors: prev.doctors.map((d) =>
        d.id === docId ? { ...d, fee: newFee } : d
      ),
    }));
  };

  const handleDoctorFeeBlur = async () => {
    await handleSaveToEdge(clinic);
  };

  // Save Doctor (Create or Edit) directly to Cloudflare
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name.trim() || !newDoc.specialization.trim() || !newDoc.fee.trim()) {
      setStatusMessage({ type: "error", text: "Please fill required fields (Name, Specialization, Fee)." });
      return;
    }
    if (selectedDays.length === 0) {
      setStatusMessage({ type: "error", text: "Please select at least one consultation day." });
      return;
    }

    const timingString = `${selectedDays.join(", ")} (${formatTime12h(startTime)} - ${formatTime12h(endTime)})`;

    let updatedDoctors: Doctor[];

    if (editingDoctorId) {
      updatedDoctors = clinic.doctors.map((d) =>
        d.id === editingDoctorId
          ? {
              ...d,
              name: newDoc.name.trim(),
              qualification: newDoc.qualification.trim(),
              specialization: newDoc.specialization.trim(),
              categoryId: newDoc.categoryId || clinic.categories[0]?.id || "general",
              fee: newDoc.fee.trim(),
              gender: newDoc.gender || "male",
              onlyAvailableInSlot: Boolean(newDoc.onlyAvailableInSlot),
              experience: newDoc.experience.trim(),
              avatar:
                newDoc.avatar.trim() ||
                (newDoc.gender === "female"
                  ? "https://images.unsplash.com/photo-1594824813593-906560bc9f1c?w=400&q=80"
                  : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80"),
              schedule: {
                days: selectedDays,
                startTime: startTime,
                endTime: endTime,
              },
              timingDisplay: timingString,
              timing: timingString,
            }
          : d
      );
    } else {
      const createdDoc: Doctor = {
        ...newDoc,
        id: "doc-" + Date.now(),
        categoryId: newDoc.categoryId || (clinic.categories[0]?.id || "general"),
        gender: newDoc.gender || "male",
        onlyAvailableInSlot: Boolean(newDoc.onlyAvailableInSlot),
        avatar:
          newDoc.avatar.trim() ||
          (newDoc.gender === "female"
            ? "https://images.unsplash.com/photo-1594824813593-906560bc9f1c?w=400&q=80"
            : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80"),
        schedule: {
          days: selectedDays,
          startTime: startTime,
          endTime: endTime,
        },
        timingDisplay: timingString,
        timing: timingString,
        isAvailable: true,
      };
      updatedDoctors = [createdDoc, ...clinic.doctors];
    }

    const updated = {
      ...clinic,
      doctors: updatedDoctors,
    };

    setClinic(updated);
    setIsNewDocModalOpen(false);
    setEditingDoctorId(null);
    await handleSaveToEdge(updated);
  };

  // Save Service (Create or Edit) directly to Cloudflare
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title.trim() || !newService.priceEstimate.trim()) {
      setStatusMessage({ type: "error", text: "Please enter service title and price estimate." });
      return;
    }

    let updatedServices: ClinicService[];

    if (editingServiceId) {
      updatedServices = (clinic.services || []).map((s) =>
        s.id === editingServiceId
          ? {
              ...s,
              title: newService.title.trim(),
              category: newService.category.trim() || (clinic.categories[0]?.name || "Clinical Care"),
              priceEstimate: newService.priceEstimate.trim(),
              description: newService.description.trim(),
              duration: newService.duration.trim() || "30 Mins",
            }
          : s
      );
    } else {
      const createdService: ClinicService = {
        ...newService,
        id: "srv-" + Date.now(),
        category: newService.category.trim() || (clinic.categories[0]?.name || "Clinical Care"),
      };
      updatedServices = [...(clinic.services || []), createdService];
    }

    const updated = {
      ...clinic,
      services: updatedServices,
    };

    setClinic(updated);
    setIsNewServiceModalOpen(false);
    setEditingServiceId(null);
    await handleSaveToEdge(updated);
  };

  // Add Category directly to Cloudflare
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat: DoctorCategory = {
      id: newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: newCategoryName.trim(),
    };
    const updated = {
      ...clinic,
      categories: [...clinic.categories, newCat],
    };
    setClinic(updated);
    setNewCategoryName("");
    await handleSaveToEdge(updated);
  };

  // Delete Category / Doctor / Service directly from Cloudflare via Confirmation Modal
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    let updated: ClinicData = { ...clinic };
    const targetName = deleteTarget.name;

    if (deleteTarget.type === "doctor") {
      updated = {
        ...clinic,
        doctors: clinic.doctors.filter((d) => d.id !== deleteTarget.id),
      };
    } else if (deleteTarget.type === "service") {
      updated = {
        ...clinic,
        services: (clinic.services || []).filter((s) => s.id !== deleteTarget.id),
      };
    } else if (deleteTarget.type === "category") {
      updated = {
        ...clinic,
        categories: clinic.categories.filter((c) => c.id !== deleteTarget.id),
      };
    }

    setClinic(updated);
    setDeleteTarget(null);
    await handleSaveToEdge(updated);
    setStatusMessage({
      type: "success",
      text: `Deleted "${targetName}" directly from Cloudflare Edge!`,
    });
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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 dark:bg-[#0C0A09] dark:text-stone-100 pb-12 transition-colors">
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
                onClick={handleOpenAddDoctor}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 font-bold text-xs shadow-md shadow-amber-900/20 transition-all cursor-pointer"
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
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{doc.name}</h3>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">{doc.specialization}</p>
                            {doc.gender && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 capitalize">
                                {doc.gender}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">{doc.qualification}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditDoctor(doc)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:text-stone-400 dark:hover:text-amber-400 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="Edit Doctor Profile"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: "doctor",
                              id: doc.id,
                              name: doc.name,
                              details: `${doc.specialization} • ${doc.qualification}`,
                            })
                          }
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="Delete Doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                            onBlur={handleDoctorFeeBlur}
                            className="w-full pl-10 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-bold focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-500 dark:text-stone-400 block">Schedule:</span>
                        <p className="text-xs text-stone-800 dark:text-stone-300 font-medium">
                          {doc.timingDisplay || doc.timing || (doc.schedule ? `${doc.schedule.days.join(", ")} (${formatTime12h(doc.schedule.startTime)} - ${formatTime12h(doc.schedule.endTime)})` : "Not set")}
                        </p>
                        {doc.onlyAvailableInSlot && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                            <Clock className="w-3 h-3" />
                            <span>Strict slot availability active</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      onClick={() => handleToggleDoctorAvailability(doc.id)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                onClick={handleOpenAddService}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 font-bold text-xs shadow-md shadow-amber-900/20 transition-all cursor-pointer"
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
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditService(srv)}
                          className="p-1 rounded text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:text-stone-400 dark:hover:text-amber-400 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="Edit Procedure"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: "service",
                              id: srv.id,
                              name: srv.title,
                              details: `${srv.category} • ${srv.priceEstimate}`,
                            })
                          }
                          className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          title="Delete Procedure"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

                  <div className="mt-3 pt-2">
                    <button
                      onClick={() => handleOpenEditService(srv)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Procedure Details</span>
                    </button>
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
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSaving ? "Adding..." : "Add Category"}</span>
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
                    onClick={() =>
                      setDeleteTarget({
                        type: "category",
                        id: cat.id,
                        name: cat.name,
                        details: "Specialty Department",
                      })
                    }
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Delete Category"
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Clinic Details &amp; Emergency Banner</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Update reception contact channels, address, and alert notices</p>
              </div>
              <button
                onClick={() => handleSaveToEdge()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:bg-stone-300 text-stone-950 font-extrabold text-xs shadow-md shadow-amber-900/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save & Push to Cloudflare"}</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 shadow-sm space-y-5 text-xs">
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
                  placeholder="e.g., Emergency Triage & Casualty Wing Active 24/7"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                />
              </div>

              {/* Google Maps Branch Embed & Directions Settings */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Google Maps Branch Embed &amp; Directions
                      </h3>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Display an interactive map on the patient storefront with one-click navigation
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMapGuide(!showMapGuide)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{showMapGuide ? "Hide Guide" : "How to Get Embed Code"}</span>
                    {showMapGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Step-by-Step Guide Accordion */}
                {showMapGuide && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-500/20 space-y-3 text-stone-800 dark:text-stone-200 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Step-by-Step Guide: How to Get Your Clinic&apos;s Google Maps Embed</span>
                    </div>

                    <ol className="text-xs space-y-2 list-decimal list-inside text-stone-700 dark:text-stone-300">
                      <li className="leading-relaxed">
                        <span className="font-semibold">Search for your Clinic:</span> Go to{" "}
                        <a
                          href="https://maps.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 dark:text-amber-400 underline font-bold inline-flex items-center gap-0.5"
                        >
                          Google Maps <ExternalLink className="w-2.5 h-2.5" />
                        </a>{" "}
                        and search for your clinic branch name or address.
                      </li>
                      <li className="leading-relaxed">
                        <span className="font-semibold">Click &ldquo;Share&rdquo;:</span> In the place details card on the left panel, click the{" "}
                        <span className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[11px]">Share</span> button.
                      </li>
                      <li className="leading-relaxed">
                        <span className="font-semibold">Switch to &ldquo;Embed a map&rdquo;:</span> In the popup dialog, click the tab labeled{" "}
                        <span className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[11px]">Embed a map</span>.
                      </li>
                      <li className="leading-relaxed">
                        <span className="font-semibold">Click &ldquo;COPY HTML&rdquo;:</span> Click the{" "}
                        <span className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 font-semibold text-amber-900 dark:text-amber-200">
                          COPY HTML
                        </span>{" "}
                        button to copy the embed snippet to your clipboard.
                      </li>
                      <li className="leading-relaxed">
                        <span className="font-semibold">Paste Below:</span> Paste the code directly into the field below. Our smart parser will automatically extract the clean embed URL for you!
                      </li>
                    </ol>
                  </div>
                )}

                {/* Map Embed Input */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Google Maps Embed Code or URL
                  </label>
                  <textarea
                    rows={2}
                    value={clinic.mapEmbedUrl || ""}
                    onChange={(e) => {
                      const extracted = extractMapEmbedUrl(e.target.value);
                      setClinic({ ...clinic, mapEmbedUrl: extracted });
                    }}
                    placeholder="Paste full <iframe ...></iframe> HTML snippet or direct embed link (https://www.google.com/maps/embed?...)"
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                    Accepts either the full <code className="font-mono">&lt;iframe ...&gt;&lt;/iframe&gt;</code> HTML code from Google Maps or a direct embed URL.
                  </p>
                </div>

                {/* Optional Custom Directions URL */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Custom Directions / Navigation Link (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clinic.mapDirectionsUrl || ""}
                      onChange={(e) => setClinic({ ...clinic, mapDirectionsUrl: e.target.value })}
                      placeholder={`e.g., https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        clinic.address || "Clinic Islamabad"
                      )}`}
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                    />
                    {clinic.mapDirectionsUrl && (
                      <a
                        href={clinic.mapDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Test</span>
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                    Leave blank to auto-generate directions using your clinic name &amp; physical address.
                  </p>
                </div>

                {/* Live Preview Container */}
                {clinic.mapEmbedUrl && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Live Embed Preview</span>
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        Location: {clinic.address || "Clinic Branch"}
                      </span>
                    </div>
                    <div className="h-52 w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900">
                      <iframe
                        title="Admin Map Preview"
                        src={clinic.mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800">
                <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Only clicked changes are pushed live to Cloudflare KV.</span>
                </p>
                <button
                  onClick={() => handleSaveToEdge()}
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:bg-stone-300 text-stone-950 font-extrabold text-xs shadow-md shadow-amber-900/30 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving Changes..." : "Save Settings & Push to Cloudflare"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: RECEPTION QR STANDEE */}
      <ClinicQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        clinicName={clinic.clinicName}
        tagline={clinic.tagline}
        hotline={clinic.hotline}
      />

      {/* MODAL: ADD / EDIT DOCTOR */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">
                {editingDoctorId ? "Edit Consultant / Doctor" : "Add New Consultant / Doctor"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsNewDocModalOpen(false);
                  setEditingDoctorId(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Doctor Name *</label>
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
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Doctor Gender *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const isDefaultCurrentAvatar =
                          !newDoc.avatar ||
                          newDoc.avatar.includes("1622253692010") ||
                          newDoc.avatar.includes("1594824813593") ||
                          newDoc.avatar.includes("1559839734");
                        setNewDoc({
                          ...newDoc,
                          gender: "male",
                          avatar: isDefaultCurrentAvatar
                            ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80"
                            : newDoc.avatar,
                        });
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        (newDoc.gender || "male") === "male"
                          ? "bg-amber-500 text-stone-950 shadow-sm shadow-amber-900/20"
                          : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      <span>👨 Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const isDefaultCurrentAvatar =
                          !newDoc.avatar ||
                          newDoc.avatar.includes("1622253692010") ||
                          newDoc.avatar.includes("1594824813593") ||
                          newDoc.avatar.includes("1559839734");
                        setNewDoc({
                          ...newDoc,
                          gender: "female",
                          avatar: isDefaultCurrentAvatar
                            ? "https://images.unsplash.com/photo-1594824813593-906560bc9f1c?w=400&q=80"
                            : newDoc.avatar,
                        });
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        newDoc.gender === "female"
                          ? "bg-amber-500 text-stone-950 shadow-sm shadow-amber-900/20"
                          : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      <span>👩 Female</span>
                    </button>
                  </div>
                </div>
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 12+ Years"
                    value={newDoc.experience || ""}
                    onChange={(e) => setNewDoc({ ...newDoc, experience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">Avatar / Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newDoc.avatar}
                  onChange={(e) => setNewDoc({ ...newDoc, avatar: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1.5 font-medium">
                  Consultation Days * ({selectedDays.length} selected)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-stone-950 shadow-sm shadow-amber-900/20"
                            : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-100/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400">
                <span className="font-semibold text-stone-700 dark:text-stone-300">Schedule Preview: </span>
                {selectedDays.length > 0
                  ? `${selectedDays.join(", ")} (${formatTime12h(startTime)} - ${formatTime12h(endTime)})`
                  : "Please select at least one day"}
              </div>

              {/* TOGGLE: SHOW UNAVAILABLE OTHER THAN TIME SLOT */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800">
                <label className="flex items-start justify-between gap-3 cursor-pointer">
                  <div className="select-none">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block text-xs">
                      Show unavailable other than time slot
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5 leading-snug">
                      When checked, the doctor will strictly show as unavailable on the patient storefront outside their consultation day and time slot.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newDoc.onlyAvailableInSlot || false}
                    onChange={(e) => setNewDoc({ ...newDoc, onlyAvailableInSlot: e.target.checked })}
                    className="w-4 h-4 rounded mt-0.5 text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-stone-700 cursor-pointer shrink-0"
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewDocModalOpen(false);
                    setEditingDoctorId(null);
                  }}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:bg-stone-300 text-stone-950 font-bold transition-all shadow-md shadow-amber-900/20 cursor-pointer"
                >
                  {isSaving ? "Publishing..." : editingDoctorId ? "Update & Push to Cloudflare" : "Save & Push to Cloudflare"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold">
                  {editingServiceId ? "Edit Clinical Procedure / Service" : "Add Clinical Procedure / Service"}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {editingServiceId
                    ? "Update pricing estimate, department, or procedure duration"
                    : "Add a transparent treatment estimate to the storefront"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewServiceModalOpen(false);
                  setEditingServiceId(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Procedure Title *</label>
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
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Department / Category</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  >
                    {clinic.categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Price Estimate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rs. 18,000"
                    value={newService.priceEstimate}
                    onChange={(e) => setNewService({ ...newService, priceEstimate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Duration / Time Required *</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {["15 Mins", "30 Mins", "45 Mins", "60 Mins", "90 Mins", "Multiple Sessions"].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setNewService({ ...newService, duration: dur })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        newService.duration === dur
                          ? "bg-amber-500 text-stone-950 shadow-sm shadow-amber-900/20"
                          : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:text-stone-900"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="e.g. 30 Mins or 2-3 Visits"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Description / Details</label>
                <textarea
                  rows={3}
                  placeholder="Explain what is included in the treatment, patient requirements, or procedure steps..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 dark:focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewServiceModalOpen(false);
                    setEditingServiceId(null);
                  }}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:bg-stone-300 text-stone-950 font-bold transition-all shadow-md shadow-amber-900/20 cursor-pointer"
                >
                  {isSaving ? "Publishing..." : editingServiceId ? "Update & Push to Cloudflare" : "Save & Push to Cloudflare"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THEMED DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-stone-200 dark:bg-[#1C1917] dark:border-stone-800 rounded-3xl w-full max-w-sm sm:max-w-md p-6 shadow-2xl text-stone-900 dark:text-stone-100 relative">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-stone-900 dark:text-stone-100 mb-1">
              {deleteTarget.type === "doctor"
                ? "Remove Doctor Profile?"
                : deleteTarget.type === "service"
                ? "Remove Clinical Procedure?"
                : "Remove Specialty Category?"}
            </h3>

            <p className="text-xs text-stone-500 dark:text-stone-400 text-center mb-4">
              This will immediately delete this entry from Cloudflare Edge KV and remove it from the patient storefront.
            </p>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400 uppercase tracking-wider">
                  {deleteTarget.type}
                </span>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{deleteTarget.name}</p>
              </div>
              {deleteTarget.details && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 pl-1">
                  {deleteTarget.details}
                </p>
              )}
            </div>

            {deleteTarget.type === "category" && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-2.5 rounded-xl mb-4">
                Note: Doctors assigned to this department will not be deleted, but will no longer be grouped under this category.
              </p>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold text-xs shadow-md shadow-red-900/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSaving ? "Deleting..." : "Delete from Cloudflare"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
