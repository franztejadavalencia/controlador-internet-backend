import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
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

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  idSubscriptionStatus: number;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expirationDate?: Date | null;
}
