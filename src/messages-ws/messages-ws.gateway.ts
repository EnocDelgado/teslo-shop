import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interfaces';

@WebSocketGateway({ cors: true }) // namespace = root or chat room
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect{


  @WebSocketServer()  wss: Server;

  constructor(

    private readonly messagesWsService: MessagesWsService, 
    private readonly jwtService: JwtService
    ) {}


  async handleConnection( client: Socket ) {

    // get token
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    // get payload jsonwebtoken
    try {

      payload = this.jwtService.verify( token );
      // connect 
      await this.messagesWsService.registerClient( client, payload.id );

    } catch ( error ) {
      client.disconnect();
      return;
    }

    // console.log('Client connected:', client.id );
    

    // client.join('sales') // sales chat
    // client.join( client.id );
    // client.join( user.id );
    // this.wss.to('sales').emit('')

    // listen when a client is connected
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )
  }


  handleDisconnect( client: Socket ) {
    // console.log('Client dicconnected:', client.id );
    this.messagesWsService.removeClient( client.id );

    // listen when a client is disconnected
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )
  }

  // this is listen all message that are sending
  @SubscribeMessage('message-from-client')
  handleMessageFromClient( client: Socket, payload: NewMessageDto  ){
    
    //! Emist just to client
    // client.emit('massage-from-server', {
    //   fullName: 'I am!',
    //   message: payload.message || 'no-message!!'
    // });

    //! Emit all less initial client
    // client.broadcast.emit('massage-from-server', {
    //   fullName: 'I am!',
    //   message: payload.message || 'no-message!!'
    // });

    //! Emit to all clients
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName( client.id ),
      message: payload.message || 'no-message!!'
    });
  }
}
