import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idPerson: number;

  @ApiProperty({ example: 'jperez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  username: string;

  @ApiProperty({ example: '$2b$10$hash_generado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  passwordHash: string;

  @ApiPropertyOptional({ example: 'JBSWY3DPEHPK3PXP' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  twoFactorSecret?: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  isTwoFactorEnabled: boolean;

  @ApiProperty({ example: 'ACTIVE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  status: string;
}
