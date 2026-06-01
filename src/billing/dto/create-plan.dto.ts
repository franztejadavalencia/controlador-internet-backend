import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Básico' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({ example: 1024 })
  @IsNumber()
  @Min(0)
  downloadSpeed: number;

  @ApiProperty({ example: 512 })
  @IsNumber()
  @Min(0)
  uploadSpeed: number;

  @ApiProperty({ example: 109.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
