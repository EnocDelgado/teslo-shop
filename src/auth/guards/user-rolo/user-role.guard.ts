import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get('roles', context.getHandler() );

    // validation
    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;

    // get roles
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    // validtation
    if ( !user ) 
      throw new BadRequestException('User not found')

    for ( const role of user.roles ) {
      if ( validRoles.includes( role ) ) {
        return true;
      }
    }

    return true;
  }
}
