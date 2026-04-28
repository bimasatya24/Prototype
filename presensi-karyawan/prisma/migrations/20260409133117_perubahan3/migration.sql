-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Hadir', 'Izin', 'Sakit');

-- CreateTable
CREATE TABLE "Presensi" (
    "id" SERIAL NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Hadir',
    "presensi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_presensi" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
