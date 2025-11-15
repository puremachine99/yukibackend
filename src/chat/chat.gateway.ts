import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { Injectable, Logger } from '@nestjs/common';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';
import type { DefaultEventsMap } from 'socket.io';
import { Server, Socket } from 'socket.io';

interface JoinAuctionPayload {
  auctionId: number;
}

interface SendMessagePayload {
  auctionId: number;
  itemOnAuctionId: number;
  message: string;
  parentId?: number;
}

interface SocketData {
  user?: AuthenticatedRequestUser;
}

type AuctionServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

type AuctionSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: AuctionServer;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly jwtSecret = process.env.JWT_SECRET || 'supersecretkey';

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: AuctionSocket) {
    try {
      const authToken =
        typeof client.handshake.auth?.token === 'string'
          ? client.handshake.auth?.token
          : undefined;
      const headerValue = client.handshake.headers?.authorization;
      const headerToken =
        typeof headerValue === 'string'
          ? this.extractToken(headerValue)
          : undefined;
      const token = authToken ?? headerToken;
      if (!token) throw new WsException('Missing token');

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtSecret,
      });
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      this.logger.debug(`Client ${client.id} connected as user ${payload.sub}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown socket error';
      this.logger.warn(`Socket connection rejected: ${message}`);
      client.emit('error', 'Unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuctionSocket) {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinAuction')
  async handleJoinAuction(
    @MessageBody() body: JoinAuctionPayload,
    @ConnectedSocket() client: AuctionSocket,
  ) {
    const user = client.data.user;
    if (!user) throw new WsException('Unauthorized');
    if (!body?.auctionId) throw new WsException('auctionId is required');

    const room = this.buildRoom(body.auctionId);
    await client.join(room);
    this.logger.debug(`User ${user.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() body: SendMessagePayload,
    @ConnectedSocket() client: AuctionSocket,
  ) {
    const user = client.data.user;
    if (!user) throw new WsException('Unauthorized');
    if (!body?.auctionId || !body?.itemOnAuctionId || !body?.message) {
      throw new WsException(
        'auctionId, itemOnAuctionId, and message are required',
      );
    }

    const chat = await this.chatService.create(user.id, body.auctionId, {
      message: body.message,
      itemOnAuctionId: body.itemOnAuctionId,
      parentId: body.parentId,
    });

    const room = this.buildRoom(body.auctionId);
    this.server.to(room).emit('chatMessage', chat);
    return chat;
  }

  private buildRoom(auctionId: number) {
    return `auction-${auctionId}`;
  }

  private extractToken(header?: string) {
    if (!header) return null;
    const [type, token] = header.split(' ');
    if (type !== 'Bearer') return null;
    return token;
  }
}
