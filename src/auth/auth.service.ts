import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt  from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {


  constructor(
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,

    private readonly jwtService: JwtService
  ){}


  async create( createUserDto: CreateUserDto ) {
    
    try {
      // destructuring data
      const { password, ...userData } = createUserDto;
      
      const user = this.userRespository.create({
        ...userData,
        // encrypt password
        password: bcrypt.hashSync( password, 10 )
      });

      await this.userRespository.save( user );
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }

    } catch ( error ) {
      this.handleDBErrors( error );
    }
  }


  async login( loginUserDto: LoginUserDto ) {

    const { password, email } = loginUserDto;

    const user = await this.userRespository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    });

    // validation
    if ( !user )
    throw new UnauthorizedException('Credential are not valid');

    // password comparison
    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Credential are not valid');

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }


  async checkAuthStatus( user: User ) {

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  // JWT
  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload );

    return token;
  }


  // handle errors
  private handleDBErrors( error: any ): never {

    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail )

    console.log( error );

    throw new InternalServerErrorException('Please check server logs');
  }
}
