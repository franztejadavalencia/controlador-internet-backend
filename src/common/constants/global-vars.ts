export {};

declare global {
  var NANOSTATION_IP: string;
  var ID_CLIENT: number;
}

if (typeof (globalThis as any).NANOSTATION_IP === 'undefined') {
  (globalThis as any).NANOSTATION_IP = '10.0.0.1';
}

(globalThis as any).ID_CLIENT = parseInt(process.env.ID_CLIENT ?? '3', 10);

