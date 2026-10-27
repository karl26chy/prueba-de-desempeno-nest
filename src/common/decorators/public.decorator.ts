import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// Decorador para marcar endpoints públicos exentos de autenticación JWT
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
