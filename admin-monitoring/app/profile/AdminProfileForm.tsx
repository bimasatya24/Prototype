"use client";

import React, { useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface AdminProfileFormProps {
  admin: {
    id: number;
    nama: string;
  };
  onUpdate: (formData: FormData) => Promise<any>;
}

export default function AdminProfileForm({ admin, onUpdate }: AdminProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await onUpdate(formData);
    });
  };

  return (
    <div className="card glass backdrop-blur-3xl relative z-10 w-full max-w-md p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 rounded-[2.5rem]">
      <div className="text-center mb-10 mt-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600/20 mb-6 shadow-inner border border-indigo-500/20">
          <FontAwesomeIcon icon={faUserGear} className="w-10 h-10 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-black mb-2 bg-clip-text text-white bg-linear-to-r from-white to-white/70 uppercase tracking-tighter">
          Profil Admin
        </h1>
        <p className="text-slate-400 text-sm font-medium">Perbarui informasi akun Admin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-[10px] font-black text-slate-400 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
              Nama Admin
            </span>
          </label>
          <input
            name="nama"
            type="text"
            defaultValue={admin.nama}
            placeholder="Masukkan nama baru"
            className="input input-bordered glass w-full h-14 bg-white/3 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/6 rounded-2xl transition-all font-bold"
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-[10px] font-black text-slate-400 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-indigo-500" />
              Kata Sandi Baru
            </span>
          </label>
          <input
            name="kata_sandi"
            type="password"
            placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
            className="input input-bordered glass w-full h-14 bg-white/3 border-white/10 text-white placeholder:text-white focus:border-indigo-500 focus:bg-white/6 rounded-2xl transition-all font-bold"
          />
        </div>

        <div className="pt-6 flex flex-row gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary glass flex-1 h-14 text-white bg-indigo-600 border-none hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 group rounded-2xl tracking-widest"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              <>Simpan Perubahan</>
            )}
          </button>

          <Link
            href="/monitoring"
            className="btn btn-ghost glass flex-1 h-14 flex items-center justify-center text-slate-300 border border-white/10 hover:bg-white/5 transition-all active:scale-95 rounded-2xl tracking-widest"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
