import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateNetworkDetailsDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  idSubscription: number;

  @ApiProperty({ example: 'PC' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  deviceHostname: string;

  @ApiProperty({ example: '00:1A:2B:3C:4D:5E' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  macAddress: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  ipAddress: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  idDeviceType: number;
}
