"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Download, QrCode, Sparkles } from "lucide-react";

interface ClinicQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
  tagline?: string;
  hotline?: string;
}

export default function ClinicQRModal({
  isOpen,
  onClose,
  clinicName,
  tagline = "Advanced Dental, Aesthetic & Family Healthcare",
  hotline = "051-8899770",
}: ClinicQRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    const generateQR = async () => {
      try {
        const publicUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/`
            : "https://sample-clinic.helpexai.com/";

        // 2. QR generation dark color parameter: #1C1917 (Deep Obsidian Stone) or #7C2D12 (Deep Terracotta)
        const dataUrl = await QRCode.toDataURL(publicUrl, {
          width: 500,
          margin: 1,
          color: {
            dark: "#1C1917",
            light: "#FFFFFF",
          },
        });

        setQrDataUrl(dataUrl);

        // Render Canvas Standee
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 800;
        canvas.height = 1100;

        // 3. Canvas card rendering colors:
        // Card Background fill: #0C0A09 (Deep Basalt)
        ctx.fillStyle = "#0C0A09";
        ctx.fillRect(0, 0, 800, 1100);

        // Top accent stripe: #D97706 (Claude Terracotta)
        ctx.fillStyle = "#D97706";
        ctx.fillRect(0, 0, 800, 18);

        // Clinic Name
        ctx.fillStyle = "#F5F5F4"; // stone-100
        ctx.font = "bold 38px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(clinicName, 400, 120);

        // Subtitle text: #FBBF24
        ctx.fillStyle = "#FBBF24";
        ctx.font = "600 20px sans-serif";
        ctx.fillText(tagline, 400, 165);

        // Badge fill: #D97706, Badge text: #0C0A09
        const badgeWidth = 340;
        const badgeHeight = 44;
        const badgeX = 400 - badgeWidth / 2;
        const badgeY = 210;

        ctx.fillStyle = "#D97706";
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 22);
        ctx.fill();

        ctx.fillStyle = "#0C0A09";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("SCAN TO BOOK APPOINTMENT", 400, badgeY + 28);

        // White QR Container Card
        const qrBoxSize = 480;
        const qrBoxX = 400 - qrBoxSize / 2;
        const qrBoxY = 290;

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
        ctx.fill();

        // Draw QR Image
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, qrBoxX + 40, qrBoxY + 40, 400, 400);

          // Footer Notice
          ctx.fillStyle = "#A8A29E"; // stone-400
          ctx.font = "500 18px sans-serif";
          ctx.fillText("No waiting on hold • Choose doctor & time slot", 400, 830);

          ctx.fillStyle = "#F5F5F4"; // stone-100
          ctx.font = "bold 22px sans-serif";
          ctx.fillText(`Reception Helpline: ${hotline}`, 400, 880);

          ctx.fillStyle = "#78716C"; // stone-500
          ctx.font = "14px sans-serif";
          ctx.fillText("Powered by Helpex Digital Clinic Booking", 400, 930);
        };
        img.src = dataUrl;
      } catch (err) {
        console.error("Failed generating QR code", err);
      }
    };

    generateQR();
  }, [isOpen, clinicName, tagline, hotline]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${clinicName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-reception-standee.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      {/* 1. Modal styling: bg-[#1C1917] border-stone-800 */}
      <div className="bg-[#1C1917] border border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative my-8 text-stone-100">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">Reception Desk QR Standee</h3>
              <p className="text-xs text-stone-400">Display at reception for walk-in patient triage &amp; booking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-xl border border-stone-800 bg-[#0C0A09]">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          <div className="mt-6 w-full flex items-center gap-3">
            <button
              onClick={handleDownloadPNG}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-extrabold text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Standee (High-Res PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
