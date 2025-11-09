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
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { Injectable, Logger } from '@nestjs/common';

interface JoinAuctionPayload {
  auctionId: number;
}

interface SendMessagePayload {
  auctionId: number;
  itemOnAuctionId: number;
  message: string;
  parentId?: number;
}

@Injectable()
@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'supersecretkey';

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        this.extractToken(client.handshake.headers?.authorization);
      if (!token) throw new WsException('Missing token');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
      });
      client.data.user = { id: payload.sub, email: payload.email, role: payload.role };
      this.logger.debug(`Client ${client.id} connected as user ${payload.sub}`);
    } catch (error) {
      this.logger.warn(`Socket connection rejected: ${error.message}`);
      client.emit('error', 'Unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinAuction')
  handleJoinAuction(
    @MessageBody() body: JoinAuctionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.user) throw new WsException('Unauthorized');
    if (!body?.auctionId)
      throw new WsException('auctionId is required');

    const room = this.buildRoom(body.auctionId);
    client.join(room);
    this.logger.debug(
      `User ${client.data.user.id} joined room ${room}`,
    );
    return { event: 'joined', room };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() body: SendMessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.user) throw new WsException('Unauthorized');
    if (!body?.auctionId || !body?.itemOnAuctionId || !body?.message) {
      throw new WsException(
        'auctionId, itemOnAuctionId, and message are required',
      );
    }

    const chat = await this.chatService.create(
      client.data.user.id,
      body.auctionId,
      {
        message: body.message,
        itemOnAuctionId: body.itemOnAuctionId,
        parentId: body.parentId,
      },
    );

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
