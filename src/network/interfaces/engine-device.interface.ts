export interface EngineDevice {
  macAddress: string;
  ipAddress: string;
  downloadSpeed: number;
  uploadSpeed: number;
  action: 'HABILITAR' | 'DESHABILITAR' | 'ELIMINAR';
}
