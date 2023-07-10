import { UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
import { RoleProtected } from './role-protected/role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-rolo/user-role.guard';

export function Auth(...roles: ValidRoles[]) {

    return applyDecorators(
        RoleProtected( ...roles ),
        UseGuards( AuthGuard(), UserRoleGuard ),
    );


}