import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateLogDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idUser: number;

  @ApiProperty({ example: '192.168.0.1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  ipAddress: string;

  @ApiProperty({ example: 'CREATE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  action: string;

  @ApiProperty({ example: 'auth' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  module: string;

  @ApiPropertyOptional({ example: 'Usuario creado correctamente' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0 ...' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  userAgent?: string;
}
