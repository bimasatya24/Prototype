import React from "react";
import prisma from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminProfileForm from "./AdminProfileForm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export default async function AdminProfilePage() {
  const cookieStore = await cookies();
  const adminIdStr = cookieStore.get("adminId")?.value;

  if (!adminIdStr) {
    redirect("/login");
  }

  const adminId = parseInt(adminIdStr, 10);
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  });

  if (!admin) {
    redirect("/login");
  }

  async function updateAdminAction(formData: FormData) {
    "use server";
    const nama = formData.get("nama")?.toString();
    const kata_sandi = formData.get("kata_sandi")?.toString();

    if (!nama) return { error: "Nama harus diisi" };

    const updateData: any = { nama };

    if (kata_sandi && kata_sandi.trim() !== "") {
      const hashedPassword = await bcrypt.hash(kata_sandi, 10);
      updateData.kata_sandi = hashedPassword;
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
    });

    revalidatePath("/monitoring");
    redirect("/monitoring");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b14] flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <AdminProfileForm admin={admin} onUpdate={updateAdminAction} />
    </main>
  );
}
