import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server } from 'socket.io';
import { NetworkService } from "../services/network.service";

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  transports: ['websocket'],
  path: '/socket.io',
  allowEIO3: true,
})
export class NetworkGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly networkService: NetworkService) {}

  @SubscribeMessage('start_discovery')
  handleStartDiscovery() {
    console.log('Iniciando rastreo de MACs...');
    this.networkService.startLeaseWatch((data) => {
      this.server.emit('new_device_detected', data);
    });
  }

  @SubscribeMessage('stop_discovery')
  handleStopDiscovery() {
    console.log('Deteniendo rastreo.');
    this.networkService.stopLeaseWatch();
  }

  handleDisconnect() {
    this.networkService.stopLeaseWatch();
  }
}