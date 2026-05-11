export {};

declare global {
  var NANOSTATION_IP: string;
  var ID_CLIENT: number;
  var JWT_EXPIRES_IN: number;
  var ACTIVE: string;
  var BLOCKED: string;
}

if (typeof (globalThis as any).NANOSTATION_IP === 'undefined') {
  (globalThis as any).NANOSTATION_IP = '10.0.0.1';
}

(globalThis as any).ACTIVE = 'ACTIVO';
(globalThis as any).BLOCKED = 'BLOQUEADO';
(globalThis as any).ID_CLIENT = parseInt(process.env.ID_CLIENT ?? '3', 10);
(globalThis as any).JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN ?? '8', 10);
