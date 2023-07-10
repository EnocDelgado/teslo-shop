import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";


export const GetUser = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        // validation
        if ( !user )
            throw new InternalServerErrorException('User not fount (request)') // this is a backend error, I mean, it's mine

        return ( !data ) ? user : user[ data ];
    }
)