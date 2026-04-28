'use server'

import { redirect } from 'next/navigation'
import prisma from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function adminLoginAction(prevState: any, formData: FormData) {
  const nama = formData.get('nama')?.toString()
  const kata_sandi = formData.get('kata_sandi')?.toString()

  if (!nama || !kata_sandi) {
    return { error: 'Nama dan Kata Sandi harus diisi.' }
  }

  const admin = await prisma.admin.findFirst({
    where: {
      nama: nama,
    },
  })

  if (!admin) {
    return { error: 'Nama atau Kata Sandi salah.' }
  }

  // Cek apakah password cocok (mendukung teks biasa untuk sementara ATAU bcrypt)
  const isPlainTextMatch = kata_sandi === admin.kata_sandi;
  
  // Kita bungkus bcrypt.compare dalam try-catch agar tidak error jika password di DB bukan format bcrypt
  let isBcryptMatch = false;
  try {
    isBcryptMatch = await bcrypt.compare(kata_sandi, admin.kata_sandi);
  } catch (e) {
    isBcryptMatch = false;
  }

  if (!isPlainTextMatch && !isBcryptMatch) {
    return { error: 'Nama atau Kata Sandi salah.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('adminId', admin.id.toString())

  // Jika login berhasil, redirect ke halaman dashboard admin
  redirect('/monitoring')
}
