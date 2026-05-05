import React from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faTrash, faFilter, faUsers, faCheckDouble, faTriangleExclamation, faHospital, faCircleXmark, faUserGear, faRightFromBracket, faChevronDown, faCalendarDays, faList } from '@fortawesome/free-solid-svg-icons'
import prisma from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DownloadButton from './DownloadButton'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons/faCircleUser'
import { getAttendanceWithAlphas } from '../lib/attendanceUtils'

export default async function ManagementDashboard(props: {
  searchParams: Promise<{ search?: string; status?: string; alphaMonth?: string; alphaYear?: string }>;
}) {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("adminId")?.value;

  if (!adminId) {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "Semua";
  const alphaMonth = searchParams.alphaMonth || (new Date().getMonth() + 1).toString();
  const alphaYear = searchParams.alphaYear || new Date().getFullYear().toString();

  const admin = await prisma.admin.findUnique({
    where: { id: parseInt(adminId, 10) }
  });

  if (!admin) {
    redirect("/");
  }

  // Data Fetching
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  let totalUsers = 0;
  let todayStats: any[] = [];
  let allPresensi: any[] = [];

  [totalUsers, todayStats] = await Promise.all([
    prisma.user.count(),
    prisma.presensi.groupBy({
      by: ['status'],
      where: {
        presensi: {
          gte: todayStart,
          lte: todayEnd,
        }
      },
      _count: true
    })
  ]);

  // Use the utility to fetch merged attendance data
  allPresensi = await getAttendanceWithAlphas(search, statusFilter);

  // For download data, we want ALL statuses and the same search criteria (or no search if preferred)
  // The user wants the same as what's in the program and excel
  const downloadData = await getAttendanceWithAlphas(search, "Semua");

  // Calculate Alpha Stats based on selected month and year
  const alphaStatsMap = new Map<number, { user: any, count: number, records: any[] }>();
  
  // Filter allPresensi specifically for the Alpha Monitoring section
  allPresensi.forEach((p: any) => {
    const d = new Date(p.presensi);
    const m = (d.getMonth() + 1).toString();
    const y = d.getFullYear().toString();
    
    if (p.status === 'Alpha' && m === alphaMonth && y === alphaYear) {
      if (!alphaStatsMap.has(p.userID)) {
        alphaStatsMap.set(p.userID, { user: p.user, count: 0, records: [] });
      }
      const stat = alphaStatsMap.get(p.userID)!;
      stat.count++;
      stat.records.push(p);
    }
  });

  const alphaStatsArray = Array.from(alphaStatsMap.values()).sort((a, b) => b.count - a.count);

  const todayHadir = todayStats.find(s => s.status === 'Hadir')?._count || 0;
  const todaySakit = todayStats.find(s => s.status === 'Sakit')?._count || 0;
  const todayIzin = todayStats.find(s => s.status === 'Izin')?._count || 0;

  const todayTotalAbsen = todayHadir + todaySakit + todayIzin;

  // Today's Alpha is only calculated if it's not a holiday (Friday)
  const isHoliday = new Date().getDay() === 5;
  const todayAlpha = isHoliday ? 0 : Math.max(0, totalUsers - todayTotalAbsen);

  const stats = [
    { label: "Total Karyawan", value: totalUsers, icon: faUsers, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Hadir", value: todayHadir, icon: faCheckDouble, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Sakit", value: todaySakit, icon: faHospital, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Izin", value: todayIzin, icon: faTriangleExclamation, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Alpha", value: todayAlpha, icon: faCircleXmark, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  async function deletePresensiAdmin(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (!id) return;

    await prisma.presensi.delete({
      where: { id: parseInt(id.toString()) },
    });

    revalidatePath("/monitoring");
  }

  return (
    <main className="relative min-h-screen bg-[#070b14] text-slate-200 p-4 md:p-8 overflow-x-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Floating Header / Navbar */}
      <nav className="relative z-50 max-w-7xl mx-auto mb-10">
        <div className="navbar glass backdrop-blur-3xl rounded-[2.5rem] border border-white/8 px-6 py-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex-1 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <img src="/Logo.png" alt="Bread Gift" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">Bread Gift <span className="text-emerald-500 text-sm align-top">Admin</span></h1>
            </div>
          </div>
          <div className="flex-none gap-4">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost glass rounded-2xl flex items-center gap-3 px-4 py-2 border border-white/10 hover:bg-white/5 transition-all">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FontAwesomeIcon icon={faUserGear} className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-white leading-tight tracking-tighter">{admin.nama}</p>
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="text-[10px] text-slate-500" />
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-4 z-100 p-2 shadow-2xl bg-[#0f172a] border border-white/10 rounded-2xl w-52 overflow-hidden backdrop-blur-2xl">
                <li>
                  <Link href={"/profile"} className="py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-3">
                    <FontAwesomeIcon icon={faUserGear} className="text-indigo-400 w-4 h-4" />
                    <span className="font-bold">Ubah Profil</span>
                  </Link>
                </li>
                <li className="mt-1">
                  <Link href={"/"} className="py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-3">
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                    <span className="font-bold">Keluar</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-6 rounded-4xl border border-white/5 flex items-center gap-6 group hover:translate-y-1 transition-all duration-300">
              <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center text-2xl ${stat.color} shadow-inner`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Alpha Monitoring Section */}
        <div className="overflow-hidden rounded-[2.5rem] border border-white/8 glass shadow-2xl relative">
          <div className="bg-white/3 px-8 py-5 border-b border-white/8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
                <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Monitoring Karyawan</h2>
            </div>
            
            {/* Filter Bulan dan Tahun */}
            <form method="get" className="flex items-center gap-2">
              <input type="hidden" name="search" value={search} />
              <input type="hidden" name="status" value={statusFilter} />
              <select name="alphaMonth" defaultValue={alphaMonth} className="select select-bordered select-sm bg-white/5 border-white/10 text-white focus:border-red-500 rounded-xl px-4 py-1.5">
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m.toString()}>{new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
                ))}
              </select>
              <select name="alphaYear" defaultValue={alphaYear} className="select select-bordered select-sm bg-white/5 border-white/10 text-white focus:border-red-500 rounded-xl px-4 py-1.5">
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-sm btn-ghost glass text-white hover:text-emerald-400">Set</button>
            </form>
          </div>

          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="table w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-white/5 text-white text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-6 py-4 rounded-tl-2xl border-none">Nama Karyawan</th>
                  <th className="px-6 py-4 text-center border-none">Jumlah Alpha</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl border-none">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {alphaStatsArray.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm font-medium italic border-none bg-white/2 rounded-b-2xl">
                      Tidak ada karyawan yang Alpha pada bulan ini.
                    </td>
                  </tr>
                ) : (
                  alphaStatsArray.map((stat, idx) => (
                    <tr key={`alpha_row_${stat.user.id}`} className={`group hover:bg-red-500/5 transition-colors border-none ${idx === alphaStatsArray.length - 1 ? '[&>td:first-child]:rounded-bl-2xl [&>td:last-child]:rounded-br-2xl' : ''}`}>
                      <td className="px-6 py-4 border-none bg-white/2">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-red-500/30 transition-colors">
                            {stat.user.gambar ? (
                              <img src={stat.user.gambar} className="w-full h-full object-cover" alt="User" />
                            ) : (
                              <FontAwesomeIcon icon={faCircleUser} className="text-xl text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{stat.user.nama}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.user.id === 1 ? "Admin" : "Karyawan"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-none bg-white/2">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-red-500/10 text-red-400 font-black text-xs border border-red-500/20">
                          {stat.count} Kali
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-none bg-white/2">
                        <label htmlFor={`alpha_modal_${stat.user.id}`} className="btn btn-sm glass text-white hover:bg-red-500 hover:text-white border border-white/10 hover:border-red-500 transition-all cursor-pointer">
                          <FontAwesomeIcon icon={faList} className="w-3.5 h-3.5 mr-2" />
                          Detail
                        </label>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:max-w-3xl">
            {/* Search Input */}
            <form method="get" className="relative grow group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="search"
                autoComplete="off"
                placeholder="Cari Karyawan"
                className="input input-bordered w-full h-14 pl-12 bg-white/3 border-white/10 text-white focus:border-emerald-500 focus:bg-white/6 rounded-2xl transition-all font-medium placeholder:text-slate-600"
                defaultValue={search}
              />
              <input type="hidden" name="status" value={statusFilter} />
              <input type="hidden" name="alphaMonth" value={alphaMonth} />
              <input type="hidden" name="alphaYear" value={alphaYear} />
            </form>

            {/* Filter Tabs */}
            <div className="flex bg-white/3 p-1.5 rounded-2xl border border-white/10 h-14">
              {["Semua", "Hadir", "Izin", "Sakit", "Alpha"].map((filter) => (
                <Link
                  key={filter}
                  href={`?search=${search}&status=${filter}&alphaMonth=${alphaMonth}&alphaYear=${alphaYear}`}
                  className={`px-5 flex items-center rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${statusFilter === filter ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {filter}
                </Link>
              ))}
            </div>
          </div>

          {/* Download Data Button */}
          <DownloadButton data={JSON.parse(JSON.stringify(downloadData))} />
        </div>

        {/* Data Management Table */}
        <div className="overflow-hidden rounded-[2.5rem] border border-white/8 glass shadow-2xl">
          <div className="bg-white/3 px-8 py-5 border-b border-white/8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faFilter} className="text-emerald-500 w-4 h-4" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Daftar Hadir</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-white/1 text-white text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-6 text-center lg:text-left border-none">#</th>
                  <th className="px-8 py-6 border-none">Nama</th>
                  <th className="px-8 py-6 text-center border-none">Status</th>
                  <th className="px-8 py-6 border-none">Waktu Absen</th>
                  <th className="px-8 py-6 border-none">Foto</th>
                  <th className="px-8 py-6 text-center border-none">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {allPresensi.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl">!</div>
                        <p className="text-white font-bold italic tracking-wide">Tidak ada data.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allPresensi.map((p, index) => (
                    <tr key={p.id} className="group hover:bg-emerald-500/2 transition-colors border-none">
                      <td className="px-8 py-6 text-center lg:text-left border-none">
                        <span className="text-white font-mono text-sm font-bold">#{String(index + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="px-8 py-6 border-none">
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-2xl border border-white/10 group-hover:border-white/30 transition-all overflow-hidden shadow-lg flex items-center justify-center bg-slate-800/50">
                              {p.user.gambar ? (
                                <img
                                  src={p.user.gambar}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FontAwesomeIcon icon={faCircleUser} className="text-3xl text-slate-400" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-white group-hover:text-emerald-400 transition-colors text-base">{p.user.nama}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {p.user.id === 1 ? "Admin" : "Karyawan"}
                              {p.latitude && ` • ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center border-none">
                        <div className={`badge h-9 px-4 glass border-white/5 font-black text-[10px] uppercase tracking-widest ${p.status === 'Hadir' ? 'text-emerald-400 bg-emerald-500/10' :
                          p.status === 'Alpha' ? 'text-red-400 bg-red-500/10' :
                            'text-amber-400 bg-amber-500/10'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 shadow-[0_0_8px_currentColor] animate-pulse ${p.status === 'Hadir' ? 'bg-emerald-400' :
                            p.status === 'Alpha' ? 'bg-red-400' : 'bg-amber-400'
                            }`} />
                          {p.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 border-none">
                        {/* Tampilkan waktu jika bukan Alpha, ATAU jika Alpha tapi ada data GPS (Luar Jangkauan) */}
                        {p.status !== 'Alpha' || p.latitude !== null ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-300 tracking-tight">{new Date(p.presensi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter opacity-70">{new Date(p.presensi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                          </div>
                        ) : (
                          <div className="text-slate-600 font-bold italic text-xs tracking-widest">-</div>
                        )}
                      </td>
                      <td className="px-8 py-6 border-none">
                        {p.gambar ? (
                          <>
                            <label htmlFor={`photo_modal_${p.id}`} className="cursor-pointer group/photo relative block w-14 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500 transition-all shadow-lg active:scale-95">
                              <img src={p.gambar} className="w-full h-full object-cover" alt="Attendance Photo" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white text-[10px]" />
                              </div>
                            </label>

                          </>
                        ) : (
                          <div className="text-[10px] text-slate-500 italic font-medium">Tanpa Foto</div>
                        )}
                      </td>
                      <td className="px-8 py-6 border-none">
                        {/* Tampilkan aksi jika bukan Alpha, atau jika Alpha tapi punya koordinat (Luar Jangkauan) */}
                        {(p.status !== 'Alpha' || p.latitude !== null) ? (
                          <div className="flex items-center justify-center gap-2">
                            <form action={deletePresensiAdmin}>
                              <input type="hidden" name="id" value={p.id} />
                              <button type="submit" className="btn btn-square btn-ghost glass btn-sm text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform active:scale-90 overflow-hidden">
                                <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          </div>
                        ) : (
                          <div className="text-center">
                            {/* Jika Alpha virtual (tanpa koordinat), tidak ada aksi */}
                            <span className="text-slate-600 italic text-[10px] font-bold">-</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 bg-white/1 border-t border-white/8 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <p className="text-[10px] text-white font-bold uppercase tracking-widest">Menampilkan {allPresensi.length} data</p>
            </div>
          </div>
        </div>

      </div>

      {/* Alpha Detail Modals */}
      <div className="relative z-100">
        {alphaStatsArray.map((stat) => (
          <React.Fragment key={`alpha_modal_${stat.user.id}`}>
            <input type="checkbox" id={`alpha_modal_${stat.user.id}`} className="modal-toggle" />
            <div className="modal" role="dialog">
              <div className="modal-box bg-slate-900 border border-white/10 p-0 overflow-hidden max-w-md shadow-2xl relative rounded-[2rem]">
                <div className="p-6 bg-red-500/10 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                      <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Detail Alpha</h3>
                      <p className="text-xs text-red-400 font-bold uppercase tracking-widest">{stat.user.nama}</p>
                    </div>
                  </div>
                  <label htmlFor={`alpha_modal_${stat.user.id}`} className="btn btn-circle btn-sm glass border-white/20 text-white hover:bg-white/20">✕</label>
                </div>
                <div className="p-0 max-h-[50vh] overflow-y-auto">
                  <table className="table w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-slate-900 z-10">
                      <tr className="bg-red-500/10 text-white text-[10px] uppercase tracking-[0.2em] font-black">
                        <th className="px-6 py-4 border-b border-white/10">Tanggal</th>
                        <th className="px-6 py-4 border-b border-white/10 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stat.records.sort((a, b) => new Date(b.presensi).getTime() - new Date(a.presensi).getTime()).map((record: any) => (
                        <tr key={`alpha_record_${record.id}`} className="hover:bg-red-500/5 transition-colors border-none">
                          <td className="px-6 py-4 border-none">
                            <span className="text-xs font-bold text-slate-300">
                              {new Date(record.presensi).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center border-none">
                            <div className="badge badge-sm bg-red-500/20 text-red-400 border-none font-black uppercase tracking-widest text-[8px]">Alpha</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <label className="modal-backdrop" htmlFor={`alpha_modal_${stat.user.id}`}>Close</label>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Attendance Photo Modals (Rendered outside z-index containers to prevent navbar overlap) */}
      <div className="relative z-100">
        {allPresensi.map((p) => p.gambar && (
          <React.Fragment key={`modal_${p.id}`}>
            <input type="checkbox" id={`photo_modal_${p.id}`} className="modal-toggle" />
            <div className="modal" role="dialog">
              <div className="modal-box bg-slate-900 border border-white/10 p-0 overflow-hidden max-w-2xl shadow-2xl relative">
                <img src={p.gambar} className="w-full h-auto max-h-[75vh] object-contain block mx-auto" alt="Full Attendance Photo" />
                <div className="absolute top-4 right-4">
                  <label htmlFor={`photo_modal_${p.id}`} className="btn btn-circle btn-sm glass border-white/20 text-white hover:bg-white/20">✕</label>
                </div>
                <div className="p-4 bg-slate-800/50 backdrop-blur-md">
                  <p className="text-xs text-white font-bold">Foto Presensi - {p.user.nama}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{new Date(p.presensi).toLocaleString("id-ID")}</p>
                </div>
              </div>
              <label className="modal-backdrop" htmlFor={`photo_modal_${p.id}`}>Close</label>
            </div>
          </React.Fragment>
        ))}
      </div>
    </main>
  )
}
