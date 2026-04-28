import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-md p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-center transform transition-all duration-700 hover:scale-[1.02]">
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-tr from-orange-500 to-orange-400 shadow-lg shadow-orange-500/20">
          <img src="/Logo.png" alt="Bread Gift" className="w-full h-full object-cover rounded-2xl" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-white bg-linear-to-b from-white to-white/70">
          Presensi Karyawan Pabrik Roti Bread Gift
        </h1>

        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Selamat datang di portal presensi karyawan Pabrik Roti Bread Gift!
        </p>

        <Link
          href="/login"
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-orange-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 active:bg-orange-700 hover:bg-orange-500 shadow-lg shadow-orange-600/30"
        >
          Login Presensi
          <svg className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <Link
          href="/register"
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-orange-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 active:bg-orange-700 hover:bg-orange-500 shadow-lg shadow-orange-600/30 m-3"
        >
          Daftar Akun
          <svg className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <Link
          href="/change"
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-orange-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 active:bg-orange-700 hover:bg-orange-500 shadow-lg shadow-orange-600/30 m-3"
        >
          Lupa Password
          <svg className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Presensi Pabrik Roti Bread Gift
          </p>
        </div>
      </div>
    </main>
  );
}
