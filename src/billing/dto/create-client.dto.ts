import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateClientDto {
	@ApiProperty({ example: 1 })
	@IsInt()
	@Min(1)
	idPerson: number;

	@ApiProperty({ example: 'RESIDENCIAL' })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	clientType: string;
}