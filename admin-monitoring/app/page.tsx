'use client'

import React from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket, faUserPlus, faShieldHalved } from '@fortawesome/free-solid-svg-icons'

export default function Home() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#0a0f1d] flex items-center justify-center p-6">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-120">
                <div className="card bg-white/3 border border-white/8 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem]">
                    
                    {/* Top Decorative bar */}
                    <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600" />

                    <div className="card-body p-10 sm:p-12 text-center">
                        {/* Header Section */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/40 mb-6 group hover:scale-110 transition-transform duration-500">
                                <img src="/Logo.png" alt="Bread Gift" className="w-full h-full object-cover rounded-2xl" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-3">
                                Sistem <span className="text-white bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">Monitoring</span>
                            </h1>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                                Selamat datang di Sistem Monitoring Pabrik Roti Bread Gift
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid gap-4 w-full">
                            <Link
                                href="/login"
                                className="btn h-14 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all group"
                            >
                                Login Admin
                                <FontAwesomeIcon icon={faRightToBracket} className="ml-3 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href="/register"
                                className="btn h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg rounded-2xl active:scale-[0.98] transition-all group backdrop-blur-sm"
                            >
                                <FontAwesomeIcon icon={faUserPlus} className="mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                                Tambah Admin
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom decorative text */}
                <div className="mt-8 text-center">
                    <p className="text-white text-sm font-medium opacity-80">
                        &copy; {new Date().getFullYear()} Pabrik Roti Bread Gift &bull; Administration
                    </p>
                </div>
            </div>
        </main>
    )
}
