import { PartialType } from '@nestjs/swagger';
import { CreateNetworkDetailsDto } from './create-network-details.dto';

export class UpdateNetworkDetailsDto extends PartialType(CreateNetworkDetailsDto) {}
