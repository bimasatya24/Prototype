'use server'

import { redirect } from 'next/navigation'
import prisma from '../lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function registerAction(prevState: any, formData: FormData) {
  const nama = formData.get('nama')?.toString()
  const email = formData.get('email')?.toString()
  const kata_sandi = formData.get('kata_sandi')?.toString()

  if (!nama || !email || !kata_sandi) {
    return { error: 'Nama, email, dan kata sandi harus diisi.' }
  }

  // Cek apakah nama atau email sudah terdaftar
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { nama: nama },
        { email: email }
      ]
    },
  })

  if (existingUser) {
    if (existingUser.nama === nama) {
      return { error: 'Nama user sudah ada.' }
    }
    return { error: 'Email sudah terdaftar.' }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedSandi = await bcrypt.hash(kata_sandi, salt)

  let newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        nama: nama,
        email: email,
        kata_sandi: hashedSandi,
      },
    })

  } catch (error) {
    console.error('Registration Error:', error)
    return { error: 'Terjadi kesalahan saat mendaftar.' }
  }
  
  const cookieStore = await cookies()
  cookieStore.set('userId', newUser.id.toString())

  // Jika register berhasil, langsung redirect ke Halaman Presensi
  redirect('/presensi')
}
