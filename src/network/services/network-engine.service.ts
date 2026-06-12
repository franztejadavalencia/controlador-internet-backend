import { Injectable, Logger } from '@nestjs/common';
import { runLinuxCommand } from '@/common/utils/command-runner';
import { EngineDevice } from '../interfaces/engine-device.interface';

@Injectable()
export class NetworkEngineService {
  private readonly logger = new Logger(NetworkEngineService.name);
  private readonly scriptPath = '/home/ftejada/sis704-backend/network-sync.sh';

  async syncDevice(params: EngineDevice) {
    const { ipAddress, macAddress, downloadSpeed, uploadSpeed, action } = params;
    const command = `sudo ${this.scriptPath} ${ipAddress} ${macAddress} ${downloadSpeed} ${uploadSpeed} ${action}`;
    try {
      this.logger.log(`Iniciando sincronización de red ${action} para IP ${ipAddress} y MAC ${macAddress}`);
      const result = await runLinuxCommand(command);
      this.logger.log(`Respuesta: ${result.trim()}`);
      return true;
    } catch (error) {
      this.logger.error(`Falló la sincronización de hardware para IP ${ipAddress} y MAC ${macAddress}`);
      throw error;
    }
  }
}
