-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'Alpha';

-- AlterTable
ALTER TABLE "Presensi" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
