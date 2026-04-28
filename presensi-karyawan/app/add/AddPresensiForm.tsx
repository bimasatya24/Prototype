"use client";

import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faSync,
  faUser,
  faBriefcase,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface User {
  id: number;
  nama: string;
}

interface AddPresensiFormProps {
  user: User;
  onAddPresensi: (formData: FormData) => Promise<void>;
}

export default function AddPresensiForm({ user, onAddPresensi }: AddPresensiFormProps) {
  const [status, setStatus] = useState("Hadir");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError(null);
    setLocationError(null);
    setIsCameraOpen(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setLocationError("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diberikan.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Browser Anda tidak mendukung geolokasi.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (location) {
          const text = `Lat: ${location.latitude.toFixed(6)}, Long: ${location.longitude.toFixed(6)}`;
          const timeText = new Date().toLocaleString("id-ID");

          context.fillStyle = "rgba(0, 0, 0, 0.5)";
          context.fillRect(0, canvas.height - 50, canvas.width, 50);

          context.font = "14px sans-serif";
          context.fillStyle = "white";
          context.fillText(timeText, 10, canvas.height - 30);
          context.fillText(text, 10, canvas.height - 10);
        }

        const dataUrl = canvas.toDataURL("image/jpeg");
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const resetPhoto = () => {
    setPhoto(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!photo) {
      setError("Silakan ambil foto terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("gambar", photo);
      if (location) {
        formData.append("latitude", location.latitude.toString());
        formData.append("longitude", location.longitude.toString());
      }
      await onAddPresensi(formData);
    } catch (err: any) {
      // If the error is a redirect, we don't need to show an error message
      if (err.message === "NEXT_REDIRECT") return;

      console.error("Error submitting attendance:", err);
      setError("Gagal menyimpan presensi. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error glass bg-red-500/20 border-red-500/50 text-red-200 text-sm mb-4">
          <span>{error}</span>
        </div>
      )}
      {locationError && (
        <div className="alert alert-warning glass bg-amber-500/20 border-amber-500/50 text-amber-200 text-sm mb-4">
          <span>{locationError}</span>
        </div>
      )}

      {/* Nama User (Read Only) */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text flex items-center gap-2 text-slate-300 font-medium">
            <FontAwesomeIcon icon={faUser} className="text-orange-500 w-3.5 h-3.5" />
            Nama User
          </span>
        </label>
        <input
          type="text"
          value={user.nama}
          readOnly
          className="input input-bordered glass w-full text-white cursor-not-allowed font-medium"
        />
      </div>

      {/* Pilih Status */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text flex items-center gap-2 text-slate-300 font-medium">
            <FontAwesomeIcon icon={faBriefcase} className="text-orange-500 w-3.5 h-3.5" />
            Pilih Status
          </span>
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select select-bordered glass w-full text-white focus:ring-2 focus:ring-orange-500/50 transition-all font-medium cursor-pointer"
          required
        >
          <option value="Hadir" className="bg-slate-900">Hadir</option>
          <option value="Sakit" className="bg-slate-900">Sakit</option>
          <option value="Izin" className="bg-slate-900">Izin</option>
        </select>
      </div>

      {/* Camera / Photo Section */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text flex items-center gap-2 text-slate-300 font-medium">
            <FontAwesomeIcon icon={faCamera} className="text-orange-500 w-3.5 h-3.5" />
            Foto Presensi
          </span>
        </label>

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900/50 border border-white/10 flex items-center justify-center">
          {!isCameraOpen && !photo && (
            <button
              type="button"
              onClick={startCamera}
              className="btn btn-ghost glass flex flex-col items-center gap-1 text-slate-300 hover:text-white group"
            >
              <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center group-hover:bg-orange-600/40 transition-all">
                <FontAwesomeIcon icon={faCamera} className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-sm font-medium">Buka Kamera</span>
            </button>
          )}

          {isCameraOpen && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button
                  type="button"
                  onClick={takePhoto}
                  className="btn btn-circle btn-lg bg-orange-600 hover:bg-orange-500 border-none shadow-lg active:scale-90 transition-all"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white" />
                </button>
              </div>
            </>
          )}

          {photo && (
            <>
              <img
                src={photo}
                alt="Captured attendance"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={resetPhoto}
                className="absolute top-4 right-4 btn btn-circle btn-sm glass border-white/20 text-white hover:bg-white/20"
              >
                <FontAwesomeIcon icon={faSync} className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
        {isCameraOpen && !location && !locationError && (
          <p className="text-xs text-orange-400 mt-2 flex items-center gap-1 animate-pulse">
            <FontAwesomeIcon icon={faSync} spin className="w-3.5 h-3.5" />
            Sedang mendapatkan titik koordinat lokasi
          </p>
        )}
        {photo && location && (
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5" />
            Titik koordinat berhasil disematkan.
          </p>
        )}
      </div>

      {/* Submit / Action Buttons */}
      <div className="pt-6 flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={!photo || isLoading}
          className={`btn btn-primary glass flex-1 h-14 font-bold text-white border-none shadow-lg transition-all active:scale-95 ${!photo || isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-500 shadow-orange-600/20"
            }`}
          style={{ backgroundColor: photo && !isLoading ? 'rgb(234 88 12)' : 'rgba(234, 88, 12, 0.5)' }}
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
              Simpan Presensi
            </>
          )}
        </button>
        <Link
          href="/presensi"
          className="btn btn-ghost glass flex-1 h-14 font-bold text-slate-200 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
