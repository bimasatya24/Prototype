/*
  Warnings:

  - You are about to drop the column `presensi` on the `Presensi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Presensi" DROP COLUMN "presensi",
ADD COLUMN     "waktu_presensi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "waktu_daftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
