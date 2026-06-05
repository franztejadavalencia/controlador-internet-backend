import { Injectable, OnModuleInit } from '@nestjs/common';
import { runLinuxCommand } from '@/common/utils/command-runner';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { Device } from '../interfaces/device.interface';
import { NetworkDetailsService } from './network-details.service';

@Injectable()
export class NetworkService implements OnModuleInit {
  private readonly leasePath = '/var/lib/dhcp/dhcpd.leases';
  private watcher: chokidar.FSWatcher | null = null;

  constructor(
    private readonly networkDetailService: NetworkDetailsService,
  ) {}

  private formatMac(mac: string): string {
    return mac.toLowerCase();
  }

  async onModuleInit() {
    const natCommand = 'sudo iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE';
    await runLinuxCommand(natCommand);
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
