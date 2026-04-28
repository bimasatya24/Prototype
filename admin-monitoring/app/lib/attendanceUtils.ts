import prisma from "@/app/lib/prisma";

const START_DATE_STR = "2026-04-17";

/**
 * Utility to fetch attendance records merged with virtual "Alpha" records 
 * for days when a user did not record attendance.
 * 
 * Rules:
 * 1. Tracking starts from START_DATE_STR.
 * 2. Fridays are holidays (no Alpha records).
 * 3. Scope: Admin dashboard and Excel export.
 */
export async function getAttendanceWithAlphas(search: string = "", statusFilter: string = "Semua") {
  const startDate = new Date(START_DATE_STR);
  startDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // 1. Get all users affected by search
  const allUsers = await prisma.user.findMany({
    where: {
      nama: { contains: search, mode: "insensitive" },
    },
  });

  // 2. Get all real attendance records from start date until today
  const realRecords = await prisma.presensi.findMany({
    where: {
      presensi: {
        gte: startDate,
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
  
  // Iterate through each day since START_DATE
  for (let d = new Date(startDate); d <= end; d.setDate(d.getDate() + 1)) {
    const currentDay = new Date(d);
    
    // Friday is Holiday (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
    if (currentDay.getDay() === 5) continue;

    const dateStr = currentDay.toLocaleDateString("en-CA");

    for (const user of allUsers) {
      // Admin (usually ID 1) could be excluded, but we'll follow current logic and include them 
      // unless specified otherwise, as they are part of "Total Karyawan"
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
