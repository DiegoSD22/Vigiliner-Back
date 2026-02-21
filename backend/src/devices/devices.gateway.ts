import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DevicesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
        const token = client.handshake.auth.token;

        console.log("Token recibido:", token);

        const payload = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET,
        });

        console.log("Payload decodificado:", payload);

        client.data.user = payload;

        console.log("Socket autenticado correctamente");
    } catch (error) {
        console.log("Error en verify:", error);
        client.disconnect();
    }
    }

  handleDisconnect(client: Socket) {
    console.log('Socket desconectado');
  }

  @SubscribeMessage('joinUnit')
  async handleJoinUnit(
    @MessageBody() unitId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Socket ${client.id} se unió a la unidad ${unitId}`);
    client.join(unitId);

  }

  @SubscribeMessage('sendLocation')
  async handleLocation(
    @MessageBody()
    data: {
      deviceId: string;
      lat: number;
      lng: number;
      speed?: number;
      heading?: number;
    },
  ) {
    // 1️⃣ Guardar en base
    await this.prisma.deviceLocation.create({
      data: {
        deviceId: data.deviceId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        heading: data.heading,
      },
    });

    const unit = await this.prisma.unit.findUnique({
      where: { deviceId: data.deviceId },
    });

    if (!unit) {
      console.log('❌ No hay unidad asignada a este GPS:', data.deviceId);
      return;
    }

    let status = 'STOPPED';

    if (data.speed && data.speed > 5) {
      status = 'MOVING';
    }

    // 2️⃣ Emitir en tiempo real
    this.server.to(unit.id).emit('receiveLocation', {
      unitId: unit.id,
      lat: data.lat,
      lng: data.lng,
      speed: data.speed,
      heading: data.heading,
      status,
      lastSeen: new Date(),
    });


  }
}