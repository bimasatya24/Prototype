/*
  Warnings:

  - You are about to drop the column `waktu_presensi` on the `Presensi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Presensi" DROP COLUMN "waktu_presensi",
ADD COLUMN     "presensi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
