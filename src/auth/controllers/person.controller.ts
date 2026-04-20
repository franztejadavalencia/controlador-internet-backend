import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PersonService } from '../services/person.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';

@ApiTags('Person')
@Controller('person')
export class PersonController {
  constructor(private personService: PersonService) {}

  @Get()
  @ApiOperation({ summary: 'Listar personas' })
  getAll() {
    return this.personService.findAll();
  }

  @Get('trash')
  @ApiOperation({ summary: 'Listar personas eliminadas' })
  async getTrashed() {
    return this.personService.findAllTrashed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Listar una persona' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.personService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una persona' })
  create(@Body() payload: CreatePersonDto) {
    return this.personService.create(payload);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una persona' })
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdatePersonDto) {
    return this.personService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una persona' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.personService.delete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaura una persona' })
  async restore(@Param('id', ParseIntPipe) id: number) {
    return await this.personService.restore(id);
  }
}
