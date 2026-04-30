'use server'

import { redirect } from 'next/navigation'
import prisma from '../lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function loginAction(prevState: any, formData: FormData) {
  const nama = formData.get('nama')?.toString()
  const kata_sandi = formData.get('kata_sandi')?.toString()

  if (!nama || !kata_sandi) {
    return { error: 'Nama dan kata sandi harus diisi.' }
  }

  const user = await prisma.user.findFirst({
    where: {
      nama: nama,
    },
  })

  if (!user) {
    return { error: 'Nama tidak ditemukan.' }
  }

  if (!(await bcrypt.compare(kata_sandi, user.kata_sandi))) {
    return { error: 'Nama atau kata sandi salah.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id.toString())

  // Jika login berhasil, redirect ke halaman /presensi
  redirect('/presensi')
}
