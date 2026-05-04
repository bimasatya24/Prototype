import prisma from "@/app/lib/prisma";

/**
 * Utility to fetch attendance records merged with virtual "Alpha" records 
 * for days when a user did not record attendance.
 * 
 * Rules:
 * 1. Tracking starts from the user's account creation date (waktu_daftar).
 * 2. Fridays are holidays (no Alpha records).
 * 3. Scope: Admin dashboard and Excel export.
 */
export async function getAttendanceWithAlphas(search: string = "", statusFilter: string = "Semua") {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // 1. Get all users affected by search
  const allUsers = await prisma.user.findMany({
    where: {
      nama: { contains: search, mode: "insensitive" },
    },
  });

  // Find the earliest registration date to optimize the real records query
  let globalStartDate = new Date();
  if (allUsers.length > 0) {
    const validDates = allUsers
      .map((u: any) => u.waktu_daftar ? new Date(u.waktu_daftar).getTime() : NaN)
      .filter((time: number) => !isNaN(time));
    
    if (validDates.length > 0) {
      globalStartDate = new Date(Math.min(...validDates));
    }
  }
  globalStartDate.setHours(0, 0, 0, 0);

  // 2. Get all real attendance records from the earliest start date until today
  const realRecords = await prisma.presensi.findMany({
    where: {
      presensi: {
        gte: globalStartDate,
        lte: today,
      },
      user: {
        nama: { contains: search, mode: "insensitive" },
      }
    },
    include: { user: true },
  });

  // Create a map for quick lookup: userId -> Set of date strings (YYYY-MM-DD)
  const recordMap = new Map<number, Set<string>>();
  realRecords.forEach((r: any) => {
    // Use local date string to avoid timezone shifts in comparison
    const dateStr = new Date(r.presensi).toLocaleDateString("en-CA"); // YYYY-MM-DD format
    if (!recordMap.has(r.userID)) {
      recordMap.set(r.userID, new Set());
    }
    recordMap.get(r.userID)!.add(dateStr);
  });

  // 3. Generate virtual Alphas
  const virtualAlphas: any[] = [];
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  for (const user of allUsers) {
    // Gunakan waktu hari ini sebagai fallback jika waktu_daftar kosong/invalid
    let userStartDate = new Date();
    if ((user as any).waktu_daftar && !isNaN(new Date((user as any).waktu_daftar).getTime())) {
      userStartDate = new Date((user as any).waktu_daftar);
    }
    userStartDate.setHours(0, 0, 0, 0);

    // Iterate through each day since the user's registration date
    for (let d = new Date(userStartDate); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDay = new Date(d);
      
      // Friday is Holiday (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      if (currentDay.getDay() === 5) continue;

      const dateStr = currentDay.toLocaleDateString("en-CA");
      const hasRecord = recordMap.get(user.id)?.has(dateStr);

      if (!hasRecord) {
        virtualAlphas.push({
          id: user.id + 10000000 + Math.floor(currentDay.getTime() / 1000), // Pseudo-unique ID
          userID: user.id,
          status: "Alpha",
          presensi: new Date(currentDay.setHours(0, 0, 0, 0)),
          gambar: null,
          latitude: null,
          longitude: null,
          user: user
        });
      }
    }
  }

  // 4. Combine, Filter, and Sort
  let combined = [...realRecords, ...virtualAlphas];

  if (statusFilter !== "Semua") {
    combined = combined.filter(r => r.status === statusFilter);
  }

  // Sort by date descending (latest first)
  return combined.sort((a, b) => new Date(b.presensi).getTime() - new Date(a.presensi).getTime());
}
