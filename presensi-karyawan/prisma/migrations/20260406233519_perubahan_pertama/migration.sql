-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Hadir', 'Sakit', 'Izin');

-- CreateTable
CREATE TABLE "Presensi" (
    "urutan" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Hadir',
    "presensi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_presensi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("urutan")
);
