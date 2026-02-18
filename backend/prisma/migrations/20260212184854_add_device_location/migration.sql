-- CreateTable
CREATE TABLE "DeviceLocation" (
    "id" BIGSERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeviceLocation_deviceId_createdAt_idx" ON "DeviceLocation"("deviceId", "createdAt");

-- AddForeignKey
ALTER TABLE "DeviceLocation" ADD CONSTRAINT "DeviceLocation_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
