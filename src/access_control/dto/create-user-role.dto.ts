import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idUser: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idRole: number;
}
