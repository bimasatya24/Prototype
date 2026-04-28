/*
  Warnings:

  - You are about to drop the `Presensi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Presensi";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "gambar" TEXT,
    "nama" TEXT NOT NULL,
    "kata_sandi" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
