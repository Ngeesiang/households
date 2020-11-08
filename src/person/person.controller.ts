import { Controller, Get, Post, Body, Param, ForbiddenException, Res, HttpStatus, Delete } from '@nestjs/common';
import { PersonService } from './person.service';
import { Person } from 'src/entity/person.entity';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('person')
export class PersonController {

    constructor(private personsService: PersonService) {}

    @Get()
    async findAllPersons(): Promise<Person[]> {
      return await this.personsService.getAll()
    }

    @Get('/:person_id')
    async findOnePerson(
      @Param('person_id') id: number): Promise<Person> {
      return await this.personsService.findOne(id)
    }

    @Post()
    async create(@Body() person: Person, @Res() res) {
        const create = await this.personsService.create(person)
        return res.status(HttpStatus.CREATED).json({
          status: 200,
          message: "Person has been created.",
        });
    }

    @Delete('/:person_id')
    async delete(@Param('person_id') personId: number, @Res() res) {
        const deletion = await this.personsService.delete(personId)
        return res.status(HttpStatus.OK).json({
          status: 200,
          message: "Person has been deleted from the household.",
        });
    }
}
