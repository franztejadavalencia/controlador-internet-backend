import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idRole: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idModule: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  canCreate: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  canRead: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  canUpdate: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  canDelete: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  canRestore: boolean;
}
