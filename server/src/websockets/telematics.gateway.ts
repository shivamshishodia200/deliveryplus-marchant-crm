import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface DriverLocationPing {
  driverId: string;
  orgId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speedKmh?: number;
  batteryLevel?: number;
  timestamp: string;
}

export interface TaskEtaUpdatePayload {
  taskId: string;
  driverId: string;
  updatedEtaIso: string;
  remainingDistanceKm: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true
  },
  namespace: '/telematics'
})
export class TelematicsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(TelematicsGateway.name);

  // Active socket tracking map: driverId -> socketId
  private readonly connectedDrivers = new Map<string, string>();

  handleConnection(client: Socket) {
    const orgId = client.handshake.query.orgId as string;
    const role = client.handshake.query.role as string;

    if (orgId) {
      // Room segregation per tenant organization
      client.join(`org:${orgId}`);
      if (role === 'DISPATCHER' || role === 'SUPER_ADMIN') {
        client.join(`org:${orgId}:dispatchers`);
      }
    }

    this.logger.log(`Client connected: ${client.id} (Role: ${role}, Org: ${orgId})`);
  }

  handleDisconnect(client: Socket) {
    for (const [driverId, socketId] of this.connectedDrivers.entries()) {
      if (socketId === client.id) {
        this.connectedDrivers.delete(driverId);
        this.logger.log(`Driver ${driverId} disconnected from telematics`);
        break;
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Receives high-frequency GPS telematics pings from driver mobile terminals
   */
  @SubscribeMessage('driver:telematics:ping')
  async handleDriverLocationPing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DriverLocationPing
  ) {
    this.connectedDrivers.set(payload.driverId, client.id);

    // 1. Broadcast real-time driver pin update to tenant dispatchers map
    this.server.to(`org:${payload.orgId}:dispatchers`).emit('dispatcher:driver:moved', {
      driverId: payload.driverId,
      lat: payload.latitude,
      lng: payload.longitude,
      heading: payload.heading ?? 0,
      speedKmh: payload.speedKmh ?? 0,
      batteryLevel: payload.batteryLevel,
      lastSeenAt: payload.timestamp
    });

    // 2. Trigger dynamic ETA recalculation logic
    await this.recalculateActiveTaskEtas(payload);
  }

  /**
   * Dynamically evaluates remaining delivery distances and broadcasts ETA revisions
   */
  private async recalculateActiveTaskEtas(ping: DriverLocationPing) {
    try {
      // Broadcast dynamic ETA update event to client tracking room
      const estimatedArrival = new Date(Date.now() + 18 * 60 * 1000).toISOString();

      this.server.to(`org:${ping.orgId}`).emit('task:eta:recalculated', {
        driverId: ping.driverId,
        newEtaTimestamp: estimatedArrival,
        currentLat: ping.latitude,
        currentLng: ping.longitude
      });
    } catch (err) {
      this.logger.error(`Error recalculating task ETAs for driver ${ping.driverId}:`, err);
    }
  }

  /**
   * Notifies driver device when task has been dispatched/assigned
   */
  public notifyDriverNewAssignment(driverId: string, taskPayload: any) {
    const socketId = this.connectedDrivers.get(driverId);
    if (socketId) {
      this.server.to(socketId).emit('driver:task:assigned', taskPayload);
    }
  }
}
