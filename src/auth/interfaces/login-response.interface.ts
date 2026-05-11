import { UserActiveInterface } from './user-active.interface';

export enum LoginStatus {
  SUCCESS = 'SUCCESS',
  PENDING_SYNC = 'PENDING_SYNC',
  VERIFY_TOKEN = 'VERIFY_TOKEN'
}

export interface LoginResponse {
  status: LoginStatus;
  access_token?: string;
  user?: UserActiveInterface;
  requiresMfaSetup?: boolean;
  mfaData?: {
    secret: string;
    otpauthUrl: string;
  };
  idUser?: number;
}
