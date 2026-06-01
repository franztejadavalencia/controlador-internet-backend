import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  idSubscription: number;

  @ApiProperty({ example: 109.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2026-12-31T23:59:59.999Z' })
  @IsNotEmpty()
  @IsDate()
  paymentDate: Date;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  montsPayed: number;
}
