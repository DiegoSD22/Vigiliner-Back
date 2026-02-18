/*
  Warnings:

  - You are about to drop the column `userId` on the `Device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
