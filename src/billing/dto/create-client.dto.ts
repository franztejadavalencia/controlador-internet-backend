import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  idPerson: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  idClientType: number;
}
