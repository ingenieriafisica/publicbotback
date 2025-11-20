import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private userService: UsersService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:process.env.JWT_SECRET,
        })
    }

    async validate(payload:any){
        const user = await this.userService.findByEmail(payload.email);
        if(!user){
            throw new UnauthorizedException('token no válido o el usuario no fué encontrado')
        }
        return {email:user.correo_sena, role:user.rol_asignado}
    }
}
