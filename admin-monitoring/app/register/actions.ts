'use server'

import { redirect } from 'next/navigation'
import prisma from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function adminRegisterAction(prevState: any, formData: FormData) {
  const nama = formData.get('nama')?.toString()
  const kata_sandi = formData.get('kata_sandi')?.toString()

  if (!nama || !kata_sandi) {
    return { error: 'Nama dan Kata Sandi harus diisi.' }
  }

  // Cek apakah admin sudah ada
  const existingAdmin = await prisma.admin.findFirst({
    where: { nama: nama },
  })

  if (existingAdmin) {
    return { error: 'Nama akun sudah terdaftar.' }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(kata_sandi, 10)

  // Simpan admin baru
  const newAdmin = await prisma.admin.create({
    data: {
      nama: nama,
      kata_sandi: hashedPassword,
    },
  })

  // Login otomatis
  const cookieStore = await cookies()
  cookieStore.set('adminId', newAdmin.id.toString())

  // Redirect ke halaman monitoring setelah berhasil
  redirect('/monitoring')
}
