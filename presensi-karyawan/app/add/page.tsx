import React from "react";
import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import AddPresensiForm from "./AddPresensiForm";
import { Status } from "@prisma/client";

export default async function Page() {
  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get("userId")?.value;

  if (!cookieUserId) {
    redirect("/login");
  }

  const userId = parseInt(cookieUserId, 10);
  if (isNaN(userId)) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  async function addPresensi(formData: FormData) {
    "use server";
    const statusValue = formData.get("status")?.toString() as Status;
    const gambar = formData.get("gambar")?.toString();
    const latitudeForm = formData.get("latitude")?.toString();
    const longitudeForm = formData.get("longitude")?.toString();

    if (statusValue && ["Hadir", "Sakit", "Izin", "Alpha"].includes(statusValue)) {
      let finalStatus = statusValue;
      const latitude = latitudeForm ? parseFloat(latitudeForm) : null;
      const longitude = longitudeForm ? parseFloat(longitudeForm) : null;

      // Titik Koordinat Pabrik Roti Bread Gift
      const OFFICE_LAT = -5.3913617026647005;
      const OFFICE_LONG = 105.29124486592886;

      if (finalStatus === "Hadir" && latitude !== null && longitude !== null) {
        // Haversine formula untuk menghitung jarak dalam meter
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371e3; // Radius bumi dalam meter
        const dLat = toRad(OFFICE_LAT - latitude);
        const dLon = toRad(OFFICE_LONG - longitude);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(latitude)) * Math.cos(toRad(OFFICE_LAT)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Jika jarak lebih dari 100 meter, anggap Alpha
        if (distance > 100) {
          finalStatus = "Alpha";
        }
      }

      await prisma.presensi.create({
        data: {
          status: finalStatus,
          gambar: gambar,
          latitude: latitude,
          longitude: longitude,
          userID: user!.id,
        },
      });

      revalidatePath("/presensi");
      redirect("/presensi");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />

      {/* Form Card */}
      <div className="card glass backdrop-blur-2xl relative z-10 w-full max-w-md p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-600/20 mb-4 shadow-inner">
            <FontAwesomeIcon icon={faCheckCircle} className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-white bg-linear-to-r from-white to-white/70">
            Isi Presensi
          </h1>
          <p className="text-slate-400">Konfirmasi kehadiran Anda hari ini</p>
        </div>

        <AddPresensiForm user={user} onAddPresensi={addPresensi} />
      </div>
    </main>
  );
}
