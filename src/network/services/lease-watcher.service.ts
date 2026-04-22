import { Injectable, OnModuleInit } from '@nestjs/common';
import * as chokidar from 'chokidar';
import * as fs from 'fs';

@Injectable()
export class LeaseWatcherService implements OnModuleInit {
  private readonly leasePath = '/var/lib/dhcp/dhcpd.leases';

  onModuleInit() {
    console.log('Vigilando conecxiones a NanoStation2...');
    chokidar.watch(this.leasePath).on('change', () => {
      this.parseLeases();
    });
  }

  private parseLeases() {
    const data = fs.readFileSync(this.leasePath, 'utf8');
    const leaseRegex = /lease (\d+\.\d+\.\d+\.\d+) {[\s\S]*?hardware ethernet ([:a-f0-9]+);/g;
    let match;
    while ((match = leaseRegex.exec(data)) !== null) {
      const ip = match[1];
      const mac = match[2];
      console.log(`Nueva conexión: ${ip} - ${mac}`);
    }
  }
}
