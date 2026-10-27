import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Registro de nuevo usuario en el sistema
  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const { password, ...result } = user;
    return result;
  }

  // Inicio de sesión y generación de JSON Web Token (JWT)
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales de acceso inválidas');
    }

    // Comparación segura de contraseña contra el hash de bcrypt
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales de acceso inválidas');
    }

    // Generación del payload para el token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Integración e inicio de sesión con proveedor externo OAuth 2.0 (Google)
  async loginOAuthUser(profile: { email: string; name: string }) {
    if (!profile || !profile.email) {
      throw new UnauthorizedException(
        'No se recibió un correo electrónico válido desde Google',
      );
    }

    let user = await this.usersService.findByEmail(profile.email);

    // Si el usuario no existe, se aprovisiona automáticamente en la plataforma
    if (!user) {
      const randomPassword =
        Math.random().toString(36).slice(-10) + 'OAuth123*';
      user = await this.usersService.create({
        name: profile.name || 'Google User',
        email: profile.email,
        password: randomPassword,
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
