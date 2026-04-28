import { faCircleUser } from "@fortawesome/free-solid-svg-icons/faCircleUser";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons/faRightFromBracket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import prisma from "../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { faMagnifyingGlass, faUserPen } from "@fortawesome/free-solid-svg-icons";

export default async function Page(props: {
  searchParams: Promise<{ search: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
  });

  if (!currentUser) {
    redirect("/login");
  }

  const allPresensi = await prisma.presensi.findMany({
    where: {
      user: {
        nama: {
          contains: search,
          mode: "insensitive",
        },
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      presensi: "desc",
    },
  });
  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden p-4 md:p-8">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse pointer-events-none" />

      {/* Floating Navbar */}
      <div className="relative z-50 max-w-7xl mx-auto mb-8">
        <div className="navbar glass backdrop-blur-xl rounded-3xl border border-white/10 px-4 py-2 shadow-xl">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20 overflow-hidden">
                <img src="/Logo.png" alt="Bread Gift" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Halaman Presensi</h1>
            </div>
          </div>

          <div className="flex-none gap-4">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost glass rounded-full flex items-center gap-3 px-3 py-1 border border-white/10"
              >
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden flex items-center justify-center">
                    {currentUser.gambar ? (
                      <img
                        src={currentUser.gambar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faCircleUser} className="text-2xl text-slate-400" />
                    )}
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white leading-tight">{currentUser.nama}</p>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-100 p-2 shadow-2xl bg-slate-900 border border-white/10 rounded-2xl w-52"
              >
                <li>
                  <Link href={"/profile"} className="py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5">
                    <FontAwesomeIcon icon={faUserPen} className="size-4 text-orange-500" />
                    Ubah Profil
                  </Link>
                </li>
                <li className="mt-1">
                  <Link href={"/login"} className="py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <FontAwesomeIcon icon={faRightFromBracket} className="size-4" />
                    Keluar
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Search and Action Bar */}
        <div className="flex flex-col lg:flex-row justify-end items-center gap-6">
          <Link href={"/add"} className="btn glass border-white/10 px-8 h-14 text-white font-bold hover:bg-white/10 active:scale-95 transition-all shadow-xl backdrop-blur-sm group">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <FontAwesomeIcon icon={faPlus} className="size-4 text-blue-400 group-hover:text-white" />
            </div>
            Tambah Presensi
          </Link>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-3xl border border-white/10 glass backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="table glass w-full">
              <thead>
                <tr className="bg-white/2 border-b border-white/10 text-white text-xs uppercase tracking-widest font-bold">
                  <th className="px-8 py-6 text-center lg:text-left">Urutan</th>
                  <th className="px-8 py-6">Karyawan</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6">Waktu Presensi</th>
                  <th className="px-8 py-6">
                    Foto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allPresensi.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white text-2xl">
                          !
                        </div>
                        <p className="text-white font-medium italic">Belum ada data presensi yang ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allPresensi.map((p, index) => (
                    <tr key={p.id} className="group hover:bg-white/2 transition-colors border-none">
                      <td className="px-8 py-5 text-center lg:text-left">
                        <span className="text-slate-500 font-mono text-sm">#{String(index + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-2xl border border-white/10 group-hover:border-white/30 transition-all overflow-hidden shadow-lg flex items-center justify-center bg-slate-800/50">
                              {currentUser.gambar ? (
                                <img
                                  src={currentUser.gambar}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FontAwesomeIcon icon={faCircleUser} className="text-3xl text-slate-400" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-orange-400 transition-colors">{p.user.nama}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`badge badge-lg glass border-white/10 font-bold uppercase tracking-wider ${p.status === 'Hadir' ? 'bg-green-500/10 text-green-400' :
                          p.status === 'Alpha' ? 'bg-red-500/10 text-red-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${p.status === 'Hadir' ? 'bg-green-400' :
                            p.status === 'Alpha' ? 'bg-red-400' :
                              'bg-amber-400'
                            }`} />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-medium text-slate-300">
                          {new Date(p.presensi).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold">
                          {new Date(p.presensi).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {p.gambar ? (
                          <>
                            <label htmlFor={`photo_modal_${p.id}`} className="cursor-pointer group/photo relative block w-14 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-orange-500 transition-all shadow-lg active:scale-95">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-white/1 border-t border-white/5 flex justify-between items-center">
            <p className="text-xs text-white font-medium">Menampilkan {allPresensi.length} catatan kehadiran</p>
          </div>
        </div>

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

  );
}
