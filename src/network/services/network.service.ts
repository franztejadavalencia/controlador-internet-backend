import { Injectable, OnModuleInit } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class NetworkService implements OnModuleInit {
  onModuleInit() {
    console.log('Configurando reglase de red (NAT/Forwarding)...');
    const natCommand = 'sudo iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE';
    const forwardCommand = 'sudo iptables -A FORWARD -j ACCEPT';
    // exec(`${natCommand} && ${forwardCommand}`, (error) => {
    //   if (error) {
    //     console.error(`Error al configurar red: ${error.message}`);
    //     return;
    //   }
    //   console.log('Red configurada con correctamente.');
    // });
  }
}
