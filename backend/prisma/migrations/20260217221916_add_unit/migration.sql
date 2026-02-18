/*
  Warnings:

  - You are about to drop the column `name` on the `Device` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_userId_fkey";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "name";

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT,
    "deviceId" TEXT,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_deviceId_key" ON "Unit"("deviceId");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
