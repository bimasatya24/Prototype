'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserShield } from '@fortawesome/free-solid-svg-icons/faUserShield'
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons/faRightToBracket'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft'
import { adminLoginAction } from './actions'

export default function AdminLogin() {
    const [state, action, isPending] = useActionState(adminLoginAction, null)
    const router = useRouter()

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#0a0f1d] flex items-center justify-center p-6">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

            {/* Back to Home Button */}
            <div className="absolute top-8 left-8 z-20">
                <Link
                    href="/"
                    className="btn btn-ghost glass btn-sm gap-2 text-slate-400 hover:text-white transition-all"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                    Kembali
                </Link>
            </div>

            {/* Admin Login Card */}
            <div className="relative z-10 w-full max-w-110">
                <div className="card bg-white/3 border border-white/8 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem]">

                    {/* Top Decorative bar */}
                    <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600" />

                    <div className="card-body p-10 sm:p-12">
                        {/* Header Section */}
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/40 mb-6">
                                <img src="/Logo.png" alt="Bread Gift" className="w-full h-full object-cover rounded-2xl" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                                Admin <span className="text-white bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">Presensi</span>
                            </h1>
                            <p className="text-slate-400 font-medium">Masukkan Nama User dan Password</p>
                        </div>

                        {/* Login Form */}
                        <form action={action} className="space-y-6">
                            {state?.error && (
                                <div className="alert alert-error bg-red-500/10 border-red-500/20 text-red-400 text-sm py-3 rounded-xl flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>{state.error}</span>
                                </div>
                            )}
                            <div className="form-control">
                                <label className="label pt-0">
                                    <span className="label-text text-slate-300 font-semibold text-xs uppercase tracking-widest">Nama Akun</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <FontAwesomeIcon icon={faUserShield} className="w-4 h-4" />
                                    </div>
                                    <input
                                        name="nama"
                                        type="text"
                                        placeholder="Contoh: Admin"
                                        className="input w-full bg-white/3 border-white/10 focus:border-blue-500 focus:bg-white/6 text-white pl-12 h-14 rounded-2xl transition-all duration-300 placeholder:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-slate-300 font-semibold text-xs uppercase tracking-widest">Kata Sandi</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                        <FontAwesomeIcon icon={faKey} className="w-4 h-4" />
                                    </div>
                                    <input
                                        name="kata_sandi"
                                        type="password"
                                        placeholder="••••••••••••"
                                        className="input w-full bg-white/3 border-white/10 focus:border-indigo-500 focus:bg-white/6 text-white pl-12 h-14 rounded-2xl transition-all duration-300 placeholder:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="btn btn-block h-14 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all group"
                                >
                                    {isPending ? (
                                        <span className="loading loading-spinner"></span>
                                    ) : (
                                        <>
                                            Login
                                            <FontAwesomeIcon icon={faRightToBracket} className="ml-3 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Bottom decorative text */}
                <div className="mt-8 text-center">
                    <p className="text-white text-sm font-medium">
                        Pabrik Roti Bread Gift &bull; Admin Administration
                    </p>
                </div>
            </div>
        </main>
    )
}
