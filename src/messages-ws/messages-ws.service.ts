import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


interface ConnectClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}


@Injectable()
export class MessagesWsService {

    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>
    ){}

    private connectedClients: ConnectClients = {}


    async registerClient( client: Socket, userId: string ) {
        const user = await this.userRepository.findOneBy({ id: userId });

        // validation
        if ( !user ) throw new Error('User not found');
        if ( !user.isActive ) throw new Error('User not Active');

        // authentication
        this.checkUserConnect( user );
        
        this.connectedClients[ client.id ] = {
            socket: client,
            user: user
        };
    }


    removeClient( clientId: string ) {
        delete this.connectedClients[ clientId ];
    }


    getConnectedClients(): string[] {
        return Object.keys( this.connectedClients );
    }


    getUserFullName( socketId: string ) {
        return this.connectedClients[ socketId ].user.fullName;
    }


    private checkUserConnect( user: User ) {

        for ( const clientId of Object.keys( this.connectedClients ) ) {

            const connectClient = this.connectedClients[ clientId ];
            // validation
            if ( connectClient.user.id === user.id ) {
                connectClient.socket.disconnect()
                break;
            }

        }
    }
}
