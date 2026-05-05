'use client'

import Link from "next/link";
import React, { useActionState } from "react";
import { changePasswordAction } from "./actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faUser, faSave, faEnvelope } from "@fortawesome/free-solid-svg-icons";


const initialState = {
  error: null as string | null,
};

export default function LupaPassword() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);


  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />

      {/* Change Password Card */}
      <div className="card glass backdrop-blur-2xl relative z-10 w-full max-w-md p-8 sm:p-10 shadow-2xl transform transition-all duration-700">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-white bg-linear-to-r from-white to-white/70">
            Ubah Password
          </h1>
          <p className="text-slate-400">Masukkan Nama User dan Kata Sandi Baru Anda</p>
        </div>

        {state?.error && (
          <div className="alert alert-error glass mb-6 transition-all animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text flex items-center gap-2 text-slate-300 font-medium">
                <FontAwesomeIcon icon={faUser} className="text-orange-500 w-3.5 h-3.5" />
                Nama User
              </span>
            </label>
            <input
              name="nama"
              type="text"
              placeholder="Contoh: Andi"
              className="input input-bordered glass w-full text-white placeholder-white focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text flex items-center gap-2 text-slate-300 font-medium">
                <FontAwesomeIcon icon={faEnvelope} className="text-orange-500 w-3.5 h-3.5" />
                Email
              </span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="example@gmail.com"
              className="input input-bordered glass w-full text-white placeholder-white/70 focus:outline-none bg-white/5 transition-all duration-200"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text flex items-center gap-2 text-white font-medium">
                <FontAwesomeIcon icon={faKey} className="text-orange-500 w-3.5 h-3.5" />
                Kata Sandi Baru
              </span>
            </label>
            <input
              name="kata_sandi_baru"
              type="password"
              placeholder="••••••••"
              className="input input-bordered glass w-full text-white placeholder-white focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
              required
            />
          </div>

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary glass w-full font-bold text-white bg-orange-600 border-none hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <span className="loading loading-spinner text-white"></span>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Simpan
                </>
              )}
            </button>
            <Link
              href="/"
              className="btn btn-ghost glass w-full font-bold text-slate-200 border border-white/10 hover:bg-white/5 transition-all active:scale-95"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
