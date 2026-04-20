import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLogDto } from './create-log.dto';

export class UpdateLogDto extends PartialType(OmitType(CreateLogDto, ['idUser'] as const)) {}
