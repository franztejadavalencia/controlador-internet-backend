import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { runLinuxCommand } from '@/common/utils/command-runner';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { Device } from '../interfaces/device.interface';
import { NetworkDetailsService } from './network-details.service';
import { NetworkEngineService } from './network-engine.service';

@Injectable()
export class NetworkService implements OnModuleInit {
  private readonly logger = new Logger(NetworkService.name);
  private readonly leasePath = '/var/lib/dhcp/dhcpd.leases';
  private watcher: chokidar.FSWatcher | null = null;

  constructor(
    private readonly networkDetailService: NetworkDetailsService,
    private readonly networkEngineService: NetworkEngineService,
  ) {}

  private formatMac(mac: string): string {
    return mac.toLowerCase();
  }

  async onModuleInit() {
    try {
      this.logger.log('Inicializando reglas de enrutamiento y control de tráfico...');
      // const cleanIptables = 'sudo iptables -F FORWARD';
      // await runLinuxCommand(cleanIptables);
      const natCommand = 'sudo iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE';
      await runLinuxCommand(natCommand);
      this.logger.log('Regla NAT de iptables aplicada correctamente en enp0s3');

      await runLinuxCommand('sudo iptables -A INPUT -i lo -j ACCEPT');
      await runLinuxCommand('sudo iptables -A OUTPUT -o lo -j ACCEPT');
      await runLinuxCommand('sudo iptables -D INPUT -i enp0s8 -p tcp --dport 22 -j ACCEPT 2>/dev/null || true');
      await runLinuxCommand('sudo iptables -A INPUT -i enp0s8 -p tcp --dport 22 -j ACCEPT');

      const dropCommand = 'sudo iptables -P FORWARD DROP';
      await runLinuxCommand(dropCommand);

      const establishedCommand = 'sudo iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT';
      await runLinuxCommand(establishedCommand);
      this.logger.log('Red Bloqueada. Política FORWARD establecida en DROP por defecto.');
      
      const cleanTcCommand = 'sudo tc qdisc del dev enp0s8 root 2>/dev/null || true';
      await runLinuxCommand(cleanTcCommand);
      const tcRootCommand = 'sudo tc qdisc add dev enp0s8 root handle 1: htb default 10';
      await runLinuxCommand(tcRootCommand);
      this.logger.log('Disciplina raíz TC HTB inicializada en enp0s8 (LAN).');

      this.logger.log('Consultando dispositivos con subscripción activa');
      const activeDevices = await this.networkDetailService.findAllSubscriptionActive();
      this.logger.log(`Se encontraron ${activeDevices.length} dispositivos activos. Habilitando...`);

      for (const device of activeDevices) {
        const { ipAddress, macAddress, subscription } = device;
        const plan = subscription.plan;
        if (ipAddress && macAddress && plan) {
          this.logger.log(`Asignando a: ${device.deviceHostname} (${ipAddress}) - Plan: ${plan.name} (${plan.downloadSpeed})`);
          await this.networkEngineService.syncDevice({
            ipAddress,
            macAddress: this.formatMac(macAddress),
            downloadSpeed: plan.downloadSpeed,
            uploadSpeed: plan.uploadSpeed,
            action: 'HABILITAR',
          });
        }
      }
      this.logger.log('Reglas de enrutamiento y control de tráfico completado');
    } catch (error) {
      this.logger.error('Error crítico al inicializar la infraestructura de red');
    }
  }

  startLeaseWatch(callback: (data: any) => void) {
    if (this.watcher) return;

    this.watcher = chokidar.watch(this.leasePath);
    this.watcher.on('change', async () => {
      const devices = await this.getProcessedDevices();
      callback(devices);
    });
    this.getProcessedDevices().then(devices => callback(devices));
  }

  private async getProcessedDevices(): Promise<Device[]> {
    const leases = this.parseLeasesRaw();
    try {
      const registeredDetails = await this.networkDetailService.findAll();
      const registeredMacs = new Set(
        registeredDetails.map(detail => detail.macAddress.toLowerCase()),
      );
      const processedDevices: Device[] = leases.map(lease => ({
        ...lease,
        isRegistered: registeredMacs.has(lease.macAddress.toLowerCase()),
      }));
      return processedDevices;
    } catch (error) {
      console.error('Error al cruzar datos con la base de datos:', error);
      return leases.map(lease => ({ ...lease, isRegistered: false }));
    }
  }

  stopLeaseWatch() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  private parseLeasesRaw(): Omit<Device, 'isRegistered'>[]{
    if (!fs.existsSync(this.leasePath)) return [];

    const data = fs.readFileSync(this.leasePath, 'utf8');
    const leaseRegex = /lease (\d+\.\d+\.\d+\.\d+) \{[\s\S]*?hardware ethernet ([:a-f0-9]+);(?:[\s\S]*?client-hostname "([^"]+)")?/g;
    const uniqueDevices = new Map<string, Omit<Device, 'isRegistered'>>();
    let match: RegExpExecArray | null;

    while ((match = leaseRegex.exec(data)) !== null) {
      const macAddress = this.formatMac(match[2]);
      uniqueDevices.set(macAddress, {
        ipAddress: match[1],
        macAddress,
        deviceHostname: match[3] || 'Desconocido',
      });
    }

    return Array.from(uniqueDevices.values()).reverse();
  }
}
