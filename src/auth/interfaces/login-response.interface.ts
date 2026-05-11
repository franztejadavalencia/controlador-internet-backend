import { UserActiveInterface } from './user-active.interface';

export interface LoginResponse {
  access_token: string;
  user: UserActiveInterface;
}
