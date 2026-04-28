import React from "react";
import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faUser,
  faLock
} from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons/faCircleUser";
import bcrypt from "bcryptjs";

export default async function Page() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
  });

  if (!user) {
    redirect("/login");
  }

  async function updateProfile(formData: FormData) {
    "use server";
    const nama = formData.get("nama") as string;
    const kata_sandi_baru = formData.get("kata_sandi") as string;
    const file = formData.get("gambar") as File | null;

    let gambarPath = user?.gambar || null;

    // Handle Image Upload
    if (file && file.size > 0 && user) {
      const fs = await import("fs/promises");
      const path = await import("path");

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      try {
        await fs.access(uploadDir);
      } catch (e) {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const filename = `${user.id}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, buffer);
      gambarPath = `/uploads/${filename}`;
    }

    if (user && nama) {
      const updateData: any = {
        nama,
        gambar: gambarPath
      };

      // Hanya update password jika diisi (dan hash dengan bcrypt)
      if (kata_sandi_baru && kata_sandi_baru.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        updateData.kata_sandi = await bcrypt.hash(kata_sandi_baru, salt);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    revalidatePath("/profile");
    redirect("/presensi");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />

      {/* Profile Card */}
      <div className="card glass backdrop-blur-2xl relative z-10 w-full max-w-xl p-8 sm:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-white bg-linear-to-r from-white to-white/70">
            Profil Saya
          </h1>
          <p className="text-slate-400">Atur profil dan informasi akun Anda</p>
        </div>

        <form action={updateProfile} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="avatar">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] border-2 border-white/10 group-hover:border-orange-500/50 transition-all shadow-2xl overflow-hidden flex items-center justify-center">
                  {user.gambar ? (
                    <img
                      src={user.gambar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faCircleUser}
                      className="text-[6rem] sm:text-[8rem] text-slate-400"
                    />
                  )}
                </div>
              </div>
              <label
                className="absolute bottom-1 right-1 w-10 h-10 sm:w-12 sm:h-12 btn btn-primary glass rounded-2xl flex items-center justify-center text-white cursor-pointer hover:bg-orange-500 transition-all shadow-xl group-hover:scale-110 border-none"
                style={{ backgroundColor: "rgb(234 88 12)" }}
              >
                <FontAwesomeIcon
                  icon={faCamera}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <input
                  type="file"
                  name="gambar"
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Klik ikon kamera untuk ganti foto
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2 text-slate-300 font-medium">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-orange-500 w-3.5 h-3.5"
                  />
                  Nama User
                </span>
              </label>
              <input
                name="nama"
                type="text"
                defaultValue={user?.nama}
                placeholder="Nama Lengkap Anda"
                className="input input-bordered glass w-full text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2 text-slate-300 font-medium">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-orange-500 w-3.5 h-3.5"
                  />
                  Kata Sandi
                </span>
              </label>
              <input
                name="kata_sandi"
                type="password"
                placeholder="Kata Sandi"
                className="input input-bordered glass w-full text-white placeholder-white focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="btn btn-primary glass flex-1 h-14 font-bold text-white bg-orange-600 border-none hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-orange-600/20"
              style={{ backgroundColor: "rgb(234 88 12)" }}
            >
              Simpan Perubahan
            </button>
            <Link
              href="/presensi"
              className="btn btn-ghost glass flex-1 h-14 font-bold text-slate-200 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
