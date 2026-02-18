-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "lastSeen" TIMESTAMP(3),
ADD COLUMN     "license_plate" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "serial_number" TEXT,
ADD COLUMN     "year" TEXT;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
