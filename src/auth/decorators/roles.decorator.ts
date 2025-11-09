import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator untuk menentukan peran (role) pengguna
 * di level route handler atau controller.
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
