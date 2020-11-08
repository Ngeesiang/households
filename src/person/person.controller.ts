import { Controller, Get, Post, Body, Param, ForbiddenException, Res, HttpStatus } from '@nestjs/common';
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
        return res.status(HttpStatus.OK).json({
          status: 200,
          message: "Person has been created.",
        });
    }
}
