import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  idPlan: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  idClient: number;

  @ApiProperty({ example: 'ACTIVO' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  status: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDate()
  expirationDate?: Date | null;
}
