import * as net from 'net';
import { PrismaService } from 'prisma/prisma.service';
import { DevicesGateway } from '../devices/devices.gateway';
import * as queclink from 'queclink-parser';

export function startTcpServer(
  prisma: PrismaService,
  gateway: DevicesGateway,
) {
  const server = net.createServer((socket) => {
    console.log('📡 GPS conectado:', socket.remoteAddress);

    socket.on('data', async (data: Buffer) => {
      try {
        const raw = data.toString().trim();

        console.log('📥 Trama recibida:', raw);

        const parsed = queclink.parse(data);

        if (!parsed || !parsed.imei) return;

        const device = await prisma.device.findUnique({
          where: { imei: parsed.imei },
        });

        if (!device) {
          console.log('❌ IMEI no registrado:', parsed.imei);
          return;
        }

        const unit = await prisma.unit.findUnique({
          where: { deviceId: device.id },
        });

        if (!unit) {
          console.log('❌ No hay unidad asignada a este GPS:', device.id);
          return;
        }

        if (!parsed.loc || !parsed.loc.coordinates) return;

        const [lng, lat] = parsed.loc.coordinates;

        const location = await prisma.deviceLocation.create({
          data: {
            deviceId: device.id,
            lat,
            lng,
            speed: parsed.speed || 0,
            heading: parsed.azimuth || 0,
          },
        });

        const now = new Date();

        let status = 'STOPPED';

        if (parsed.speed && parsed.speed > 5) {
          status = 'MOVING';
        }

        await prisma.unit.update({
          where: { id: unit.id },
          data: {
            status,
            lastSeen: now,
          },
        });

        // Emitir en tiempo real
        gateway.server.to(unit.id).emit('receiveLocation', {
          deviceId: device.id,
          lat,
          lng,
          speed: parsed.speed,
          heading: parsed.azimuth,
        });

        console.log('✅ Ubicación guardada:', device.imei);
      } catch (err) {
        console.log('⚠️ Error procesando trama:', err.message);
      }
    });

    socket.on('error', (err) => {
      console.log('⚠️ Error TCP:', err.message);
    });
  });

  server.listen(1721, () => {
    console.log('🚀 TCP Server escuchando en puerto 1721');

    // 🔥 SIMULACIÓN TEMPORAL
    let lat = 19.4326;
    let lng = -99.1332;
    let speed = 0;
    let heading = 0;
    const unitID = 'a487272c-8161-4e37-bc04-3bcc30d1bf39'; // ID provisional

    setInterval(() => {

      lat += (Math.random() - 0.5) * 0.002;
      lng += (Math.random() - 0.5) * 0.002;
      speed = Math.random() * 80;
      heading = Math.random() * 360;

      gateway.server.to(unitID).emit('receiveLocation', {
        unitId: unitID,
        lat,
        lng,
        speed,
        heading,
        status: speed > 5 ? 'MOVING' : 'STOPPED',
        lastSeen: new Date(),
      });

      console.log('🧪 Simulación enviada:', lat, lng, speed, heading);

    }, 2000);
  });

}
