import { Role } from './role.enum';

export interface JwtPayload {
  username: string;
  role: Role;
}
