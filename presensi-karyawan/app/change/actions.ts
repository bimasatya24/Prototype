'use server'

import { redirect } from 'next/navigation'
import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'

export async function changePasswordAction(prevState: any, formData: FormData) {
  const nama = formData.get('nama')?.toString()
  const email = formData.get('email')?.toString()
  const kata_sandi_baru = formData.get('kata_sandi_baru')?.toString()

  if (!nama || !email || !kata_sandi_baru) {
    return { error: 'Nama, email, dan kata sandi baru harus diisi.' }
  }

  // Verifikasi apakah nama dan email cocok dengan data yang ada
  const user = await prisma.user.findFirst({
    where: {
      nama: nama,
      email: email,
    },
  })

  if (!user) {
    return { error: 'Data nama atau email tidak sesuai.' }
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10)
  const hashedSandi = await bcrypt.hash(kata_sandi_baru, salt)

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        kata_sandi: hashedSandi,
      },
    })

  } catch (error) {
    console.error('Change Password Error:', error)
    return { error: 'Terjadi kesalahan saat mengubah kata sandi.' }
  }

  // Redirect langsung ke Halaman /login
  redirect('/login')
}
