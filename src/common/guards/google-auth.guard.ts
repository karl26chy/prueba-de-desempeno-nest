import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard para iniciar y procesar el flujo OAuth 2.0 con Google
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
