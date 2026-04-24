import { runLinuxCommand } from '@/common/utils/command-runner';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class NetworkService implements OnModuleInit {
  async onModuleInit() {
    const natCommand = 'sudo iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE';
    await runLinuxCommand(natCommand);
  }
}
