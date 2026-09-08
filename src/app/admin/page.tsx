"use client";

import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";

export default function AdminPlaceholderPage() {
  return (
    <div className="min-h-screen bg-[#07080B] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#0E121A] border border-zinc-800 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Clinic Staff Portal</h1>
        <p className="text-xs text-zinc-400 mb-6">
          Admin portal authentication and KV synchronization is coming in Phase 4.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    </div>
  );
}
